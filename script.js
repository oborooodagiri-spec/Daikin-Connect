const fs = require('fs');
const data = [
  { kat: 'VAPORATOR', params: ['Flow Status', 'Leaving Temp', 'Entering Temp', 'Delta Temp', 'Approach Temp', 'Saturated Refrigerant Temp', 'Refrigerant Press'] },
  { kat: 'CONDENSER', params: ['Flow Status', 'Leaving Temp', 'Entering Temp', 'Delta Temp', 'Approach Temp', 'Saturated Refrigerant Temp', 'Refrigerant Press'] },
  { kat: 'COMPRESSOR', params: ['Suction Line Temp', 'Discharge Line Temp', 'Liquid Line Temp', 'Oil Feed Temp', 'Oil Feed Press', 'Oil Sump Temp', 'Oil Sump Prees'] },
  { kat: 'SETTING', params: ['Mode', 'Manual value', 'CMV Manual Value', 'CHW Set Point Mode', 'CHW Set Point Manual Value', 'Capacity Limit Set Point', 'Failure Riset'] },
  { kat: 'UNIT STATUS', params: ['Operation Status', 'Squence number', 'Control', 'FP Switch Position', 'CMV Status', 'CMV Fail To Open', 'Status', 'Failt To Start', 'Alarm Exist', 'Fault', 'Active set point', 'Actual Running Capacity %', 'Number Of Start', 'Running Hours'] },
  { kat: 'SYSTEM STATUS', params: ['Mode', 'Manual Value', 'Sistem Stage', 'Average CH RLA', 'Actual Leaving Temp.', 'Actual Return Temp.', 'AHU Qty', 'FCU Qty', 'Power Failure Reset', 'Cooling Load', 'Cooling Load Required', 'Cooling Load Set Point', 'Start Interval Timer', 'Add Temperature', 'Add Delay Timer', 'Subtract Temperature', 'Subtract Delay Timer', 'VCD Frekuensi Hz', 'Diferensial press (kpa)'] }
];

let result = `  const downloadTemplate = () => {\n    const templateData = [\n`;
data.forEach(group => {
  group.params.forEach(param => {
    result += `      {\n        "Nama": "${param}",\n        "Kategori": "${group.kat}",\n        "Sub Kategori": "",\n        "Address": "",\n        "Tipe": "holding",\n        "Data Type": "INT16",\n        "Skala": 1,\n        "Satuan": "",\n      },\n`;
  });
});
result += `    ];\n\n    const ws = XLSX.utils.json_to_sheet(templateData);\n    const wb = XLSX.utils.book_new();\n    XLSX.utils.book_append_sheet(wb, ws, "Template");\n    XLSX.writeFile(wb, "Template_Import_Register_Senayan.xlsx");\n  };`;

fs.writeFileSync('temp_replace.txt', result);
