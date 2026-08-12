const fs = require('fs');

const modifyFile = (filePath, buildPathLogic) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add TreeNode interface if not exists
  if (!content.includes('interface TreeNode')) {
    content = content.replace('interface Deal {', `interface TreeNode {
  id: string;
  name: string;
  level: number;
  values: Record<string, number>;
  total: number;
  children: Record<string, TreeNode>;
  color?: string;
}

interface Deal {`);
  }

  // Add expandedNodes state
  if (!content.includes('const [expandedNodes')) {
    // Sector and Category have showHold, Status has selectedFY only (Wait, Status has no showHold)
    if (content.includes('const [showHold')) {
      content = content.replace('const [showHold, setShowHold] = useState(false);', `const [showHold, setShowHold] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };`);
    } else {
      content = content.replace('const [selectedFY, setSelectedFY] = useState(initialFY);', `const [selectedFY, setSelectedFY] = useState(initialFY);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };`);
    }
  }

  // Replace rows mapping logic with Tree logic
  const returnPattern = /return \{ columns, rows, totals, grandTotal, chartData \};/g;
  
  if (!content.includes('const root: TreeNode')) {
    const treeBuildLogic = `
    const root: TreeNode = {
      id: "root", name: "Root", level: 0, values: {}, total: 0, children: {}
    };

    const addValueToNode = (node: TreeNode, colKey: string, val: number) => {
      node.values[colKey] = (node.values[colKey] || 0) + val;
      node.total += val;
    };

    deals.forEach(d => {
      if (d.status === 'L') return;
      if (typeof showTender !== 'undefined' && !showTender && d.status === 'T') return;
      if (typeof showHold !== 'undefined' && !showHold && d.status === 'H') return;
      
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return;
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;

      const mYear = dt.getFullYear();
      const key = \`\${mYear}-\${String(dt.getMonth() + 1).padStart(2, '0')}\`;
      if (!colSet.has(key)) return; 
      
      const val = Number(d.quotation || 0);
      ${buildPathLogic}
      
      addValueToNode(root, key, val);
      let current = root;
      let currentId = "root";

      path.forEach((part, idx) => {
        currentId += "|" + part;
        if (!current.children[part]) {
          current.children[part] = {
            id: currentId, name: part, level: idx + 1, values: {}, total: 0, children: {}
          };
          if (idx === 0) {
            current.children[part].color = topLevelColor(part);
          }
        }
        current = current.children[part];
        addValueToNode(current, key, val);
      });
    });

    return { columns, rows, totals, grandTotal, chartData, tree: root };`;

    content = content.replace(returnPattern, treeBuildLogic);
  }

  // Add ChevronDown and ChevronRight to lucide-react imports if missing
  if (!content.includes('ChevronDown')) {
    content = content.replace('} from "lucide-react";', ', ChevronDown, ChevronRight } from "lucide-react";');
  }

  // Replace tbody mapping
  const tbodyRegex = /<tbody>[\s\S]*?<\/tbody>/;
  const renderTreeFn = `
  const renderTree = (nodes: Record<string, TreeNode>) => {
    return Object.values(nodes)
      .sort((a, b) => {
        // Sort level 1 according to original logic if needed, otherwise alphabetical
        return a.name.localeCompare(b.name);
      })
      .map(node => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = !!expandedNodes[node.id];
        const paddingLeft = node.level === 1 ? 8 : (node.level - 1) * 24 + 8;

        return (
          <React.Fragment key={node.id}>
            <tr style={{ background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseOut={(e) => e.currentTarget.style.background = node.level % 2 === 1 ? "#ffffff" : "#fafafa"}>
              <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 500, color: node.level < 3 ? "#323338" : "#475569", borderRight: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", paddingLeft }}>
                  {hasChildren ? (
                    <button onClick={() => toggleNode(node.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, marginRight: 8, color: "#676879", borderRadius: 4 }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <div style={{ width: 32 }} />
                  )}
                  {node.level === 1 && <div style={{ width: 12, height: 12, borderRadius: "50%", background: node.color || "#ccc", marginRight: 8 }} />}
                  {node.name}
                </div>
              </td>
              {columns.map(col => (
                <td key={col.key} style={{ padding: "10px 12px", fontSize: 13, fontWeight: node.level < 3 ? 700 : 500, color: node.values[col.key] > 0 ? (node.level < 3 ? "#0f172a" : "#334155") : "#cbd5e1", textAlign: "right", borderRight: "1px dashed #f1f5f9" }}>
                  {node.values[col.key] > 0 ? formatRp(node.values[col.key]) : "-"}
                </td>
              ))}
              <td style={{ padding: "10px 24px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc" }}>
                {formatRp(node.total)}
              </td>
            </tr>
            {isExpanded && hasChildren && renderTree(node.children)}
          </React.Fragment>
        );
      });
  };

  `;

  if (!content.includes('const renderTree =')) {
    content = content.replace('const formatRp = (val: number) => {', renderTreeFn + 'const formatRp = (val: number) => {');
  }

  content = content.replace(tbodyRegex, `<tbody>
                    {tree && Object.keys(tree.children).length > 0 ? renderTree(tree.children) : (
                      <tr>
                        <td colSpan={columns.length + 2} style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: 14 }}>
                          No project data available in FY{selectedFY}
                        </td>
                      </tr>
                    )}
                  </tbody>`);

  fs.writeFileSync(filePath, content, 'utf8');
};

