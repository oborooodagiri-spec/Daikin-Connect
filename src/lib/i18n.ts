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
  "Tag Number": { id: "Nomor Tag", en: "Tag Number", ja: "タグ番号" },
  "Model / Brand": { id: "Model / Merek", en: "Model / Brand", ja: "モデル / ブランド" },
  "Time": { id: "Waktu", en: "Time", ja: "時間" },
  "Department": { id: "Departemen", en: "Department", ja: "部署" },
  "Service Time": { id: "Waktu Pekerjaan", en: "Service Time", ja: "作業時間" },

  // Audit Labels
  "FORM PENGUKURAN (AUDIT)": { id: "FORM PENGUKURAN (AUDIT)", en: "MEASUREMENT FORM (AUDIT)", ja: "測定フォーム (監査)" },
  "A. GENERAL DATA": { id: "A. DATA UMUM", en: "A. GENERAL DATA", ja: "A. 一般データ" },
  "B. AIR SIDE MEASUREMENTS": { id: "B. PENGUKURAN SISI UDARA", en: "B. AIR SIDE MEASUREMENTS", ja: "B. 空気側測定" },
  "C. WATER SIDE": { id: "C. SISI AIR", en: "C. WATER SIDE", ja: "C. 水側" },
  "D. ELECTRICAL": { id: "D. ELEKTRIKAL", ja: "D. 電気系統", en: "D. ELECTRICAL" },
  "E. COMPONENT & ACCESSORIES CONDITION": { id: "E. KONDISI KOMPONEN & AKSESORIS", en: "E. COMPONENT & ACCESSORIES CONDITION", ja: "E. 部品・付属品の状態" },
  "F. VISUAL NOTES & PHOTOS": { id: "F. CATATAN VISUAL & FOTO", en: "F. VISUAL NOTES & PHOTOS", ja: "F. 視覚的なメモと写真" },
  "Design Air Temp": { id: "Desain Suhu Udara", en: "Design Air Temp", ja: "設計空気温度" },
  "Machine Brand": { id: "Merek Mesin", en: "Machine Brand", ja: "機械ブランド" },
  "Machine Type": { id: "Tipe Mesin", en: "Machine Type", ja: "機械タイプ" },
  "Design Cooling Cap.": { id: "Desain Kapasitas Pendinginan", en: "Design Cooling Cap.", ja: "設計冷房能力" },
  "Design Air Flow": { id: "Desain Aliran Udara", en: "Design Air Flow", ja: "設計風量" },
  "Unit ID Area (m2)": { id: "Area Unit ID (m2)", en: "Unit ID Area (m2)", ja: "ユニット面積 (m2)" },

  "Room Temp": { id: "Suhu Ruangan", en: "Room Temp", ja: "室温" },
  "Current": { id: "Arus", en: "Current", ja: "電流" },
  "Voltage": { id: "Tegangan", en: "Voltage", ja: "電圧" },

  // Maintenance Scope
  "Maintenance Scope of Work": { id: "Ruang Lingkup Pekerjaan", en: "Maintenance Scope of Work", ja: "メンテナンス作業範囲" },
  "Parts & Components Information": { id: "Informasi Part & Komponen", en: "Parts & Components Information", ja: "部品およびコンポーネント情報" },
  "Technical Advice & Summary": { id: "Saran Teknis & Ringkasan", en: "Technical Advice & Summary", ja: "技術的なアドバイスと要約" },
  "Before": { id: "Sebelum", en: "Before", ja: "前" },
  "After": { id: "Sesudah", en: "After", ja: "後" },
  "Result": { id: "Hasil", en: "Result", ja: "結果" },
  "Margin / Result": { id: "Margin / Hasil", en: "Margin / Result", ja: "差異 / 結果" },
  "CASE / COMPLAINT": { id: "LAPORAN / KELUHAN", en: "CASE / COMPLAINT", ja: "申告 / 依頼事項" },
  "ROOT CAUSE ANALYSIS": { id: "ANALISIS PENYEBAB UTAMA", en: "ROOT CAUSE ANALYSIS", ja: "原因分析" },
  "TEMPORARY ACTION": { id: "TINDAKAN SEMENTARA", en: "TEMPORARY ACTION", ja: "応急処置" },
  "PERMANENT ACTION": { id: "TINDAKAN PERMANEN", en: "PERMANENT ACTION", ja: "恒久処置" },
  "RECOMMENDATION": { id: "REKOMENDASI", en: "RECOMMENDATION", ja: "提言 / 推奨事項" },
  "Maintenance Documentation Photos": { id: "Foto Dokumentasi Pemeliharaan", en: "Maintenance Documentation Photos", ja: "メンテナンス記録写真" },
  "Last PM Date": { id: "Tanggal PM Terakhir", en: "Last PM Date", ja: "最終PM日" },

  // Components
  "Unit Fincoil": { id: "Fincoil Unit", en: "Unit Fincoil", ja: "ユニットフィンコイル" },
  "Unit Drain Pan": { id: "Drain Pan Unit", en: "Unit Drain Pan", ja: "ユニットドレンパン" },
  "Unit Blower Fan": { id: "Blower Fan Unit", en: "Unit Blower Fan", ja: "ユニットブロワーファン" },
  "Inlet Condition": { id: "Kondisi Inlet", en: "Inlet Condition", ja: "入口状態" },
  "Outlet Condition": { id: "Kondisi Outlet", en: "Outlet Condition", ja: "出口状態" },
  "V-Belt Type / Qty": { id: "Tipe V-Belt / Qty", en: "V-Belt Type / Qty", ja: "Vベルトタイプ / 数量" },
  "Motor Pulley Type": { id: "Tipe Motor Pulley", en: "Motor Pulley Type", ja: "モータープーリータイプ" },
  "Motor Bearing Type / Qty": { id: "Tipe Motor Bearing / Qty", en: "Motor Bearing Type / Qty", ja: "モーターベアリングタイプ / 数量" },
  "Blower Pulley Type": { id: "Tipe Blower Pulley", en: "Blower Pulley Type", ja: "ブロワープーリータイプ" },
  "Blower Bearing Type / Qty": { id: "Tipe Blower Bearing / Qty", en: "Blower Bearing Type / Qty", ja: "ブロワーベアリングタイプ / 数量" },

  // Footer
  "PREPARED BY": { id: "DISIAPKAN OLEH", en: "PREPARED BY", ja: "作成者" },
  "REVIEWED BY": { id: "DITINJAU OLEH", en: "REVIEWED BY", ja: "承認者" },
  "WITNESSED BY": { id: "DISAKSIKAN OLEH", en: "WITNESSED BY", ja: "立会人" },
  "INTERNAL ENGINEER": { id: "ENGINEER INTERNAL", en: "INTERNAL ENGINEER", ja: "社内エンジニア" },
  "CUSTOMER PIC": { id: "PIC PELANGGAN", en: "CUSTOMER PIC", ja: "顧客担当者" },
  "Field Technician": { id: "Teknisi Lapangan", en: "Field Technician", ja: "フィールドエンジニア" },
  "Internal Engineer": { id: "Engineer Internal", en: "Internal Engineer", ja: "社内エンジニア" },
  "Awaiting Review": { id: "Menunggu Peninjauan", en: "Awaiting Review", ja: "確認待ち" },
  "Awaiting Approval": { id: "Menunggu Persetujuan", en: "Awaiting Approval", ja: "承認待ち" },

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
  "N/A": { id: "N/A", en: "N/A", ja: "N/A" },

  // Client Portal
  "Overview": { id: "Ikhtisar", en: "Overview", ja: "概要" },
  "My Assets": { id: "Aset Saya", en: "My Assets", ja: "保有資産" },
  "Work Plan": { id: "Rencana Kerja", en: "Work Plan", ja: "作業計画" },
  "Reports": { id: "Laporan", en: "Reports", ja: "報告書" },
  "Settings": { id: "Pengaturan", en: "Settings", ja: "設定" },
  "CLIENT PORTAL": { id: "PORTAL PELANGGAN", en: "CLIENT PORTAL", ja: "クライアントポータル" },
  "PARTNER PORTAL": { id: "PORTAL MITRA", en: "PARTNER PORTAL", ja: "パートナーポータル" },
  "Project Partner": { id: "Mitra Proyek", en: "Project Partner", ja: "プロジェクトパートナー" },
  "Service Partner": { id: "Mitra Layanan", en: "Service Partner", ja: "サービスパートナー" },
  "Exit Portal": { id: "Keluar Portal", en: "Exit Portal", ja: "ポータルを終了" },
  "Operational Insight Dashboard": { id: "Dasbor Wawasan Operasional", en: "Operational Insight Dashboard", ja: "運用インサイトダッシュボード" },
  "Asset Inventory": { id: "Inventaris Aset", en: "Asset Inventory", ja: "資産インベントリ" },
  "Maintenance Calendar": { id: "Kalender Pemeliharaan", en: "Maintenance Calendar", ja: "メンテナンスカレンダー" },
  "Service History": { id: "Riwayat Layanan", en: "Service History", ja: "サービス履歴" }
};

export function t(key: string, lang: Language): string {
  if (!DICTIONARY[key]) return key;
  return DICTIONARY[key][lang] || DICTIONARY[key]['en'] || key;
}
