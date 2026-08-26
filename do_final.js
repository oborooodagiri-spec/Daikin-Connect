const fs = require('fs');
let code = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

const targetStr = `return (
    <div style={{ position: "relative", width: "100%", height: 600, borderRadius: 24, overflow: "hidden", background: "#c8e6f5" }}>`;

const repStr = `return (
    <div className="hidden md:block" style={{ position: "relative", width: "100%", height: 600, borderRadius: 24, overflow: "hidden", background: "#c8e6f5" }}>`;

code = code.replace(targetStr, repStr);

const mapTarget = `<div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <LeafletMap`;
const mapRep = `<div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            {!isMobile && (
              <LeafletMap`;
code = code.replace(mapTarget, mapRep);

const endTarget = `currentZoomLevel={currentZoomLevel}
            />
          </div>`;
const endRep = `currentZoomLevel={currentZoomLevel}
              />
            )}
          </div>`;
code = code.replace(endTarget, endRep);

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', code, 'utf8');
