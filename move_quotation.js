const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Recursively find and replace in all files
function replaceInFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            replaceInFiles(fullPath);
        } else if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // Replace boq-builder paths
            if (content.includes('/admin/boq-builder')) {
                content = content.replace(/\/admin\/boq-builder/g, '/admin/quotation/boq-builder');
                updated = true;
            }

            // Replace rate-card paths
            if (content.includes('/admin/database/rate-card')) {
                content = content.replace(/\/admin\/database\/rate-card/g, '/admin/quotation/rate-card');
                updated = true;
            }

            // Fix relative imports in the moved boq-builder pages
            if (fullPath.includes(path.join('quotation', 'boq-builder'))) {
                if (content.includes('../../actions/boq')) {
                    content = content.replace(/\.\.\/\.\.\/actions\/boq/g, '@/app/actions/boq');
                    updated = true;
                }
                if (content.includes('../../../actions/boq')) {
                    content = content.replace(/\.\.\/\.\.\/\.\.\/actions\/boq/g, '@/app/actions/boq');
                    updated = true;
                }
                if (content.includes('../../../actions/pricelist')) {
                    content = content.replace(/\.\.\/\.\.\/\.\.\/actions\/pricelist/g, '@/app/actions/pricelist');
                    updated = true;
                }
            }

            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated paths in ${fullPath}`);
            }
        }
    }
}

replaceInFiles(srcDir);
console.log("Done updating path references.");
