
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/live-data/LiveDataClient.tsx", "utf8");

const start = content.indexOf("  // RENDER: SETTINGS TAB");
const end = content.indexOf("  // MAIN RENDER", start);
const target = content.substring(start, end);

const newRenderSettings = `  // RENDER: SETTINGS TAB
  // ============================================
  const renderSettings = () => (
    <div style={{ display: "flex", flexDirection: "column", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ padding: "24px 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Settings</h2>
        
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          {[
            { title: "Sales PIC", icon: <Users size={18} strokeWidth={2.5} /> },
            { title: "Sales Targets", icon: <Target size={18} strokeWidth={2.5} /> },
            { title: "Partnership Config", icon: <Briefcase size={18} strokeWidth={2.5} /> },
          ].map((item, i, arr) => (
            <div key={i} style={{ 
              display: "flex", alignItems: "center", justifyContent: "space-between", 
              padding: "16px 20px", 
              borderBottom: i === arr.length - 1 ? "none" : "1px solid #f3f4f6", 
              cursor: canClickWidgets ? "pointer" : "default",
              transition: "background 0.15s ease"
            }}
            onClick={() => { 
              if (item.title === "Sales PIC") setShowPICSettingsModal(true); 
              if (item.title === "Sales Targets") setShowTargetSettingsModal(true); 
              if (item.title === "Partnership Config") setShowPartnershipSettingsModal(true);
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", color: "#4b5563" }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{item.title}</div>
              </div>
              <ChevronRight size={18} color="#9ca3af" />
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginTop: 40, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Data Management</h3>
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ 
            display: "flex", alignItems: "center", justifyContent: "space-between", 
            padding: "16px 20px", borderBottom: "1px solid #f3f4f6",
            cursor: canClickWidgets ? "pointer" : "default", transition: "background 0.15s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
          onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", color: "#4b5563" }}>
                <Upload size={18} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Import from Excel</div>
            </div>
            <ChevronRight size={18} color="#9ca3af" />
          </div>

          <div style={{ 
            display: "flex", alignItems: "center", justifyContent: "space-between", 
            padding: "16px 20px", 
            cursor: canClickWidgets ? "pointer" : "default", transition: "background 0.15s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
          onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", color: "#4b5563" }}>
                <Download size={18} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Export to Excel</div>
            </div>
            <ChevronRight size={18} color="#9ca3af" />
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
`;

content = content.replace(target, newRenderSettings);
fs.writeFileSync("src/app/admin/live-data/LiveDataClient.tsx", content);
console.log("Replaced renderSettings!");

