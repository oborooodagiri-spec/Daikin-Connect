const fs = require('fs');
let c = fs.readFileSync('src/app/admin/live-data/StatusPipelineModal.tsx', 'utf8');

c = c.replace(
  'const [selectedFY, setSelectedFY] = useState(initialFY);\n  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});\n\n  const toggleNode',
  'const [selectedFY, setSelectedFY] = useState(initialFY);\n  const [showTender, setShowTender] = useState(false);\n  const [showHold, setShowHold] = useState(false);\n  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});\n\n  const toggleNode'
);

c = c.replace(
  'useEffect(() => {\n    if (isOpen) setSelectedFY(initialFY);\n  }, [isOpen, initialFY]);',
  'useEffect(() => {\n    if (isOpen) {\n      setSelectedFY(initialFY);\n      setShowTender(false);\n      setShowHold(false);\n    }\n  }, [isOpen, initialFY]);'
);

c = c.replace(
  '    deals.forEach(d => {\n      if (d.status === \'L\') return; // Exclude lost\n      if (d.is_closed) return;',
  '    deals.forEach(d => {\n      if (d.status === \'L\') return; // Exclude lost\n      if (!showTender && d.status === \'T\') return;\n      if (!showHold && d.status === \'H\') return;\n      if (d.is_closed) return;'
);

c = c.replace(
  '    deals.forEach(d => {\n      if (d.status === \'L\') return;\n\n      \n      const rawDate',
  '    deals.forEach(d => {\n      if (d.status === \'L\') return;\n      if (!showTender && d.status === \'T\') return;\n      if (!showHold && d.status === \'H\') return;\n\n      const rawDate'
);

c = c.replace(
  '    return { columns, rows, totals, grandTotal, chartData, tree: root };\n  }, [deals, selectedFY]);',
  '    return { columns, rows, totals, grandTotal, chartData, tree: root };\n  }, [deals, selectedFY, showTender, showHold]);'
);

c = c.replace(
  '            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>\n              <select',
  '            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>\n              <div style={{ display: "flex", gap: 16, marginRight: 8, paddingRight: 16, borderRight: "1px solid #e2e8f0" }}>\n                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>\n                  <div style={{ position: "relative", width: 32, height: 18, background: showTender ? "#e44258" : "#cbd5e1", borderRadius: 20, transition: "0.3s" }}>\n                    <div style={{ position: "absolute", top: 2, left: showTender ? 16 : 2, width: 14, height: 14, background: "white", borderRadius: "50%", transition: "0.3s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />\n                  </div>\n                  <input type="checkbox" checked={showTender} onChange={(e) => setShowTender(e.target.checked)} style={{ display: "none" }} />\n                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Eng. Review</span>\n                </label>\n                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>\n                  <div style={{ position: "relative", width: 32, height: 18, background: showHold ? "#8d949e" : "#cbd5e1", borderRadius: 20, transition: "0.3s" }}>\n                    <div style={{ position: "absolute", top: 2, left: showHold ? 16 : 2, width: 14, height: 14, background: "white", borderRadius: "50%", transition: "0.3s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />\n                  </div>\n                  <input type="checkbox" checked={showHold} onChange={(e) => setShowHold(e.target.checked)} style={{ display: "none" }} />\n                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Hold</span>\n                </label>\n              </div>\n              <select'
);

fs.writeFileSync('src/app/admin/live-data/StatusPipelineModal.tsx', c);
