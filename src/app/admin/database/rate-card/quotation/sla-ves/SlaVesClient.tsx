"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Printer, ShieldCheck, Edit3, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SlaVesClient() {
  const router = useRouter();
  const [slaData, setSlaData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [customContent, setCustomContent] = useState<any>(null);

  // Load from session storage
  useEffect(() => {
    const data = sessionStorage.getItem("pending_sla_data");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setSlaData(parsed);
        
        if (parsed.customContent) {
          setCustomContent(parsed.customContent);
        } else {
          setCustomContent({
            kpis: [
              "Emergency Breakdown Response: Kedatangan teknisi maksimal 4 jam (dalam area Jabodetabek) atau 24 jam (luar kota) sejak pelaporan.",
              "Resolution Time (Minor): Penanganan masalah minor tanpa pergantian sparepart spesifik maksimal 24 jam.",
              "Resolution Time (Major): Penanganan masalah major maksimal 3 hari kerja, tergantung pada ketersediaan suku cadang lokal.",
              "Uptime Target: Kami menargetkan ketersediaan sistem operasional mencapai 98% per tahun setelah pemeliharaan rutin diimplementasikan secara konsisten."
            ],
            terms: [
              "Jam Kerja Layanan: Kunjungan pemeliharaan preventif dilakukan pada jam kerja standar (Senin - Jumat, 08:30 - 17:30). Pekerjaan di luar jam kerja (overtime/weekend) akan dikenakan biaya tambahan sesuai *Rate Card* kecuali telah disepakati lain dalam kontrak.",
              "Pergantian Sparepart: SLA ini mencakup jasa tenaga kerja (labor) untuk preventive maintenance. Harga dan pergantian suku cadang (spare parts) dan material *consumables* (seperti refrigeran, chemical, filter) akan ditawarkan secara terpisah, kecuali tercantum secara eksplisit pada Bill of Quantities (BOQ).",
              "Pelaporan: Setiap kunjungan (baik preventif maupun korektif) akan didokumentasikan melalui Service Report berbasis digital yang dapat diakses oleh pelanggan."
            ],
            sow: {
              Chiller: {
                Monthly: [
                  "Pemeriksaan log parameter operasi (Pressure, Temperature, Ampere, Voltage)",
                  "Pemeriksaan level oli kompresor",
                  "Pemeriksaan visual adanya kebocoran refrigeran",
                  "Pemeriksaan sistem kontrol dan safety devices"
                ],
                Quarterly: [
                  "Pembersihan panel elektrikal dari debu",
                  "Pemeriksaan kekencangan koneksi terminal kabel",
                  "Analisa oli kompresor (opsional jika dibutuhkan)",
                  "Pembersihan kondensor (untuk tipe Air Cooled)"
                ],
                Yearly: [
                  "Megger test kompresor motor",
                  "Kalibrasi sensor pressure dan temperature",
                  "Pembersihan tube kondensor dan evaporator menggunakan chiller tube cleaner (untuk tipe Water Cooled)",
                  "Penggantian filter drier (jika terindikasi kotor)"
                ]
              },
              AHU_FCU: {
                Monthly: [
                  "Pembersihan pre-filter dan pengecekan medium filter",
                  "Pemeriksaan dan pembersihan drain pan serta drain pipe untuk mencegah luapan",
                  "Pemeriksaan putaran fan dan kondisi bearing",
                  "Pemeriksaan visual coil evaporator"
                ],
                Quarterly: [
                  "Pemeriksaan tension dan kondisi V-Belt (penggantian jika aus)",
                  "Greasing pada bearing fan dan motor",
                  "Chemical cleaning pada coil evaporator (coil washing)"
                ],
                Yearly: [
                  "Pemeriksaan kelistrikan motor fan (Megger test)",
                  "Pembersihan menyeluruh ruang dalam (casing) AHU/FCU"
                ]
              },
              AC_Split: {
                Monthly: [
                  "Pembersihan filter udara indoor",
                  "Pemeriksaan visual drainase dan pembersihan ringan",
                  "Pengecekan temperatur udara supply dan return"
                ],
                Quarterly: [
                  "Chemical washing unit indoor (evaporator coil, blower fan, casing)",
                  "Penyemprotan unit outdoor (condenser coil)",
                  "Pemeriksaan tekanan freon dan arus listrik (ampere) kompresor",
                  "Pemeriksaan sambungan kelistrikan"
                ]
              },
              CoolingTower: {
                Monthly: [
                  "Pemeriksaan level air pada basin",
                  "Pembersihan strainer",
                  "Pemeriksaan rotasi dan vibrasi fan motor"
                ],
                Quarterly: [
                  "Kuras (drain) dan pembersihan basin dari lumpur/kotoran",
                  "Pembersihan infill dan sprinkler head",
                  "Pemeriksaan kualitas air dan sistem chemical dosing"
                ],
                Yearly: [
                  "Megger test fan motor",
                  "Greasing bearing motor dan gearbox"
                ]
              },
              Pump: {
                Monthly: [
                  "Pemeriksaan indikasi kebocoran pada mechanical seal",
                  "Pencatatan pressure suction dan discharge",
                  "Pemeriksaan temperatur dan vibrasi bearing",
                  "Pemeriksaan arus (ampere) motor"
                ],
                Quarterly: [
                  "Pemeriksaan dan kalibrasi alignment coupling",
                  "Greasing pada bearing motor dan pompa",
                  "Pembersihan body pompa dan motor"
                ],
                Yearly: [
                  "Megger test pompa motor",
                  "Pengecekan dan penggantian seal jika aus (overhaul minor)"
                ]
              }
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse SLA data", e);
      }
    }
  }, []);

  // Sync customContent to slaData in session storage when saved
  const handleSaveEdit = () => {
    setEditMode(false);
    if (slaData && customContent) {
      const newData = { ...slaData, customContent };
      setSlaData(newData);
      sessionStorage.setItem("pending_sla_data", JSON.stringify(newData));
    }
  };

  // Helper to categorize items robustly
  const getEquipmentType = (item: any) => {
    const name = (item?.item_name || "").toLowerCase();
    const cat = (item?.category || "").toLowerCase();
    
    if (name.includes("chiller") || cat.includes("chiller")) return "Chiller";
    if (name.includes("ahu") || cat.includes("ahu") || name.includes("fcu") || cat.includes("fcu")) return "AHU_FCU";
    if (name.includes("cooling tower") || cat.includes("tower")) return "CoolingTower";
    if (name.includes("pump") || name.includes("pompa") || cat.includes("pump")) return "Pump";
    if (name.includes("split") || name.includes("wall") || name.includes("cassette") || cat.includes("split")) return "AC_Split";
    
    return "AHU_FCU"; // Default fallback
  };

  // Map active items to equipment types
  const coveredEquipment = useMemo(() => {
    if (!slaData?.activeItems) return [];
    const types = new Set<string>();
    slaData.activeItems.forEach((item: any) => {
      types.add(getEquipmentType(item));
    });
    return Array.from(types);
  }, [slaData]);

  const handlePrint = () => {
    if (editMode) {
      alert("Harap simpan Mode Edit terlebih dahulu sebelum mencetak dokumen.");
      return;
    }
    const originalTitle = document.title;
    const customer = slaData?.woForm?.recipient_company?.trim() || "Customer";
    document.title = `SLA_${customer}_${slaData?.woForm?.date}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  if (!slaData || !customContent) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Data Tidak Ditemukan</h2>
          <p className="text-sm font-medium text-slate-500 mb-6">Silakan men-*generate* SLA langsung dari halaman Quotation Creator.</p>
          <Link href="/admin/database/rate-card/quotation" className="px-6 py-3 bg-[#0073ea] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0060c5] transition-colors">
            Kembali ke Quotation
          </Link>
        </div>
      </div>
    );
  }

  const { woForm, contractDuration, serviceFrequency, activeItems } = slaData;
  const visitFrequencyText = serviceFrequency === 12 ? "Bulanan (Monthly)" : 
                             serviceFrequency === 6 ? "Dwi-Bulanan (Bi-Monthly)" :
                             serviceFrequency === 4 ? "Kuartalan (Quarterly)" :
                             serviceFrequency === 2 ? "Semesteran (Semi-Annually)" : "Tahunan (Yearly)";

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-700 flex flex-col lg:flex-row print:bg-white print:text-black print-safe">
      
      {/* LEFT SIDEBAR CONTROLS (no-print) */}
      <div className="w-full lg:w-[350px] lg:border-r border-slate-200 bg-white p-6 flex flex-col gap-6 flex-shrink-0 lg:max-h-screen lg:overflow-y-auto shadow-sm no-print">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#0073ea] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={24} /> SLA Generator
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Value Engineering Services</p>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Customer Company</label>
            <input 
              type="text" 
              value={woForm.recipient_company} 
              onChange={e => setSlaData({...slaData, woForm: {...woForm, recipient_company: e.target.value}})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0073ea]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">PIC Name</label>
            <input 
              type="text" 
              value={woForm.recipient_pic} 
              onChange={e => setSlaData({...slaData, woForm: {...woForm, recipient_pic: e.target.value}})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0073ea]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Contract Duration</label>
            <select 
              value={contractDuration} 
              onChange={e => setSlaData({...slaData, contractDuration: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0073ea]"
            >
              <option value="1 Tahun">1 Tahun</option>
              <option value="2 Tahun">2 Tahun</option>
              <option value="3 Tahun">3 Tahun</option>
              <option value="4 Tahun">4 Tahun</option>
              <option value="5 Tahun">5 Tahun</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Service Frequency</label>
            <select 
              value={serviceFrequency} 
              onChange={e => setSlaData({...slaData, serviceFrequency: parseInt(e.target.value)})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0073ea]"
            >
              <option value={1}>1x Setahun (Tahunan)</option>
              <option value={2}>2x Setahun (Semesteran)</option>
              <option value={4}>4x Setahun (Kuartalan)</option>
              <option value={6}>6x Setahun (Dwi-bulanan)</option>
              <option value={12}>12x Setahun (Bulanan)</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Equipment Covered</label>
            <div className="text-xs font-bold text-slate-600 mt-1">{coveredEquipment.join(", ").replace(/_/g, " ")}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-auto space-y-3">
          {editMode ? (
            <button 
              onClick={handleSaveEdit}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/10 group"
            >
              <Save size={16} className="group-hover:scale-110 transition-transform" /> Simpan Edit Konten
            </button>
          ) : (
            <button 
              onClick={() => setEditMode(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm group"
            >
              <Edit3 size={16} className="text-amber-500 group-hover:scale-110 transition-transform" /> Mode Edit Konten
            </button>
          )}

          <button 
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10 group"
          >
            <Printer size={16} className="group-hover:scale-110 transition-transform" /> Cetak SLA PDF
          </button>
        </div>
      </div>

      {/* RIGHT PREVIEW WORKSPACE */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen bg-slate-100 flex flex-col items-center custom-scrollbar print:bg-white print:p-0 print:overflow-visible print:max-h-none">
        
        {editMode && (
          <div className="w-full max-w-4xl bg-amber-100 text-amber-800 p-4 rounded-xl mb-6 text-sm font-bold shadow-sm border border-amber-200 flex items-center gap-3 no-print">
            <Edit3 size={20} />
            Anda sedang dalam Mode Edit. Silakan klik teks pada halaman (KPI, Syarat & Ketentuan, atau Checklist) untuk mengubahnya secara langsung.
          </div>
        )}

        {/* PAGE 1: SLA AGREEMENT & KPIs */}
        <div className="a4-sheet relative bg-white text-black shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-8 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:page-break-after-always">
          <div className="w-full flex-shrink-0 relative">
            <div className="h-[4mm] bg-gradient-to-r from-emerald-500 to-[#003366] w-full" />
            <div className="px-[15mm] pt-[8mm] pb-[4mm] flex justify-between items-center border-b-[2px] border-[#003366] mx-[15mm]">
              <div className="flex items-center gap-4">
                <img src="/logo_epl_connect_1.png" alt="EPL CONNECT" className="h-[12mm] object-contain" />
              </div>
              <div className="text-right">
                <span className="text-[12px] font-black text-[#003366] uppercase tracking-wide">SERVICE LEVEL AGREEMENT (SLA)</span>
              </div>
            </div>
          </div>

          <div className="flex-1 px-[20mm] py-[8mm] text-[10px] text-slate-800 flex flex-col leading-relaxed text-justify">
            <div className="text-center mb-6">
              <h2 className="text-[14px] font-black uppercase text-[#003366]">SLA - Value Engineering Services</h2>
              <p className="text-[10px] font-bold text-slate-500 mt-1">Dokumen Lampiran Penawaran No: {woForm.quo_number}</p>
            </div>

            <p className="font-medium mb-4">
              Service Level Agreement (SLA) ini merupakan dokumen yang mengatur standar pelayanan operasional dan pemeliharaan teknis untuk sistem HVAC yang dikelola oleh PT Daikin Applied Solutions Indonesia untuk fasilitas <strong>{woForm.recipient_company || "Pelanggan"}</strong>.
            </p>

            <h3 className="text-[11px] font-black text-[#003366] border-b border-slate-200 pb-1 mb-2">1. Key Performance Indicators (KPI) & Response Time</h3>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              {customContent.kpis.map((kpi: string, idx: number) => (
                <li key={idx}>
                  {editMode ? (
                    <textarea 
                      value={kpi} 
                      onChange={(e) => {
                        const newKpis = [...customContent.kpis];
                        newKpis[idx] = e.target.value;
                        setCustomContent({...customContent, kpis: newKpis});
                      }}
                      className="w-full bg-amber-50 border border-amber-200 p-1 rounded text-[9.5px] font-medium"
                      rows={2}
                    />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: kpi.replace(/^(.*?):/, "<strong>$1:</strong>") }} />
                  )}
                </li>
              ))}
            </ul>

            <h3 className="text-[11px] font-black text-[#003366] border-b border-slate-200 pb-1 mb-2">2. Kondisi & Ketentuan Layanan (Terms & Conditions)</h3>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              {/* Dynamic Term 1 based on state */}
              <li><strong>Durasi Kontrak:</strong> {contractDuration} dengan frekuensi pemeliharaan rutin sebanyak {visitFrequencyText}.</li>
              
              {customContent.terms.map((term: string, idx: number) => (
                <li key={idx}>
                  {editMode ? (
                    <textarea 
                      value={term} 
                      onChange={(e) => {
                        const newTerms = [...customContent.terms];
                        newTerms[idx] = e.target.value;
                        setCustomContent({...customContent, terms: newTerms});
                      }}
                      className="w-full bg-amber-50 border border-amber-200 p-1 rounded text-[9.5px] font-medium"
                      rows={3}
                    />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: term.replace(/^(.*?):/, "<strong>$1:</strong>") }} />
                  )}
                </li>
              ))}
            </ul>

            <h3 className="text-[11px] font-black text-[#003366] border-b border-slate-200 pb-1 mb-2">3. Rekapitulasi Unit Terdampak (Equipment Covered)</h3>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <table className="w-full text-[9px] text-left">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="py-1">Kategori/Tipe Unit</th>
                    <th className="py-1 text-center">Total Kuantitas</th>
                  </tr>
                </thead>
                <tbody>
                  {coveredEquipment.map((type) => {
                    const count = activeItems
                      .filter((i: any) => getEquipmentType(i) === type)
                      .reduce((sum: number, i: any) => sum + i.qty, 0);
                    
                    return (
                      <tr key={type} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 font-bold uppercase text-slate-700">{type.replace("_", " ")}</td>
                        <td className="py-1.5 text-center font-black text-[#003366]">{count} Unit</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto flex justify-between items-end pt-8">
              <div className="text-center w-40">
                <p className="text-[9px] font-bold text-slate-400 mb-12">Disetujui Oleh Pelanggan,</p>
                <div className="border-b border-slate-400 mb-1"></div>
                <p className="text-[9px] font-bold text-slate-700 uppercase">{woForm.recipient_pic || "Nama Terang"}</p>
                <p className="text-[8px] font-medium text-slate-500">{woForm.recipient_company}</p>
              </div>
              <div className="text-center w-40">
                <p className="text-[9px] font-bold text-slate-400 mb-12">Dibuat Oleh,</p>
                <div className="border-b border-slate-400 mb-1"></div>
                <p className="text-[9px] font-bold text-slate-700 uppercase">{woForm.pic_name || "Sales Engineer"}</p>
                <p className="text-[8px] font-medium text-slate-500">PT Daikin Applied Solutions</p>
              </div>
            </div>
          </div>

          <div className="w-full flex-shrink-0 relative">
            <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
            <div className="px-[15mm] py-[3.5mm] flex justify-between items-center text-[7px] font-bold text-slate-400 uppercase tracking-widest">
              <span>SLA VES Document • Confidential</span>
              <span>Halaman 1 / {coveredEquipment.length + 1}</span>
            </div>
          </div>
        </div>

        {/* PAGES 2+: SCOPE OF WORK CHECKLISTS */}
        {coveredEquipment.map((eqType, idx) => {
          const typeKey = eqType as keyof typeof customContent.sow;
          const sow = customContent.sow[typeKey];
          if (!sow) return null;

          const updateSowTask = (period: string, taskIdx: number, val: string) => {
            const newSow = { ...customContent.sow };
            newSow[typeKey] = { ...newSow[typeKey] };
            newSow[typeKey][period] = [...newSow[typeKey][period]];
            newSow[typeKey][period][taskIdx] = val;
            setCustomContent({ ...customContent, sow: newSow });
          };

          const addSowTask = (period: string) => {
            const newSow = { ...customContent.sow };
            newSow[typeKey] = { ...newSow[typeKey] };
            newSow[typeKey][period] = [...(newSow[typeKey][period] || []), "Pekerjaan baru..."];
            setCustomContent({ ...customContent, sow: newSow });
          };

          const removeSowTask = (period: string, taskIdx: number) => {
            const newSow = { ...customContent.sow };
            newSow[typeKey] = { ...newSow[typeKey] };
            newSow[typeKey][period] = newSow[typeKey][period].filter((_: any, i: number) => i !== taskIdx);
            setCustomContent({ ...customContent, sow: newSow });
          };

          return (
            <div key={eqType} className="a4-sheet relative bg-white text-black shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-8 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:page-break-after-always">
              <div className="w-full flex-shrink-0 relative">
                <div className="h-[4mm] bg-gradient-to-r from-emerald-500 to-[#003366] w-full" />
                <div className="px-[15mm] pt-[8mm] pb-[4mm] flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <img src="/logo_epl_connect_1.png" alt="EPL CONNECT" className="h-[7mm] object-contain" />
                    <span className="text-[6.5px] font-bold text-slate-450 tracking-wide uppercase">PT. DAIKIN APPLIED SOLUTIONS INDONESIA</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-[9.5px] font-black text-[#003366] uppercase">STANDARD SCOPE OF WORK (SOW)</h3>
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">SLA Lampiran: {woForm.quo_number}</p>
                  </div>
                </div>
                <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
              </div>

              <div className="flex-1 px-[20mm] py-[6mm] flex flex-col justify-start">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-[#003366]" />
                  <h2 className="text-[12px] font-black uppercase text-[#003366] tracking-wide">
                    Checklist SOW: {eqType.replace("_", " ")}
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* MONTHLY */}
                  {sow.Monthly && (
                    <div className="space-y-2">
                      <div className="bg-slate-100 py-1.5 px-3 rounded border-l-4 border-[#003366] flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase text-slate-800">Pemeliharaan Rutin (Bulanan)</h4>
                        {editMode && (
                          <button onClick={() => addSowTask("Monthly")} className="text-[8px] font-bold text-emerald-600 hover:underline">+ Tambah Task</button>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {sow.Monthly.map((task: string, i: number) => (
                          <li key={i} className="flex gap-3 text-[9.5px] text-slate-700 items-start">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                            {editMode ? (
                              <div className="flex-1 flex gap-2">
                                <input 
                                  type="text" 
                                  value={task} 
                                  onChange={(e) => updateSowTask("Monthly", i, e.target.value)}
                                  className="flex-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded focus:outline-none"
                                />
                                <button onClick={() => removeSowTask("Monthly", i)} className="text-rose-500 font-bold px-1">X</button>
                              </div>
                            ) : (
                              <span>{task}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* QUARTERLY */}
                  {sow.Quarterly && (
                    <div className="space-y-2">
                      <div className="bg-slate-100 py-1.5 px-3 rounded border-l-4 border-emerald-500 flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase text-slate-800">Pemeliharaan Kuartalan / 3 Bulanan</h4>
                        {editMode && (
                          <button onClick={() => addSowTask("Quarterly")} className="text-[8px] font-bold text-emerald-600 hover:underline">+ Tambah Task</button>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {sow.Quarterly.map((task: string, i: number) => (
                          <li key={i} className="flex gap-3 text-[9.5px] text-slate-700 items-start">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                            {editMode ? (
                              <div className="flex-1 flex gap-2">
                                <input 
                                  type="text" 
                                  value={task} 
                                  onChange={(e) => updateSowTask("Quarterly", i, e.target.value)}
                                  className="flex-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded focus:outline-none"
                                />
                                <button onClick={() => removeSowTask("Quarterly", i)} className="text-rose-500 font-bold px-1">X</button>
                              </div>
                            ) : (
                              <span>{task}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* YEARLY */}
                  {sow.Yearly && (
                    <div className="space-y-2">
                      <div className="bg-slate-100 py-1.5 px-3 rounded border-l-4 border-[#0073ea] flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase text-slate-800">Pemeliharaan Tahunan (Annual)</h4>
                        {editMode && (
                          <button onClick={() => addSowTask("Yearly")} className="text-[8px] font-bold text-emerald-600 hover:underline">+ Tambah Task</button>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {sow.Yearly.map((task: string, i: number) => (
                          <li key={i} className="flex gap-3 text-[9.5px] text-slate-700 items-start">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                            {editMode ? (
                              <div className="flex-1 flex gap-2">
                                <input 
                                  type="text" 
                                  value={task} 
                                  onChange={(e) => updateSowTask("Yearly", i, e.target.value)}
                                  className="flex-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded focus:outline-none"
                                />
                                <button onClick={() => removeSowTask("Yearly", i)} className="text-rose-500 font-bold px-1">X</button>
                              </div>
                            ) : (
                              <span>{task}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full flex-shrink-0 relative">
                <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
                <div className="px-[15mm] py-[3.5mm] flex justify-between items-center text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>SOW VES Document • Confidential</span>
                  <span>Halaman {idx + 2} / {coveredEquipment.length + 1}</span>
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Global CSS settings for multi-page paged media and scrollbars */}
      <style jsx global>{`
        .a4-sheet {
          width: 21cm;
          height: 29.7cm;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-sheet {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            width: 21cm !important;
            height: 29.7cm !important;
            page-break-after: always !important;
            box-sizing: border-box !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
