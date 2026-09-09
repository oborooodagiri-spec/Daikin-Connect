
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/live-data/DealFormModal.tsx", "utf8");

const start = content.indexOf("<select name=\"sales_planner\"");
const end = content.indexOf("</select>", start) + 9;
const oldSelectBlock = content.substring(start, end);

const newSelectBlock = `
                    <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-[140px] overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {partnershipPICs.map(name => {
                          const selectedPartners = formData.sales_planner ? formData.sales_planner.split(",").map(s => s.trim()).filter(s => s) : [];
                          const isSelected = selectedPartners.includes(name);
                          return (
                            <div 
                              key={name}
                              onClick={() => {
                                let newPartners = [...selectedPartners];
                                if (isSelected) newPartners = newPartners.filter(n => n !== name);
                                else newPartners.push(name);
                                handleChange({ target: { name: "sales_planner", value: newPartners.join(", ") } } as any);
                              }}
                              className={\`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 \${isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}\`}
                            >
                              {name === sessionName ? \`\${name} (You)\` : name}
                              {isSelected && <span>?</span>}
                            </div>
                          );
                        })}
                      </div>
                      {partnershipPICs.length === 0 && <div className="text-xs text-slate-400 text-center py-2">No Partnership PICs found</div>}
                    </div>
`;

content = content.replace(oldSelectBlock, newSelectBlock.trim());
fs.writeFileSync("src/app/admin/live-data/DealFormModal.tsx", content);
console.log("Replaced successfully!");