const sectorPathLogic = `
      const status = d.status || "Unknown";
      let category = d.category || "Others";
      if (category.toLowerCase().startsWith("cont")) category = "Control";
      const groupKey = viewMode === "status" ? status : category;

      const topLevelColor = (name) => {
        if (viewMode === "status") {
          return {'A': '#10b981', 'B': '#3b82f6', 'C': '#8b5cf6', 'D': '#f59e0b', 'E': '#ef4444', 'T': '#f97316', 'H': '#64748b'}[name] || '#ccc';
        } else {
          return {'EPL': '#fdab3d', 'RC': '#7b2cbf', 'IAQ': '#00c875', 'Control': '#0073ea', 'VES': '#e44258', 'Others': '#94a3b8'}[name] || '#ccc';
        }
      };

      const path = [
        groupKey,
        d.pic || "Unassigned",
        d.client_name || "Unknown Customer",
        d.project_name || "Unknown Project"
      ];
`;

modifyFile('src/app/admin/live-data/SectorPipelineModal.tsx', sectorPathLogic);

const categoryPathLogic = `
      let category = d.category || "Others";
      if (category.toLowerCase().startsWith("cont")) category = "Control";

      const topLevelColor = (name) => {
        return {'EPL': '#fdab3d', 'RC': '#7b2cbf', 'IAQ': '#00c875', 'Control': '#0073ea', 'VES': '#e44258', 'Others': '#94a3b8'}[name] || '#ccc';
      };

      const path = [
        category,
        d.pic || "Unassigned",
        d.client_name || "Unknown Customer",
        d.project_name || "Unknown Project"
      ];
`;

modifyFile('src/app/admin/live-data/CategoryPipelineModal.tsx', categoryPathLogic);

const statusPathLogic = `
      const status = d.status || "Unknown";

      const topLevelColor = (name) => {
        return {'A': '#10b981', 'B': '#3b82f6', 'C': '#8b5cf6', 'D': '#f59e0b', 'E': '#ef4444', 'T': '#f97316', 'H': '#64748b'}[name] || '#ccc';
      };

      const path = [
        status,
        d.pic || "Unassigned",
        d.client_name || "Unknown Customer",
        d.project_name || "Unknown Project"
      ];
`;

modifyFile('src/app/admin/live-data/StatusPipelineModal.tsx', statusPathLogic);
