import os

filepath = 'src/app/admin/modbus/[id]/RegisterClient.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

with open('temp_replace.txt', 'r', encoding='utf-8') as f:
    replacement = f.read()

target = '''  const downloadTemplate = () => {
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
  };'''

new_content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Replaced successfully!")
