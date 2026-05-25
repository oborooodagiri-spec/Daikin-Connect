"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Printer, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  FileText, 
  User, 
  Building2, 
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Percent,
  Sliders,
  DollarSign,
  Briefcase,
  HelpCircle,
  Clock,
  Info,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createWorkOrder, createQuotation } from "@/app/actions/commercial";

interface QuotationClientProps {
  initialItems: any[];
  initialSettings: {
    vendors: string[];
    period_year: string;
    selected_vendor: string;
    vendor_prices: Record<string, Record<string, number>>;
    allowed_users: any[];
    categories: string[];
    work_types: string[];
    capacity_units: string[];
  };
  users: any[];
  projects: any[];
}

export default function QuotationClient({ 
  initialItems, 
  initialSettings, 
  users, 
  projects 
}: QuotationClientProps) {
  const router = useRouter();

  // 1. Core States for the Quotation Workspace
  const [selectedProject, setSelectedProject] = useState("");
  const [syncPromptOpen, setSyncPromptOpen] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Pricing configuration states
  const [globalMargin, setGlobalMargin] = useState<number>(20); // Default profit margin markup (20%)
  const [ppnEnabled, setPpnEnabled] = useState(true);
  const [serviceFrequency, setServiceFrequency] = useState<number>(4); // Default to 4x per year
  const [contractDuration, setContractDuration] = useState<string>("1 Tahun"); // Default contract duration

  // Document details state
  const [woForm, setWoForm] = useState({
    quo_number: `EPL-QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split("T")[0],
    subject: "Penawaran Harga Jasa Pemeliharaan & Perbaikan Unit HVAC",
    validity_days: "30 Hari Kalender",
    pic_name: "",
    pic_title: "Sales Engineer",
    recipient_company: "",
    recipient_pic: "",
    recipient_address: "",
    notes: "",
    intro_message: "Merujuk pada permohonan pengadaan jasa Preventive Maintenance AC untuk fasilitas Anda, dengan hormat kami, PT Daikin Applied Solutions Indonesia, menyampaikan proposal penawaran teknis beserta rincian komersial sebagai berikut:"
  });

  // 2. Memoized options
  const picOptions = useMemo(() => {
    return users.filter(user => {
      const roles = Array.isArray(user.roles) 
        ? user.roles.map((r: string) => r.toLowerCase()) 
        : [String(user.primaryRole || "").toLowerCase()];
      return roles.some((role: string) => 
        role.includes("sales") || role.includes("engineer") || role.includes("management")
      );
    });
  }, [users]);

  // Helper to fetch vendor cost of catalog item
  const getVendorPrice = (itemId: string): number => {
    if (!initialSettings.selected_vendor) return 0;
    return initialSettings.vendor_prices?.[initialSettings.selected_vendor]?.[itemId] ?? 0;
  };

  // 3. Handle Project Selection and Auto-fill Recipient Data & Prompt Units Sync
  const handleProjectChange = (projectIdStr: string) => {
    setSelectedProject(projectIdStr);
    const selectedProj = projects.find(p => p.id.toString() === projectIdStr);
    if (selectedProj) {
      const customerName = selectedProj.customers?.name || "Client Customer";
      const address = selectedProj.customers?.address?.trim() || "";
      const locationText = address !== "" ? address : "Belum ada alamat terdaftar";

      setWoForm(prev => ({
        ...prev,
        recipient_company: customerName,
        recipient_pic: selectedProj.picName || "Building Management",
        recipient_address: locationText
      }));

      // Check if project has associated units to sync
      if (selectedProj.units && selectedProj.units.length > 0) {
        setPendingProject(selectedProj);
        setSyncPromptOpen(true);
      }
    } else {
      setWoForm(prev => ({
        ...prev,
        recipient_company: "",
        recipient_pic: "",
        recipient_address: ""
      }));
      setPendingProject(null);
    }
  };

  // 4. Confirm Synchronization of Project Units to Quotation List
  const handleConfirmSyncUnits = () => {
    if (!pendingProject?.units) return;

    const newItems: any[] = [];
    pendingProject.units.forEach((unit: any) => {
      // Find matching catalog item in initialItems (case insensitive match)
      const matchedItem = initialItems.find(item => 
        item.category.toLowerCase() === unit.unit_type?.toLowerCase() ||
        item.item_name.toLowerCase().includes(unit.unit_type?.toLowerCase() || "")
      );

      if (matchedItem) {
        const price = getVendorPrice(matchedItem.id.toString());
        
        // Parse unit capacity
        let capacityVal = 1;
        if (unit.capacity) {
          const parsed = parseFloat(unit.capacity.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) {
            capacityVal = parsed;
          }
        }

        const locParts = [unit.building_floor, unit.area].filter(Boolean);
        const resolvedLocation = locParts.length > 0 ? locParts.join(" - ") : (unit.location || "-");

        newItems.push({
          id: `local-${Date.now()}-${Math.random()}`,
          item_ref_id: matchedItem.id.toString(),
          item_name: matchedItem.item_name,
          category: matchedItem.category,
          work_type: matchedItem.work_type,
          capacity_unit: matchedItem.capacity_unit,
          capacity_range: unit.capacity || matchedItem.capacity_range || "-",
          capacity_pk: (matchedItem.capacity_unit === "PK" || matchedItem.capacity_unit === "Cell") ? capacityVal : 0,
          qty: 1,
          notes: `Lokasi: ${resolvedLocation} (Model: ${unit.model || "-"})`,
          original_price: price,
          margin_override: null // Uses global margin by default
        });
      }
    });

    if (newItems.length > 0) {
      setActiveItems(prev => [...prev, ...newItems]);
    }
    setSyncPromptOpen(false);
  };

  // Add a blank manual item
  const handleAddManualItem = () => {
    const defaultCatalogItem = initialItems[0];
    if (!defaultCatalogItem) return;

    const price = getVendorPrice(defaultCatalogItem.id.toString());
    setActiveItems(prev => [
      ...prev,
      {
        id: `manual-${Date.now()}-${Math.random()}`,
        item_ref_id: defaultCatalogItem.id.toString(),
        item_name: defaultCatalogItem.item_name,
        category: defaultCatalogItem.category,
        work_type: defaultCatalogItem.work_type,
        capacity_unit: defaultCatalogItem.capacity_unit,
        capacity_range: defaultCatalogItem.capacity_range,
        capacity_pk: (defaultCatalogItem.capacity_unit === "PK" || defaultCatalogItem.capacity_unit === "Cell") ? 1 : 0,
        qty: 1,
        notes: "Item manual penawaran",
        original_price: price,
        margin_override: null
      }
    ]);
  };

  // Remove active item
  const handleRemoveItem = (id: string) => {
    setActiveItems(prev => prev.filter(item => item.id !== id));
  };

  // Update specific active item property
  const handleUpdateItemProp = (id: string, prop: string, value: any) => {
    setActiveItems(prev => prev.map(item => {
      if (item.id === id) {
        let updated = { ...item, [prop]: value };

        // If item_ref_id changed, auto-update related catalog properties & price
        if (prop === "item_ref_id") {
          const catalogItem = initialItems.find(i => i.id.toString() === value);
          if (catalogItem) {
            updated.item_name = catalogItem.item_name;
            updated.category = catalogItem.category;
            updated.work_type = catalogItem.work_type;
            updated.capacity_unit = catalogItem.capacity_unit;
            updated.capacity_range = catalogItem.capacity_range;
            updated.capacity_pk = (catalogItem.capacity_unit === "PK" || catalogItem.capacity_unit === "Cell") ? 1 : 0;
            updated.original_price = getVendorPrice(catalogItem.id.toString());
          }
        }
        return updated;
      }
      return item;
    }));
  };

  // 5. Computed Financial and Document Metrics
  const calculatedItems = useMemo(() => {
    return activeItems.map(item => {
      // Resolve margin (use custom override if defined, else fallback to globalMargin)
      const resolvedMargin = item.margin_override !== null && item.margin_override !== undefined 
        ? parseFloat(item.margin_override) 
        : globalMargin;
      
      const marginCoeff = 1 + (resolvedMargin / 100);

      // Determine capacity multiplier (e.g. standard PK rate contracts are per-PK)
      const multiplier = (item.capacity_unit === "PK" || item.capacity_unit === "Cell") 
        ? (item.capacity_pk || 1) 
        : 1;

      const vendorUnitPrice = item.original_price * multiplier;
      const customerUnitPrice = Math.round(vendorUnitPrice * marginCoeff);
      const customerSubtotal = customerUnitPrice * item.qty;

      const vendorSubtotal = vendorUnitPrice * item.qty;
      const marginProfit = customerSubtotal - vendorSubtotal;

      return {
        ...item,
        resolvedMargin,
        customerUnitPrice,
        customerSubtotal,
        vendorSubtotal,
        marginProfit
      };
    });
  }, [activeItems, globalMargin]);

  // Overall financial aggregates
  const financialTotals = useMemo(() => {
    const totalVendorCostPerVisit = calculatedItems.reduce((sum, item) => sum + item.vendorSubtotal, 0);
    const subtotalPenawaranPerVisit = calculatedItems.reduce((sum, item) => sum + item.customerSubtotal, 0);
    
    // Parse contract duration years
    const years = parseInt(contractDuration) || 1;
    const subtotalPenawaranTahun = subtotalPenawaranPerVisit * serviceFrequency * years;
    const totalVendorCostTahun = totalVendorCostPerVisit * serviceFrequency * years;
    const totalMarginProfit = subtotalPenawaranTahun - totalVendorCostTahun;
    
    const ppnVal = 0; // PPN completely removed
    const grandTotalPenawaran = subtotalPenawaranTahun;

    return {
      totalVendorCostPerVisit,
      subtotalPenawaranPerVisit,
      subtotalPenawaranTahun,
      totalVendorCostTahun,
      totalMarginProfit,
      ppnVal,
      grandTotalPenawaran
    };
  }, [calculatedItems, serviceFrequency, contractDuration]);

  // Pagination partitioner (A4 multi-page system)
  const itemsPerPage = 12;
  const partitionedPages = useMemo(() => {
    const pages: any[][] = [];
    for (let i = 0; i < calculatedItems.length; i += itemsPerPage) {
      pages.push(calculatedItems.slice(i, i + itemsPerPage));
    }
    return pages.length > 0 ? pages : [[]];
  }, [calculatedItems]);

  // Dynamic professional document.title printer function & Save to DB
  const handlePrint = async () => {
    setIsSaving(true);
    try {
      // 1. Create or ensure WO exists
      const woRes = await createWorkOrder({
        wo_number: woForm.quo_number.replace("QUO", "WO"),
        customer_name: woForm.recipient_company,
        pic_name: woForm.recipient_pic,
        company_address: woForm.recipient_address,
        project_id: selectedProject,
        status: "Quoted"
      });

      if (!woRes.success) throw new Error(woRes.error);
      const woId = woRes.data.id;

      // 2. Save Quotation
      const quoRes = await createQuotation({
        quo_number: woForm.quo_number,
        work_order_id: woId,
        total_amount: financialTotals.totalVendorCostTahun, // We can store vendor subtotal if needed, or customer subtotal
        discount: 0,
        tax: financialTotals.ppnVal,
        grand_total: financialTotals.grandTotalPenawaran,
        status: "Draft",
        items: activeItems.map(item => ({
          item_name: item.item_name,
          category: item.category,
          qty: item.qty,
          unit_price: item.original_price, // Or we can use calculated price
          total_price: item.original_price * item.qty
        }))
      });

      if (!quoRes.success) throw new Error(quoRes.error);

      // Save ID to session for SLA generator
      sessionStorage.setItem("current_quotation_id", quoRes.data.id.toString());

      const originalTitle = document.title;
      const customer = woForm.recipient_company?.trim() || "Customer";
      const project = pendingProject?.name?.trim() || "Project";
      const dateStr = woForm.date;

      const rawTitle = `Quotation_${customer}_${project}_${dateStr}`;
      const cleanTitle = rawTitle.replace(/[\/\\:\*\?"<>\|]/g, '-');

      document.title = cleanTitle;
      window.print();

      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Gagal menyimpan ke database. " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSLA = async () => {
    setIsSaving(true);
    try {
      // Create WO and Quotation first, because SLA requires a Quotation ID
      const woRes = await createWorkOrder({
        wo_number: woForm.quo_number.replace("QUO", "WO"),
        customer_name: woForm.recipient_company,
        pic_name: woForm.recipient_pic,
        company_address: woForm.recipient_address,
        project_id: selectedProject,
        status: "Quoted"
      });

      if (!woRes.success) throw new Error(woRes.error);
      const woId = woRes.data.id;

      const quoRes = await createQuotation({
        quo_number: woForm.quo_number,
        work_order_id: woId,
        total_amount: financialTotals.subtotalPenawaranTahun,
        discount: 0,
        tax: financialTotals.ppnVal,
        grand_total: financialTotals.grandTotalPenawaran,
        status: "Approved", // If SLA is generated, quo is basically approved
        items: activeItems.map(item => ({
          item_name: item.item_name,
          category: item.category,
          qty: item.qty,
          unit_price: item.original_price,
          total_price: item.original_price * item.qty
        }))
      });

      if (!quoRes.success) throw new Error(quoRes.error);

      // Save relevant SOW and metrics data for the SLA page
      const slaData = {
        quotation_id: quoRes.data.id,
        woForm,
        contractDuration,
        serviceFrequency,
        activeItems: activeItems.map(item => ({
          id: item.id,
          item_name: item.item_name,
          category: item.category,
          work_type: item.work_type,
          capacity_range: item.capacity_range,
          capacity_unit: item.capacity_unit,
          qty: item.qty,
          notes: item.notes
        }))
      };
      
      sessionStorage.setItem("pending_sla_data", JSON.stringify(slaData));
      router.push("/admin/database/rate-card/quotation/sla-ves");
    } catch (err) {
      console.error("Generate SLA failed:", err);
      alert("Gagal memproses data ke database. " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Format Helper
  const fmtCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const fmtDate = (dStr: string) => {
    if (!dStr) return "-";
    return new Date(dStr).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-700 flex flex-col lg:flex-row print:bg-white print:text-black print-safe">
      
      {/* LEFT SIDEBAR CONTROLS (no-print) */}
      <div className="w-full lg:w-[450px] lg:border-r border-slate-200 bg-white p-6 md:p-8 flex flex-col gap-6 flex-shrink-0 lg:max-h-screen lg:overflow-y-auto custom-scrollbar no-print shadow-sm">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/admin/database/rate-card"
            className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#0073ea] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke Manager
          </Link>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">B2C Quotation V1</span>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Quotation Creator</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">PT. Daikin Applied Solutions Indonesia</p>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Project Target */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12}/> Target Project Customer</label>
          <select 
            value={selectedProject} 
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-[#0073ea] transition-all"
          >
            <option value="">-- Pilih Project Customer --</option>
            {projects.map(proj => (
              <option key={proj.id} value={proj.id.toString()}>{proj.name} ({proj.customers?.name})</option>
            ))}
          </select>
        </div>

        {/* Contract Service Parameters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Sliders size={12}/> Frekuensi Jasa</label>
            <select 
              value={serviceFrequency} 
              onChange={e => setServiceFrequency(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-[#0073ea] transition-all"
            >
              <option value={1}>1x Setahun (Tahunan)</option>
              <option value={2}>2x Setahun (Semesteran)</option>
              <option value={3}>3x Setahun (Caturwulan)</option>
              <option value={4}>4x Setahun (Triwulan)</option>
              <option value={6}>6x Setahun (Dwi-bulanan)</option>
              <option value={12}>12x Setahun (Bulanan)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Sliders size={12}/> Durasi Kontrak</label>
            <select 
              value={contractDuration} 
              onChange={e => setContractDuration(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-[#0073ea] transition-all"
            >
              <option value="1 Tahun">1 Tahun</option>
              <option value="2 Tahun">2 Tahun</option>
              <option value="3 Tahun">3 Tahun</option>
              <option value="4 Tahun">4 Tahun</option>
              <option value="5 Tahun">5 Tahun</option>
            </select>
          </div>
        </div>

        {/* Dynamic Margin Adjustment Section (Highly requested by user) */}
        <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-black text-[#0073ea] uppercase tracking-widest flex items-center gap-1.5"><Sliders size={13}/> Penyesuaian Profit Margin</span>
            <span className="text-xs font-black text-[#0073ea] bg-blue-100/50 px-2 py-0.5 rounded-lg">{globalMargin}% Markup</span>
          </div>

          <div className="space-y-2">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={globalMargin} 
              onChange={e => setGlobalMargin(parseInt(e.target.value) || 0)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0073ea]"
            />
            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
              <span>0% (Harga Vendor)</span>
              <span>50%</span>
              <span>100% Markup</span>
            </div>
          </div>

          {/* Interactive Pricing Summary for Admin */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100/40 text-[9px] font-bold text-slate-500">
            <div>
              <span className="block text-[7px] text-slate-400 uppercase tracking-wider">Vendor Cost (Base):</span>
              <span className="text-slate-700 font-extrabold">{fmtCurrency(financialTotals.totalVendorCostTahun)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-400 uppercase tracking-wider">Profit Margin:</span>
              <span className="text-emerald-600 font-extrabold">+{fmtCurrency(financialTotals.totalMarginProfit)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-400 uppercase tracking-wider">Harga Customer:</span>
              <span className="text-[#0073ea] font-extrabold">{fmtCurrency(financialTotals.subtotalPenawaranTahun)}</span>
            </div>
          </div>
        </div>

        {/* Covering Letter and Recipients Detail Customizer */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Dokumen Resmi</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase">No. SPH / Quotation</label>
              <input 
                type="text" 
                value={woForm.quo_number} 
                onChange={(e) => setWoForm({ ...woForm, quo_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase">Tanggal Terbit</label>
              <input 
                type="date" 
                value={woForm.date} 
                onChange={(e) => setWoForm({ ...woForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase">Hal / Perihal Surat</label>
            <input 
              type="text" 
              value={woForm.subject} 
              onChange={(e) => setWoForm({ ...woForm, subject: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase">Nama PIC EPL (Tanda Tangan)</label>
            <select 
              value={woForm.pic_name} 
              onChange={(e) => {
                const matched = picOptions.find(u => u.name === e.target.value);
                setWoForm({ 
                  ...woForm, 
                  pic_name: e.target.value,
                  pic_title: matched?.primaryRole || "Sales Engineer"
                });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
            >
              <option value="">-- Pilih PIC --</option>
              {picOptions.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.primaryRole})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase">Penerima U.p (Nama PIC Client)</label>
            <input 
              type="text" 
              value={woForm.recipient_pic} 
              onChange={(e) => setWoForm({ ...woForm, recipient_pic: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase">Pesan Pembuka Proposal (Cover Letter Paragraph)</label>
            <textarea 
              value={woForm.intro_message} 
              onChange={(e) => setWoForm({ ...woForm, intro_message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none custom-scrollbar"
            />
          </div>
        </div>

        {/* Interactive Items Manager (Line-items configuration) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Baris Penawaran ({activeItems.length})</h3>
            <button 
              onClick={handleAddManualItem}
              className="flex items-center gap-1 text-[9px] font-black text-[#0073ea] hover:underline uppercase"
            >
              <Plus size={10} /> Tambah Manual
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {activeItems.map((item, idx) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl relative space-y-2 group">
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
                
                <div className="text-[9px] font-black text-slate-400 uppercase">Item #{idx + 1}</div>

                <div className="space-y-1.5">
                  <select 
                    value={item.item_ref_id} 
                    onChange={e => handleUpdateItemProp(item.id, "item_ref_id", e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold focus:outline-none"
                  >
                    {initialItems.map(catalog => (
                      <option key={catalog.id} value={catalog.id.toString()}>{catalog.item_name} ({catalog.capacity_range} {catalog.capacity_unit})</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[7px] text-slate-400 uppercase font-bold block">Qty</label>
                      <input 
                        type="number" 
                        value={item.qty} 
                        onChange={e => handleUpdateItemProp(item.id, "qty", parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-center focus:outline-none"
                      />
                    </div>
                    
                    {(item.capacity_unit === "PK" || item.capacity_unit === "Cell") ? (
                      <>
                        <div className="space-y-0.5">
                          <label className="text-[7px] text-slate-400 uppercase font-bold block">Kapasitas ({item.capacity_unit})</label>
                          <input 
                            type="number" 
                            step="any"
                            value={item.capacity_pk} 
                            onChange={e => handleUpdateItemProp(item.id, "capacity_pk", parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-center focus:outline-none"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[7px] text-slate-400 uppercase font-bold block">Margin % (Opt)</label>
                          <input 
                            type="number" 
                            placeholder={`${globalMargin}%`} 
                            value={item.margin_override === null ? "" : item.margin_override} 
                            onChange={e => handleUpdateItemProp(item.id, "margin_override", e.target.value === "" ? null : parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold focus:outline-none"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-0.5 col-span-2">
                        <label className="text-[7px] text-slate-400 uppercase font-bold block">Custom Margin % (Opsional)</label>
                        <input 
                          type="number" 
                          placeholder={`${globalMargin}%`} 
                          value={item.margin_override === null ? "" : item.margin_override} 
                          onChange={e => handleUpdateItemProp(item.id, "margin_override", e.target.value === "" ? null : parseInt(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <input 
                    type="text" 
                    placeholder="Keterangan unit (model/lokasi)..."
                    value={item.notes} 
                    onChange={e => handleUpdateItemProp(item.id, "notes", e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-medium focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Controls & print */}
        <div className="pt-4 border-t border-slate-100 space-y-3 bg-white no-print">
          <button 
            onClick={handleGenerateSLA}
            disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 py-4 ${isSaving ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10 group`}
          >
            <ShieldCheck size={16} className={`${isSaving ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} /> 
            {isSaving ? "Menyimpan Data..." : "Generate SLA Document"}
          </button>
          <button 
            onClick={handlePrint}
            disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 py-4 ${isSaving ? 'bg-[#0073ea]/60' : 'bg-[#0073ea] hover:bg-[#0060c5]'} text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/10 group`}
          >
            <Printer size={16} className={`${isSaving ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform`} /> 
            {isSaving ? "Memproses..." : "Simpan ke DB & Cetak PDF"}
          </button>
        </div>

      </div>

      {/* RIGHT PREVIEW WORKSPACE (LIGHT PREMIUM GREY CONTAINER) */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen bg-slate-100 flex flex-col items-center custom-scrollbar print:bg-white print:p-0 print:overflow-visible print:max-h-none">
        
        {/* PAGE 1: COVERING LETTER (Formal Proposal Intro) */}
        <div className="a4-sheet relative bg-white text-black shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-8 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:page-break-after-always">
          <div className="w-full flex-shrink-0 relative">
            <div className="h-[4mm] bg-gradient-to-r from-[#009ce1] to-[#003366] w-full" />
            <div className="px-[15mm] pt-[8mm] pb-[4mm] flex justify-between items-center border-b-[2px] border-[#003366] mx-[15mm]">
              <div className="flex items-center gap-4">
                <img src="/logo_epl_connect_1.png" alt="EPL CONNECT" className="h-[12mm] object-contain" />
                <div className="h-6 w-px bg-slate-300" />
                <div className="text-[8px] font-black text-[#003366] uppercase leading-tight max-w-[150px]">
                  PT. DAIKIN APPLIED SOLUTIONS INDONESIA
                </div>
              </div>
              <div className="text-right">
                <span className="text-[12px] font-black text-[#003366] uppercase tracking-wide">SURAT PENAWARAN HARGA</span>
              </div>
            </div>
          </div>

          <div className="flex-1 px-[20mm] py-[10mm] text-[10px] text-slate-800 flex flex-col justify-between leading-relaxed text-justify">
            <div className="space-y-6">
              {/* Ref & Date metadata */}
              <div className="flex justify-between items-start text-[9.5px]">
                <div className="space-y-1 font-bold text-slate-700">
                  <div>No. SPH : <span className="text-[#0073ea] font-extrabold">{woForm.quo_number}</span></div>
                  <div>Hal : <span className="text-slate-800 font-extrabold underline">{woForm.subject}</span></div>
                </div>
                <div className="font-bold text-slate-600">
                  Jakarta, {fmtDate(woForm.date)}
                </div>
              </div>

              {/* Recipient Block */}
              <div className="space-y-1">
                <span className="font-extrabold block text-slate-800">Kepada Yth.</span>
                <span className="font-black text-[11px] text-slate-900 block">{woForm.recipient_company || "..................................................."}</span>
                {woForm.recipient_pic && (
                  <span className="font-bold text-slate-600 block">U.p. Bpk/Ibu: {woForm.recipient_pic}</span>
                )}
                {woForm.recipient_address && (
                  <span className="font-medium text-slate-450 block max-w-md italic mt-0.5 leading-snug">{woForm.recipient_address}</span>
                )}
                <span className="font-bold text-slate-800 block mt-2">di Tempat</span>
              </div>

              {/* Introductory message */}
              <p className="font-medium text-slate-650 indent-8 leading-relaxed">
                {woForm.intro_message || "Dengan hormat, sehubungan dengan keperluan perawatan unit HVAC pada lokasi proyek Anda, bersama ini kami sampaikan penawaran harga terbaik..."}
              </p>

              {/* Summary table snippet on page 1 */}
              <div className="bg-slate-50 border border-slate-150 p-[4mm] rounded-2xl space-y-2">
                <div className="font-black text-[#003366] text-[8.5px] uppercase tracking-wider">Ringkasan Lingkup Jasa:</div>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-bold text-slate-600">
                  <div className="space-y-1">
                    <div>• Total Populasi Unit: <span className="text-slate-800 font-extrabold">{activeItems.reduce((sum, item) => sum + item.qty, 0)} Unit AC</span></div>
                    <div>• Periode Pelaksanaan: <span className="text-slate-800 font-extrabold">{contractDuration}</span></div>
                  </div>
                  <div className="space-y-1">
                    <div>• Skema Pekerjaan: <span className="text-slate-800 font-extrabold">Unit Price Contract</span></div>
                    <div>• Kepatuhan K3 & Tenaga Ahli: <span className="text-emerald-600 font-extrabold">Sudah Termasuk</span></div>
                  </div>
                </div>
              </div>

              <p className="font-medium text-slate-650 leading-relaxed">
                Rincian komprehensif mengenai lingkup pekerjaan (Scope of Work) beserta struktur harga satuan untuk setiap tipe AC telah kami lampirkan pada halaman berikutnya dalam dokumen kelengkapan ini.
              </p>
            </div>

            {/* Closing signature on page 1 */}
            <div className="pt-8 flex justify-end">
              <div className="w-56 text-center space-y-16">
                <div>
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">Hormat kami,</span>
                  <span className="text-[9.5px] font-black text-[#003366] uppercase block mt-1">PT. DAIKIN APPLIED SOLUTIONS INDONESIA</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-800 block underline">{woForm.pic_name || "..................................................."}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase block mt-0.5">{woForm.pic_title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="w-full flex-shrink-0 relative">
            <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
            <div className="px-[15mm] py-[3.5mm] flex justify-between items-center text-[7px] font-bold text-slate-400 uppercase tracking-widest">
              <span>EPL CONNECT Portal • Service & Engineering Dept</span>
              <span>Halaman 1 / {partitionedPages.length + 1}</span>
            </div>
          </div>
        </div>

        {/* PAGES 2+: BOQ BREAKDOWN TABLES */}
        {partitionedPages.map((pageItems, pageIdx) => {
          const pageNum = pageIdx + 2;
          const isLastPage = pageIdx === partitionedPages.length - 1;

          return (
            <div 
              key={pageIdx} 
              className="a4-sheet relative bg-white text-black shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-8 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:page-break-after-always"
            >
              <div className="w-full flex-shrink-0 relative">
                <div className="h-[4mm] bg-gradient-to-r from-[#009ce1] to-[#003366] w-full" />
                <div className="px-[15mm] pt-[8mm] pb-[4mm] flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <img src="/logo_epl_connect_1.png" alt="EPL CONNECT" className="h-[7mm] object-contain" />
                    <span className="text-[6.5px] font-bold text-slate-450 tracking-wide uppercase">PT. DAIKIN APPLIED SOLUTIONS INDONESIA</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-[9.5px] font-black text-[#003366] uppercase">BREAKDOWN RINCIAN HARGA SATUAN PENAWARAN</h3>
                    <p className="text-[8px] font-black text-[#0073ea] uppercase tracking-widest mt-1">SPH: {woForm.quo_number}</p>
                  </div>
                </div>
                <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
              </div>

              {/* Table Body Area */}
              <div className="flex-1 px-[15mm] py-[6mm] flex flex-col justify-start">
                <div className="flex-1">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-800/80 bg-slate-100/50">
                        <th className="py-2.5 pl-2 font-black text-slate-800 w-[6%]">NO</th>
                        <th className="py-2.5 font-black text-slate-800 w-[42%]">URAIAN PEKERJAAN / UNIT COVERED</th>
                        <th className="py-2.5 font-black text-slate-800 text-center w-[15%]">KAPASITAS</th>
                        <th className="py-2.5 font-black text-slate-800 text-center w-[9%]">QTY</th>
                        <th className="py-2.5 font-black text-slate-800 text-right w-[14%]">HARGA SATUAN</th>
                        <th className="py-2.5 pr-2 font-black text-slate-800 text-right w-[14%]">SUBTOTAL (RP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 text-[8.5px] font-semibold text-slate-650">
                      {pageItems.length > 0 ? (
                        pageItems.map((item, idx) => {
                          const itemNo = (pageIdx * itemsPerPage) + idx + 1;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/40">
                              <td className="py-2 pl-2 text-slate-500 font-extrabold">{itemNo}</td>
                              <td className="py-2 leading-relaxed">
                                <span className="font-extrabold text-slate-900 uppercase block">{item.item_name}</span>
                                <span className="text-[7.5px] text-[#0073ea] font-extrabold uppercase tracking-wide block mt-0.5">{item.work_type}</span>
                                {item.notes && <span className="text-[7px] text-slate-400 font-bold block mt-0.5 italic">{item.notes}</span>}
                              </td>
                              <td className="py-2 text-center text-slate-700 font-extrabold uppercase">
                                {String(item.capacity_range || "").toUpperCase().includes(String(item.capacity_unit || "").toUpperCase())
                                  ? item.capacity_range
                                  : `${item.capacity_range} ${item.capacity_unit}`}
                              </td>
                              <td className="py-2 text-center font-extrabold text-slate-800">{item.qty}</td>
                              <td className="py-2 text-right font-extrabold text-slate-700">{fmtCurrency(item.customerUnitPrice)}</td>
                              <td className="py-2 pr-2 text-right font-black text-slate-800">{fmtCurrency(item.customerSubtotal)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 italic">Belum ada baris pekerjaan penawaran terdaftar.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Terms and Financial Recaps (Last Page of the Table Suite) */}
                {isLastPage && (
                  <div className="mt-[5mm] pt-[4mm] border-t border-slate-200 grid grid-cols-12 gap-[5mm] items-stretch">
                    
                    {/* Notes & payment terms on left */}
                    <div className="col-span-6 h-full">
                      {/* Scope of Work Summary Box */}
                      <div className="bg-slate-50 border border-slate-200 p-[4mm] rounded-xl text-[7.5px] leading-tight h-full flex flex-col justify-between">
                        <div className="pb-1.5 border-b border-slate-200/60 flex items-center justify-between">
                          <span className="font-black text-[#003366] uppercase tracking-widest text-[8px]">Ringkasan Kontrak Pekerjaan (Summary)</span>
                          <span className="text-[7px] font-bold text-slate-400 uppercase">EPL B2B Proposal</span>
                        </div>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-4 flex-1 items-center">
                          <div>
                            <span className="font-bold text-slate-450 block uppercase tracking-widest text-[6px]">Total Volume:</span>
                            <span className="font-black text-[#0073ea] text-[10px] mt-0.5 block">
                              {calculatedItems.reduce((sum, item) => sum + item.qty, 0)} Unit AC
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-450 block uppercase tracking-widest text-[6px]">Frekuensi Jasa:</span>
                            <span className="font-black text-emerald-600 text-[10px] mt-0.5 block">
                              {serviceFrequency}x / Tahun
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-450 block uppercase tracking-widest text-[6px]">Tahun Berlaku:</span>
                            <span className="font-black text-slate-800 text-[10px] mt-0.5 block">
                              {parseInt(contractDuration) > 1 
                                ? `Periode ${initialSettings.period_year} - ${parseInt(initialSettings.period_year) + (parseInt(contractDuration) || 1) - 1}` 
                                : `Periode ${initialSettings.period_year}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Totals panel on right */}
                    <div className="col-span-6 h-full">
                      <div className="bg-slate-50 border border-slate-200 p-[4mm] rounded-xl space-y-2.5 h-full flex flex-col justify-between">
                        <div className="space-y-1.5 flex-1 justify-center flex flex-col">
                          <div className="flex justify-between items-center text-[7.5px]">
                            <span className="font-bold text-slate-500">Subtotal per Kunjungan</span>
                            <span className="font-bold text-slate-700">{fmtCurrency(financialTotals.subtotalPenawaranPerVisit)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[7.5px]">
                            <span className="font-bold text-slate-500">Frekuensi Kunjungan</span>
                            <span className="font-black text-[#0073ea]">{serviceFrequency}x / Tahun</span>
                          </div>

                          <div className="flex justify-between items-center text-[7.5px] border-t border-slate-200/50 pt-1.5">
                            <span className="font-bold text-slate-500">Total Jasa Jangka {contractDuration}</span>
                            <span className="font-bold text-slate-700">{fmtCurrency(financialTotals.subtotalPenawaranTahun)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] border-t-2 border-slate-800/80 pt-2 mt-1">
                          <span className="font-black text-[#003366] uppercase">GRAND TOTAL KONTRAK</span>
                          <span className="font-black text-[#0073ea] text-[10px]">{fmtCurrency(financialTotals.grandTotalPenawaran)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="w-full flex-shrink-0 relative">
                <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
                <div className="px-[15mm] py-[3.5mm] flex justify-between items-center text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>EPL CONNECT Portal • Service & Engineering Dept</span>
                  <span>Halaman {pageNum} / {partitionedPages.length + 1}</span>
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Sync units confirmation modal dialog (no-print) */}
      {syncPromptOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-6 transform scale-95 animate-scale-up">
            <div className="flex items-center gap-4 text-amber-500">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <Layers size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sinkronisasi Unit?</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Project target match detected</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Proyek <strong>{pendingProject?.name}</strong> memiliki sebanyak <strong>{pendingProject?.units?.length} unit</strong> terdaftar di database.
              Apakah Anda ingin **otomatis mengsinkronkan** unit-unit tersebut ke dalam daftar breakdown penawaran harga (Quotation) ini dengan margin markup standar?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setSyncPromptOpen(false)}
                className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Tidak, Lewati
              </button>
              <button 
                onClick={handleConfirmSyncUnits}
                className="flex-1 py-3.5 bg-[#0073ea] hover:bg-[#0060c5] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10"
              >
                Ya, Sinkronkan
              </button>
            </div>
          </div>
        </div>
      )}

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
