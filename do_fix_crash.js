const fs = require('fs');
let code = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

const hookInject = `  const [showPICLines, setShowPICLines] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);`;

code = code.replace(`  const [showPICLines, setShowPICLines] = useState(false);`, hookInject);

const mapTarget = `<LeafletMap 
              clusters={clusters}`;
const mapReplacement = `{!isMobile && <LeafletMap 
              clusters={clusters}`;

code = code.replace(mapTarget, mapReplacement);

const mapTargetEnd = `currentZoomLevel={currentZoomLevel}
            />`;
const mapReplacementEnd = `currentZoomLevel={currentZoomLevel}
            />}`;

code = code.replace(mapTargetEnd, mapReplacementEnd);

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', code, 'utf8');
