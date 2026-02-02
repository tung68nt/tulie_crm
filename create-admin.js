const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('Error: .env.local file not found!');
            process.exit(1);
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (error) {
        console.error('Error reading .env.local:', error);
        process.exit(1);
    }
}

async function createAdmin() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node create-admin.js <email> <password> [full_name]');
        process.exit(1);
    }

    const email = args[0];
    const password = args[1];
    const fullName = args[2] || 'Admin User';

    console.log(`Checking user: ${email}...`);

    const env = loadEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Error: Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        let userId;

        // 1. Try to find existing user by email
        // Note: listUsers() retrieves a page of users. If you have thousands of users, this simple find might miss them.
        // But for a CRM startup/dev setup, it's fine. 
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = listData.users.find(u => u.email === email);

        if (existingUser) {
            console.log('User found in system. Updating credentials...');
            userId = existingUser.id;

            // Update password
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password: password,
                user_metadata: { full_name: fullName }
            });

            if (updateError) throw updateError;
            console.log('Password updated successfully.');

        } else {
            console.log('User not found. Creating new account...');
            const { data: createData, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
            });

            if (createError) throw createError;
            userId = createData.user.id;
            console.log('Created new auth user successfully.');
        }

        // 2. Assign 'admin' role in public table
        console.log(`Assigning 'admin' role for ID: ${userId}...`);

        // Try 'users' table
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                full_name: fullName,
                role: 'admin',
                is_active: true,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });

        if (upsertError) {
            console.log(`Warning: Failed to update 'users' table (${upsertError.message}).`);
            console.log("Attempting to fallback to 'profiles' table just in case...");

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: email,
                    full_name: fullName,
                    role: 'admin',
                }, { onConflict: 'id' });

            if (profileError) {
                // Check if it's because the table doesn't exist
                console.error("Could not update role in database tables. You may need to update the role manually in Supabase Dashboard -> Table Editor.");
                console.error("Auth account IS created/updated, so you can login, but might lack permissions.");
            } else {
                console.log("Updated role in 'profiles' table.");
            }
        } else {
            console.log("Updated role in 'users' table.");
        }

        console.log('---------------------------------------------------');
        console.log('✅ Admin setup complete!');
        console.log(`Login Email: ${email}`);
        console.log(`Login Password: ${password}`);
        console.log('---------------------------------------------------');

    } catch (err) {
        console.error('Failed to configure admin:', err.message);
        process.exit(1);
    }
}

createAdmin();
