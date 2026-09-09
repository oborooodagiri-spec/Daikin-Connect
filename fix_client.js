
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/database/logsheet-roesmin/LogsheetRoesminClient.tsx", "utf8");

// Add state
const stateStr = `  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>("");`;
const newStateStr = `  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>("");
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const downloadAllPDFs = (items: any[]) => {
    if (!items || items.length === 0) return;
    if (!confirm("Download " + items.length + " report PDF secara berurutan? (Mungkin browser akan meminta izin untuk download multiple file, mohon klik Allow/Izinkan)")) return;
    
    setIsBatchDownloading(true);
    setDownloadProgress(0);
    setTotalDownloads(items.length);
    
    let currentIndex = 0;
    
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    
    const listener = (event: MessageEvent) => {
      if (event.data && event.data.type === "DOWNLOAD_COMPLETE") {
        currentIndex++;
        setDownloadProgress(currentIndex);
        
        if (currentIndex < items.length) {
           iframe.src = \`/reports/preventive/\${items[currentIndex].id}?autoDownload=true\`;
        } else {
           window.removeEventListener("message", listener);
           if (document.body.contains(iframe)) document.body.removeChild(iframe);
           setIsBatchDownloading(false);
        }
      }
    };
    
    window.addEventListener("message", listener);
    
    // Start first
    iframe.src = \`/reports/preventive/\${items[0].id}?autoDownload=true\`;
  };`;

// Add UI
const uiStr = `              <div className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-2xl shadow-sm">`;
const newUiStr = `              {isBatchDownloading && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl mb-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-bold">Mendownload file \${downloadProgress + 1} dari \${totalDownloads}...</span>
                  </div>
                  <span className="text-sm font-semibold">Mohon jangan tutup halaman ini.</span>
                </div>
              )}

              <div className="flex justify-end mb-2 mt-4">
                <button
                  disabled={isBatchDownloading || !grouped[displayMonth] || grouped[displayMonth].length === 0}
                  onClick={() => downloadAllPDFs(grouped[displayMonth])}
                  className="px-4 py-2.5 bg-[#00a1e4] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#008cc7] transition-all disabled:opacity-50"
                >
                  <Download size={18} /> Download All ({grouped[displayMonth]?.length || 0})
                </button>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-2xl shadow-sm mt-4">`;

if(content.includes(stateStr)) {
  content = content.replace(stateStr, newStateStr);
}

if(content.includes(uiStr)) {
  content = content.replace(uiStr, newUiStr);
}

fs.writeFileSync("src/app/admin/database/logsheet-roesmin/LogsheetRoesminClient.tsx", content);
console.log("Client patched!");

