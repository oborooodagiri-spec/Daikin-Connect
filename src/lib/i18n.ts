export type Language = 'id' | 'en' | 'ja';

export const DICTIONARY: Record<string, Record<Language, string>> = {
  // Common UI
  "Room / Tenant": { id: "Ruangan / Tenant", en: "Room / Tenant", ja: "部屋 / テナント" },
  "Service Date": { id: "Tanggal Pekerjaan", en: "Service Date", ja: "作業日" },
  "Model Number": { id: "Nomor Model", en: "Model Number", ja: "モデル番号" },
  "Serial Number": { id: "Nomor Seri", en: "Serial Number", ja: "シリアル番号" },
  "Unit Tag Number": { id: "Nomor Tag Unit", en: "Unit Tag Number", ja: "ユニット管理番号" },
  "Unit ID": { id: "ID Unit", en: "Unit ID", ja: "ユニットID" },
  "Capacity": { id: "Kapasitas", en: "Capacity", ja: "容量" },
  "SO / WO Number": { id: "Nomor SO / WO", en: "SO / WO Number", ja: "受注/作業番号" },
  "Visit Number": { id: "Kunjungan Ke", en: "Visit Number", ja: "訪問回数" },
  "Service Team": { id: "Tim Teknisi", en: "Service Team", ja: "作業チーム" },
  "Location": { id: "Lokasi", en: "Location", ja: "設置場所" },
  "Report Prepared By": { id: "Laporan Oleh", en: "Report Prepared By", ja: "報告者" },

  // Audit Labels
  "FORM PENGUKURAN (AUDIT)": { id: "FORM PENGUKURAN (AUDIT)", en: "MEASUREMENT FORM (AUDIT)", ja: "測定フォーム (監査)" },
  "A. GENERAL DATA": { id: "A. DATA UMUM", en: "A. GENERAL DATA", ja: "A. 一般データ" },
  "B. AIR SIDE MEASUREMENTS": { id: "B. PENGUKURAN SISI UDARA", en: "B. AIR SIDE MEASUREMENTS", ja: "B. 空気側測定" },
  "C. WATER SIDE": { id: "C. SISI AIR", en: "C. WATER SIDE", ja: "C. 水側" },
  "D. ELECTRICAL": { id: "D. ELEKTRIKAL", ja: "D. 電気系統", en: "D. ELECTRICAL" },
  "E. COMPONENT & ACCESSORIES CONDITION": { id: "E. KONDISI KOMPONEN & AKSESORIS", en: "E. COMPONENT & ACCESSORIES CONDITION", ja: "E. 部品・付属品の状態" },
  "F. VISUAL NOTES & PHOTOS": { id: "F. CATATAN VISUAL & FOTO", en: "F. VISUAL NOTES & PHOTOS", ja: "F. 視覚的なメモと写真" },

  // Specific Params
  "Supply": { id: "Suplai", en: "Supply", ja: "給気" },
  "Return": { id: "Kembali", en: "Return", ja: "還気" },
  "Fresh Air": { id: "Udara Segar", en: "Fresh Air", ja: "外気" },
  "Air Velocity": { id: "Kecepatan Udara", en: "Air Velocity", ja: "風速" },
  "Leaving Coil Temp": { id: "Suhu Koil Keluar", en: "Leaving Coil Temp", ja: "コイル出口温度" },
  "Entering Coil Temp": { id: "Suhu Koil Masuk", en: "Entering Coil Temp", ja: "コイル入口温度" },
  "Room Temp": { id: "Suhu Ruangan", en: "Room Temp", ja: "室温" },
  "Current": { id: "Arus", en: "Current", ja: "電流" },
  "Voltage": { id: "Tegangan", en: "Voltage", ja: "電圧" },
  "Design Cooling Cap": { id: "Desain Kapasitas Pendinginan", en: "Design Cooling Cap.", ja: "設計冷房能力" },
  "Design Air Flow": { id: "Desain Aliran Udara", en: "Design Air Flow", ja: "設計風量" },

  // Maintenance Scope
  "Maintenance Scope of Work": { id: "Ruang Lingkup Pekerjaan", en: "Maintenance Scope of Work", ja: "メンテナンス作業範囲" },
  "Parts & Components Information": { id: "Informasi Part & Komponen", en: "Parts & Components Information", ja: "部品およびコンポーネント情報" },
  "Technical Advice & Summary": { id: "Saran Teknis & Ringkasan", en: "Technical Advice & Summary", ja: "技術的なアドバイスと要約" },
  "Before": { id: "Sebelum", en: "Before", ja: "前" },
  "After": { id: "Sesudah", en: "After", ja: "後" },
  "Result": { id: "Hasil", en: "Result", ja: "結果" },
  "Margin / Result": { id: "Margin / Hasil", en: "Margin / Result", ja: "差異 / 結果" },

  // Components
  "Unit Fincoil": { id: "Fincoil Unit", en: "Unit Fincoil", ja: "ユニットフィンコイル" },
  "Unit Drain Pan": { id: "Drain Pan Unit", en: "Unit Drain Pan", ja: "ユニットドレンパン" },
  "Unit Blower Fan": { id: "Blower Fan Unit", en: "Unit Blower Fan", ja: "ユニットブロワーファン" },
  "Inlet Condition": { id: "Kondisi Inlet", en: "Inlet Condition", ja: "入口状態" },
  "Outlet Condition": { id: "Kondisi Outlet", en: "Outlet Condition", ja: "出口状態" },

  // Footer
  "PREPARED BY": { id: "DISIAPKAN OLEH", en: "PREPARED BY", ja: "作成者" },
  "REVIEWED BY": { id: "DITINJAU OLEH", en: "REVIEWED BY", ja: "承認者" },
  "WITNESSED BY": { id: "DISAKSIKAN OLEH", en: "WITNESSED BY", ja: "立会人" },
  "INTERNAL ENGINEER": { id: "ENGINEER INTERNAL", en: "INTERNAL ENGINEER", ja: "社内エンジニア" },
  "CUSTOMER PIC": { id: "PIC PELANGGAN", en: "CUSTOMER PIC", ja: "顧客担当者" },

  // Common Values
  "Normal": { id: "Normal", en: "Normal", ja: "正常" },
  "Warning": { id: "Peringatan", en: "Warning", ja: "警告" },
  "Problem": { id: "Masalah", en: "Problem", ja: "問題" },
  "Critical": { id: "Kritis", en: "Critical", ja: "重大" },
  "GOOD": { id: "BAIK", en: "GOOD", ja: "良好" },
  "BAD": { id: "BURUK", en: "BAD", ja: "不良" },
  "DEFECT": { id: "CACAT", en: "DEFECT", ja: "欠陥" },
  "OK": { id: "OK", en: "OK", ja: "OK" },
  "DONE": { id: "SELESAI", en: "DONE", ja: "完了" },
  "NOT DONE": { id: "BELUM SELESAI", en: "NOT DONE", ja: "未完了" },
  "N/A": { id: "N/A", en: "N/A", ja: "N/A" }
};

export function t(key: string, lang: Language): string {
  if (!DICTIONARY[key]) return key;
  return DICTIONARY[key][lang] || DICTIONARY[key]['en'] || key;
}
