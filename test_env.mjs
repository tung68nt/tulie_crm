import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Exists" : "MISSING")
console.log("KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Exists" : "MISSING")
