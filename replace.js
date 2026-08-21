const fs = require('fs');

const filepath = 'src/app/admin/modbus/[id]/RegisterClient.tsx';
let content = fs.readFileSync(filepath, 'utf8');
const replacement = fs.readFileSync('temp_replace.txt', 'utf8');

const target = `  const downloadTemplate = () => {
    const templateData = [
      {
        "Nama": "Chiller 1 Temp",
        "Kategori": "Chiller",
        "Sub Kategori": "Suhu",
        "Address": 100,
        "Tipe": "holding",
        "Data Type": "INT16",
        "Skala": 0.1,
        "Satuan": "°C",
      },
      {
        "Nama": "Chiller 1 Power",
        "Kategori": "Chiller",
        "Sub Kategori": "Listrik",
        "Address": 102,
        "Tipe": "input",
        "Data Type": "FLOAT32",
        "Skala": 1,
        "Satuan": "kW",
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Register.xlsx");
  };`;

content = content.replace(target, replacement);
fs.writeFileSync(filepath, content, 'utf8');
console.log("Replaced successfully via Node!");
