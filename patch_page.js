
const fs = require("fs");
const file = "src/app/reports/[type]/[id]/page.tsx";
let content = fs.readFileSync(file, "utf8");

const oldCode = `  // Auto Download Logic for Batching
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const autoDownload = searchParams.get("autoDownload") === "true";
    if (autoDownload && !downloading && !loading) {
      if (error || !data) {
        // If failed to load, skip it
        window.parent.postMessage({ type: "DOWNLOAD_COMPLETE", id: params.id, error: true }, "*");
        return;
      }
      // Small delay to ensure images/fonts are fully loaded
      const timer = setTimeout(async () => {
        await handleDownloadPDF();
        window.parent.postMessage({ type: "DOWNLOAD_COMPLETE", id: params.id }, "*");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [data, loading, downloading, error, params.id]);`;

const newCode = `  // Auto Download Logic for Batching
  const hasAutoDownloaded = React.useRef(false);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const autoDownload = searchParams.get("autoDownload") === "true";
    
    if (autoDownload && !loading && !hasAutoDownloaded.current) {
      if (error || !data) {
        // If failed to load, skip it
        hasAutoDownloaded.current = true;
        window.parent.postMessage({ type: "DOWNLOAD_COMPLETE", id: params.id, error: true }, "*");
        return;
      }
      
      hasAutoDownloaded.current = true;
      // Small delay to ensure images/fonts are fully loaded before capturing
      const timer = setTimeout(async () => {
        await handleDownloadPDF();
        window.parent.postMessage({ type: "DOWNLOAD_COMPLETE", id: params.id }, "*");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [data, loading, error, params.id]);`;

if(content.includes("// Auto Download Logic for Batching")) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Patched page.tsx successfully");
} else {
    console.log("Could not find code block in page.tsx");
}

