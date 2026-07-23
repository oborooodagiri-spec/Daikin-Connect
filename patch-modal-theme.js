const fs = require('fs');
let code = fs.readFileSync('src/app/admin/live-data/PresentationModal.tsx', 'utf8');

// Container
code = code.replace(/backgroundColor: "rgba\(10, 22, 40, 0\.97\)"/g, 'backgroundColor: "rgba(245, 246, 248, 0.98)"');
code = code.replace(/color: "white"/g, 'color: "#323338"');

// Header
code = code.replace(/borderBottom: "1px solid rgba\(255,255,255,0\.08\)"/g, 'borderBottom: "1px solid #e8e8e8"');
code = code.replace(/color: "rgba\(255,255,255,0\.55\)"/g, 'color: "#676879"');
code = code.replace(/background: "rgba\(255,255,255,0\.06\)"/g, 'background: "white"');
code = code.replace(/border: "1px solid rgba\(255,255,255,0\.1\)"/g, 'border: "1px solid #e8e8e8"');
code = code.replace(/currentTarget\.style\.background = "rgba\(255,255,255,0\.15\)"/g, 'currentTarget.style.background = "#f1f5f9"');
code = code.replace(/currentTarget\.style\.background = "rgba\(255,255,255,0\.06\)"/g, 'currentTarget.style.background = "white"');
// X icon uses parent color or inherits, it's currently hardcoded in button style maybe? No, X uses color: white inherited, but button has `color: "white"`.
code = code.replace(/cursor: "pointer", color: "white"/g, 'cursor: "pointer", color: "#676879"');

// Summary Strip
code = code.replace(/background: "rgba\(255,255,255,0\.04\)"/g, 'background: "white"');
code = code.replace(/border: "1px solid rgba\(255,255,255,0\.08\)"/g, 'border: "1px solid #e8e8e8"');
code = code.replace(/color: "rgba\(255,255,255,0\.4\)"/g, 'color: "#676879"');

// Search + Status tags
code = code.replace(/color="rgba\(255,255,255,0\.4\)"/g, 'color="#676879"');
code = code.replace(/background: "rgba\(255,255,255,0\.06\)"/g, 'background: "white"');
code = code.replace(/border: "1px solid rgba\(255,255,255,0\.1\)"/g, 'border: "1px solid #e8e8e8"');
code = code.replace(/color: "white", fontSize: 13/g, 'color: "#323338", fontSize: 13');

// Monthly Groups
code = code.replace(/color: "rgba\(255,255,255,0\.3\)"/g, 'color: "#676879"');
code = code.replace(/color: "rgba\(255,255,255,0\.45\)"/g, 'color: "#676879"');
code = code.replace(/color="rgba\(255,255,255,0\.5\)"/g, 'color="#676879"');
code = code.replace(/background: "rgba\(255,255,255,0\.02\)"/g, 'background: "white"');
code = code.replace(/border: "1px solid rgba\(255,255,255,0\.06\)"/g, 'border: "1px solid #e8e8e8"');
code = code.replace(/borderBottom: "1px solid rgba\(255,255,255,0\.06\)"/g, 'borderBottom: "1px solid #e8e8e8"');
code = code.replace(/color: "rgba\(255,255,255,0\.35\)"/g, 'color: "#676879"');
code = code.replace(/borderBottom: "1px solid rgba\(255,255,255,0\.04\)"/g, 'borderBottom: "1px solid #e8e8e8"');
code = code.replace(/currentTarget\.style\.background = isOverdue \? "rgba\(239,68,68,0\.14\)" : "rgba\(255,255,255,0\.03\)"/g, 'currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.14)" : "#f8fafc"');
code = code.replace(/color: "rgba\(255,255,255,0\.5\)"/g, 'color: "#676879"');
code = code.replace(/color: "rgba\(255,255,255,0\.8\)"/g, 'color: "#323338"');
code = code.replace(/color: "rgba\(255,255,255,0\.2\)"/g, 'color: "#94a3b8"');

// PIC Summary
code = code.replace(/background: "rgba\(255,255,255,0\.03\)"/g, 'background: "white"');
code = code.replace(/color: "rgba\(255,255,255,0\.5\)"/g, 'color: "#676879"');
code = code.replace(/color: "rgba\(255,255,255,0\.8\)"/g, 'color: "#323338"');
code = code.replace(/color: "rgba\(255,255,255,0\.7\)"/g, 'color: "#676879"');

fs.writeFileSync('src/app/admin/live-data/PresentationModal.tsx', code);
console.log('✅ Theme patched');
