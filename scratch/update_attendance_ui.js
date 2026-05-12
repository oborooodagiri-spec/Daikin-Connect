const fs = require('fs');
const path = 'src/components/attendance/AttendanceClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<div className="flex-1 relative flex flex-col items-center justify-center">`;
const replacement = `<div className="flex-1 relative flex flex-col items-center justify-center">
              {!hasFace && (
                 <div className="absolute top-28 left-6 right-6 z-30 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Fingerprint size={24} />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Pendaftaran Wajah</p>
                       <p className="text-[11px] font-bold leading-snug">Foto ini akan didaftarkan sebagai Master Profile untuk akun Anda. Pastikan wajah terlihat jelas.</p>
                    </div>
                 </div>
              )}`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Successfully updated AttendanceClient.tsx');
