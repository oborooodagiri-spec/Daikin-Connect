const fs = require('fs');
let code = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

const targetHook = `  const [showPICLines, setShowPICLines] = useState(false);`;
const hookRep = `  const [showPICLines, setShowPICLines] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);`;
code = code.replace(targetHook, hookRep);

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
