const fs = require('fs');

const modifyFile = (filePath, buildPathLogic) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Update TreeNode interface to include subtitle
  if (content.includes('interface TreeNode {') && !content.includes('subtitle?: string;')) {
    content = content.replace('name: string;', 'name: string;\n  subtitle?: string;');
  }

  // Replace path loop
  const pathLoopOld = `path.forEach((part, idx) => {
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
      });`;
      
  const pathLoopNew = `path.forEach((partObj, idx) => {
        const { key: pKey, name, subtitle } = partObj;
        currentId += "|" + pKey;
        if (!current.children[pKey]) {
          current.children[pKey] = {
            id: currentId, name: name, subtitle: subtitle, level: idx + 1, values: {}, total: 0, children: {}
          };
          if (idx === 0) {
            current.children[pKey].color = topLevelColor ? topLevelColor(pKey) : "#ccc";
          }
        }
        current = current.children[pKey];
        addValueToNode(current, key, val);
      });`;
      
  if (content.includes(pathLoopOld)) {
    content = content.replace(pathLoopOld, pathLoopNew);
  }

  // Also handle ProjectByStatusModal which has slightly different path logic
  const projectByStatusOld = `path.forEach((part, idx) => {
        currentId += \`|\${part}\`;
        if (!current.children[part]) {
          current.children[part] = {
            id: currentId,
            name: part,
            level: idx + 1,
            values: {},
            total: 0,
            children: {}
          };
          if (idx === 0) { // Status level
            current.children[part].color = STATUS_CONFIG[part]?.color || "#ccc";
          }
        }
        current = current.children[part];
        addValueToNode(current, sortKey, val);
      });`;
      
  const projectByStatusNew = `path.forEach((partObj, idx) => {
        const { key: pKey, name, subtitle } = partObj;
        currentId += \`|\${pKey}\`;
        if (!current.children[pKey]) {
          current.children[pKey] = {
            id: currentId,
            name: name,
            subtitle: subtitle,
            level: idx + 1,
            values: {},
            total: 0,
            children: {}
          };
          if (idx === 0) { // Status level
            current.children[pKey].color = STATUS_CONFIG[pKey]?.color || "#ccc";
          }
        }
        current = current.children[pKey];
        addValueToNode(current, sortKey, val);
      });`;

  if (content.includes(projectByStatusOld)) {
    content = content.replace(projectByStatusOld, projectByStatusNew);
  }

  // Replace path construction block
  const oldPathBlockRegex = /const path = \[[^\]]+\];/;
  content = content.replace(oldPathBlockRegex, buildPathLogic);

  // Update renderTree to display subtitle
  // Find where {node.name} is rendered
  const nameRenderRegex = /\{node\.name\}\s*<\/div>\s*<\/td>/;
  const newNameRender = `<div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: node.level === 3 ? 14 : 13, fontWeight: node.level === 3 ? 800 : (node.level < 3 ? 800 : 500), color: node.level === 3 ? "#1e293b" : "inherit" }}>
                      {node.name}
                    </span>
                    {node.subtitle && (
                      <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
                        {node.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </td>`;
  
  if (content.includes('{node.name}')) {
    // Only replace the specific pattern
    content = content.replace(nameRenderRegex, newNameRender);
  }
  
  // Replace the old render tree name part if it has different formatting (ProjectByStatusModal)
  const pbsRenderRegex = /\{node\.level === 1 \? \(STATUS_CONFIG\[node\.name\]\?\.label \|\| node\.name\) : node\.name\}\s*<\/div>\s*<\/td>/;
  const pbsNewRender = `<div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: node.level === 3 ? 14 : 13, fontWeight: node.level === 3 ? 800 : (node.level < 3 ? 800 : 500), color: node.level === 3 ? "#1e293b" : "inherit" }}>
                      {node.level === 1 ? (STATUS_CONFIG[node.name]?.label || node.name) : node.name}
                    </span>
                    {node.subtitle && (
                      <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
                        {node.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </td>`;
  if (content.match(pbsRenderRegex)) {
    content = content.replace(pbsRenderRegex, pbsNewRender);
  }

  fs.writeFileSync(filePath, content, 'utf8');
};

const sectorPathLogic = `const path = [
        { key: groupKey, name: groupKey },
        { key: d.pic || "Unassigned", name: d.pic || "Unassigned" },
        { key: d.id.toString(), name: d.client_name || "Unknown Customer", subtitle: d.project_name || "Unknown Project" }
      ];`;

modifyFile('src/app/admin/live-data/SectorPipelineModal.tsx', sectorPathLogic);

const categoryPathLogic = `const path = [
        { key: category, name: category },
        { key: d.pic || "Unassigned", name: d.pic || "Unassigned" },
        { key: d.id.toString(), name: d.client_name || "Unknown Customer", subtitle: d.project_name || "Unknown Project" }
      ];`;

modifyFile('src/app/admin/live-data/CategoryPipelineModal.tsx', categoryPathLogic);

const statusPathLogic = `const path = [
        { key: status, name: status },
        { key: d.pic || "Unassigned", name: d.pic || "Unassigned" },
        { key: d.id.toString(), name: d.client_name || "Unknown Customer", subtitle: d.project_name || "Unknown Project" }
      ];`;

modifyFile('src/app/admin/live-data/StatusPipelineModal.tsx', statusPathLogic);

const projectByStatusPathLogic = `const path = [
        { key: d.status || "Unknown Status", name: d.status || "Unknown Status" },
        { key: d.pic || "Unassigned", name: d.pic || "Unassigned" },
        { key: d.id.toString(), name: d.client_name || "Unknown Customer", subtitle: d.project_name || "Unknown Project" }
      ];`;

modifyFile('src/app/admin/live-data/ProjectByStatusModal.tsx', projectByStatusPathLogic);
