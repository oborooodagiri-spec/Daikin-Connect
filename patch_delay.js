
const fs = require("fs");
const file = "src/app/admin/database/logsheet-roesmin/LogsheetRoesminClient.tsx";
let content = fs.readFileSync(file, "utf8");

const oldCode = `    const listener = (event: MessageEvent) => {
      if (event.data && event.data.type === "DOWNLOAD_COMPLETE") {
        nextDownload();
      }
    };`;

const newCode = `    const listener = (event: MessageEvent) => {
      if (event.data && event.data.type === "DOWNLOAD_COMPLETE") {
        // Hentikan timer 90 detik agar tidak keburu ter-trigger saat jeda
        if (timeoutId) clearTimeout(timeoutId);
        
        // Jeda 2.5 detik sebelum menghapus iframe dan lanjut ke file berikutnya.
        // Sangat krusial agar Chrome Download Manager punya waktu untuk menangkap
        // instruksi download dari dalam iframe sebelum iframe tersebut dihapus.
        setTimeout(() => {
          nextDownload();
        }, 2500);
      }
    };`;

if(content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Patched delay successfully");
} else {
    console.log("Could not find code block to patch");
}

