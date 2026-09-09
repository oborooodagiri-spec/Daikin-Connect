
const fs = require("fs");
const file = "src/app/admin/database/logsheet-roesmin/LogsheetRoesminClient.tsx";
let content = fs.readFileSync(file, "utf8");

const oldCode = `  const downloadAllPDFs = (items: any[]) => {
    if (!items || items.length === 0) return;
    if (!confirm("Download " + items.length + " report PDF secara berurutan? (Mungkin browser akan meminta izin untuk download multiple file, mohon klik Allow/Izinkan)")) return;
    
    setIsBatchDownloading(true);
    setDownloadProgress(0);
    setTotalDownloads(items.length);
    
    let currentIndex = 0;
    
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "1200px";
    iframe.style.height = "100vh";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.zIndex = "-9999";
    document.body.appendChild(iframe);
    
        let timeoutId: any;

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
    resetTimeout();
  };`;

const newCode = `  const downloadAllPDFs = (items: any[]) => {
    if (!items || items.length === 0) return;
    if (!confirm("Download " + items.length + " report PDF secara berurutan? (Proses ini mungkin memakan waktu beberapa menit. Jika browser meminta izin download multiple files, mohon klik Allow/Izinkan)")) return;
    
    setIsBatchDownloading(true);
    setDownloadProgress(0);
    setTotalDownloads(items.length);
    
    let currentIndex = 0;
    let currentIframe: HTMLIFrameElement | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const createIframe = (url: string) => {
      if (currentIframe && document.body.contains(currentIframe)) {
        document.body.removeChild(currentIframe);
      }
      currentIframe = document.createElement("iframe");
      currentIframe.style.position = "fixed";
      currentIframe.style.width = "1200px";
      currentIframe.style.height = "100vh";
      currentIframe.style.opacity = "0";
      currentIframe.style.pointerEvents = "none";
      currentIframe.style.zIndex = "-9999";
      currentIframe.src = url;
      document.body.appendChild(currentIframe);
    };

    const cleanup = () => {
      window.removeEventListener("message", listener);
      if (timeoutId) clearTimeout(timeoutId);
      if (currentIframe && document.body.contains(currentIframe)) {
        document.body.removeChild(currentIframe);
      }
      setIsBatchDownloading(false);
    };

    const nextDownload = () => {
      currentIndex++;
      setDownloadProgress(currentIndex);
      
      if (currentIndex < items.length) {
         createIframe(\`/reports/preventive/\${items[currentIndex].id}?autoDownload=true\`);
         resetTimeout();
      } else {
         cleanup();
      }
    };

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Give each PDF up to 90 seconds to generate and download! (complex pages + low RAM = slow)
      timeoutId = setTimeout(() => {
        console.warn("Download timed out for item", currentIndex);
        nextDownload();
      }, 90000);
    };

    const listener = (event: MessageEvent) => {
      if (event.data && event.data.type === "DOWNLOAD_COMPLETE") {
        nextDownload();
      }
    };
    
    window.addEventListener("message", listener);
    
    // Start first
    createIframe(\`/reports/preventive/\${items[0].id}?autoDownload=true\`);
    resetTimeout();
  };`;

if(content.includes("const downloadAllPDFs = (items: any[]) => {")) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Patched successfully");
} else {
    console.log("Could not find code block to patch");
}

