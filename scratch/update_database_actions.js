const fs = require('fs');
const path = 'src/app/actions/database.ts';
let content = fs.readFileSync(path, 'utf8');

// Update createResource type
content = content.replace(/visibility: string;[\s\n]+project_id\?: string \| null;/g, 'visibility: string;\n  allowed_users?: string | null;\n  project_id?: string | null;');

// Update updateResource type
// (Already covered by the first replace if they are identical, but let's be safe)
content = content.replace(/visibility: string;[\s\n]+project_id\?: string \| null;/g, 'visibility: string;\n  allowed_users?: string | null;\n  project_id?: string | null;');

fs.writeFileSync(path, content);
console.log('Successfully updated database.ts types');
