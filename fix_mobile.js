const fs = require('fs');
let code = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

const hookInject = `  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);`;

code = code.replace(`  const [activeTab, setActiveTab] = useState("dashboard");`, hookInject);

const targetStr = `<div className="hidden md:block" style={{ position: "relative", width: "100%", height: 600, borderRadius: 24, overflow: "hidden", background: "#c8e6f5" }}>`;
const replacement = `{!isMobile && (
      <div style={{ position: "relative", width: "100%", height: 600, borderRadius: 24, overflow: "hidden", background: "#c8e6f5" }}>`;

code = code.replace(targetStr, replacement);

// We need to find where this div closes.
// The div has a `<style>` inside it, then title & controls, then project list, then LeafletMap.
// Let's use regex or string replace to find the end of this div.
// It's easier to find the next section and put `)}` before it.
const nextSection = `{/* Regional Stats Bottom Panel */}`;
code = code.replace(nextSection, `)}
      {/* Regional Stats Bottom Panel */}`);

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', code, 'utf8');
