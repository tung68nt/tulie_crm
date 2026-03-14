const fs = require('fs');
let code = fs.readFileSync('app/(dashboard)/settings/page.tsx', 'utf-8');

code = code.replace(/bg-orange-100 dark:bg-orange-950\/30/g, 'bg-zinc-100 dark:bg-zinc-800');
code = code.replace(/text-orange-600/g, 'text-zinc-900 dark:text-zinc-100');
code = code.replace(/focus:ring-orange-500\/20/g, 'focus:ring-zinc-500/20');
code = code.replace(/bg-orange-600 hover:bg-orange-700 text-white/g, 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200');
code = code.replace(/shadow-orange-200/g, 'shadow-zinc-200');
code = code.replace(/bg-orange-50\/30 border-orange-100 dark:bg-orange-950\/10 dark:border-orange-900\/30/g, 'bg-zinc-50/30 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800');

code = code.replace(/bg-blue-100 dark:bg-blue-950\/30/g, 'bg-zinc-100 dark:bg-zinc-800');
code = code.replace(/text-blue-600/g, 'text-zinc-900 dark:text-zinc-100');
code = code.replace(/focus:ring-blue-500\/20/g, 'focus:ring-zinc-500/20');
code = code.replace(/bg-blue-600/g, 'bg-zinc-900 dark:bg-zinc-100');

fs.writeFileSync('app/(dashboard)/settings/page.tsx', code);
