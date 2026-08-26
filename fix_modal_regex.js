const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/PartialCloseModal.tsx', 'utf8');

text = text.replace(/<p className="font-bold text-emerald-800">Full Close \(Selesai Sepenuhnya\)<\/p>[\s\S]*?<p className="text-xs text-emerald-600 mt-1 font-medium">Menutup seluruh nilai \{formatRp\(totalQuotation\)\}<\/p>/, '<p className="font-bold text-emerald-800">Full Close</p>');

text = text.replace(/<p className="font-bold text-amber-800">Partial Close \(Tutup Sebagian\)<\/p>[\s\S]*?<p className="text-xs text-amber-600\/80 mt-1 font-medium leading-relaxed">[\s\S]*?Proyek akan dipecah\. Bagian yang di-close akan masuk pencapaian, sisanya tetap open\.[\s\S]*?<\/p>/, '<p className="font-bold text-amber-800">Partial Close</p>');

fs.writeFileSync('src/app/admin/live-data/PartialCloseModal.tsx', text);
