const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/PartialCloseModal.tsx', 'utf8');

text = text.replace('Pilih metode penutupan proyek:', 'Metode closing');

const fullCloseSearch = `<div>\r\n                  <p className="font-bold text-emerald-800">Full Close (Selesai Sepenuhnya)</p>\r\n                  <p className="text-xs text-emerald-600 mt-1 font-medium">Menutup seluruh nilai {formatRp(totalQuotation)}</p>\r\n                </div>`;
const fullCloseReplace = `<div>\n                  <p className="font-bold text-emerald-800">Full Close</p>\n                </div>`;
text = text.replace(fullCloseSearch, fullCloseReplace);
text = text.replace(fullCloseSearch.replace(/\r\n/g, '\n'), fullCloseReplace);

const partialCloseSearch = `<div>\r\n                  <p className="font-bold text-amber-800">Partial Close (Tutup Sebagian)</p>\r\n                  <p className="text-xs text-amber-600/80 mt-1 font-medium leading-relaxed">\r\n                    Proyek akan dipecah. Bagian yang di-close akan masuk pencapaian, sisanya tetap open.\r\n                  </p>\r\n                </div>`;
const partialCloseReplace = `<div>\n                  <p className="font-bold text-amber-800">Partial Close</p>\n                </div>`;
text = text.replace(partialCloseSearch, partialCloseReplace);
text = text.replace(partialCloseSearch.replace(/\r\n/g, '\n'), partialCloseReplace);

fs.writeFileSync('src/app/admin/live-data/PartialCloseModal.tsx', text);
