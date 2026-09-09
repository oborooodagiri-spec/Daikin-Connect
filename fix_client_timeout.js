
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/database/logsheet-roesmin/LogsheetRoesminClient.tsx", "utf8");

const oldCode = `    const listener = (event: MessageEvent) => {
      if (event.data && event.data.type === "DOWNLOAD_COMPLETE") {
        currentIndex++;
        setDownloadProgress(currentIndex);
        
        if (currentIndex < items.length) {
           iframe.src = \\\`/reports/preventive/\\\${items[currentIndex].id}?autoDownload=true\\\`;
        } else {
           window.removeEventListener("message", listener);
           if (document.body.contains(iframe)) document.body.removeChild(iframe);
           setIsBatchDownloading(false);
        }
      }
    };
    
    window.addEventListener("message", listener);
    
    // Start first
    iframe.src = \\\`/reports/preventive/\\\${items[0].id}?autoDownload=true\\\`;`;

const newCode = `    let timeoutId: any;

    const nextDownload = () => {
      currentIndex++;
      setDownloadProgress(currentIndex);
      
      if (currentIndex < items.length) {
         iframe.src = \`/reports/preventive/\${items[currentIndex].id}?autoDownload=true\`;
         resetTimeout();
      } else {
         window.removeEventListener("message", listener);
         clearTimeout(timeoutId);
         if (document.body.contains(iframe)) document.body.removeChild(iframe);
         setIsBatchDownloading(false);
      }
    };

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Give each PDF up to 25 seconds to generate and download
      timeoutId = setTimeout(() => {
        console.warn("Download timed out for item", currentIndex);
        nextDownload();
      }, 25000);
    };

    const listener = (event: MessageEvent) => {
      if (event.data && event.data.type === "DOWNLOAD_COMPLETE") {
        nextDownload();
      }
    };
    
    window.addEventListener("message", listener);
    
    // Start first
    iframe.src = \`/reports/preventive/\${items[0].id}?autoDownload=true\`;
    resetTimeout();`;

if (content.includes(oldCode.substring(0, 50))) {
  console.log("Found block, replacing...");
  // I will just use replace with regex to be safe
  const regex = /const listener = \(event: MessageEvent\) => \{[\s\S]*iframe\.src = `\/reports\/preventive\/\$\{items\[0\]\.id\}\?autoDownload=true`;/m;
  content = content.replace(regex, newCode);
  fs.writeFileSync("src/app/admin/database/logsheet-roesmin/LogsheetRoesminClient.tsx", content);
  console.log("Success");
} else {
  console.log("Block not found");
}

