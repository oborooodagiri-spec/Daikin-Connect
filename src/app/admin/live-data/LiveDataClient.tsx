"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, BarChart3, PieChart, Map, Settings, Plus, Search,
  Download, Upload, Edit2, Trash2, ChevronRight, ChevronLeft,
  Filter, DollarSign, Target, Users, Building2, ArrowUpRight,
  ArrowDownRight, Activity, Globe2, Layers, RefreshCw, X,
  CheckCircle2, Clock, AlertTriangle, Briefcase, ArrowLeft, Trophy, Table2
} from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import ClosedProjectsWidget from './ClosedProjectsWidget';
import DealFormModal from "./DealFormModal";
import OpsFormModal from "./OpsFormModal";
import PresentationModal, { PresentationState } from "./PresentationModal";
import ProjectByStatusModal from "./ProjectByStatusModal";
import BookingForecastModal from "./BookingForecastModal";
import SectorPipelineModal from "./SectorPipelineModal";
import CategoryPipelineModal from "./CategoryPipelineModal";
import StatusPipelineModal from "./StatusPipelineModal";
import TopSalesModal from "./TopSalesModal";
import PICSettingsModal from "./PICSettingsModal";
import TargetSettingsModal from "./TargetSettingsModal";
import TargetProgressModal from "./TargetProgressModal";
import PartnershipSettingsModal from "./PartnershipSettingsModal";
import { updateDeal, getPICAreas, updatePICAreas, getTargetSettings } from "@/app/actions/pipeline";

// ============================================
// TYPES
// ============================================
interface Deal {
  id: number;
  client_name: string;
  area?: string;
  project_name: string;
  bill_material?: string;
  type?: string;
  region?: string;
  sales_planner?: string;
  pic?: string;
  category?: string;
  sector?: string;
  quotation: number;
  status: string;
  est_booking_month?: string;
  target_po_date?: string;
  booking_fc?: string;
  remarks?: string;
  source: string;
  priority?: string;
  created_at: string;
  is_closed: boolean;
  latitude?: number;
  longitude?: number;
}

interface OpsRecord {
  id: number;
  status: string;
  customer: string;
  project_name: string;
  total_value: number;
  values_by_month?: Record<string, number>;
  remark?: string;
  created_at: string;
}

interface StatusDef {
  code: string;
  label: string;
  color: string;
}

// ============================================
// CONSTANTS
// ============================================
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  A: { label: "Won / Already PO", color: "#00c875", bg: "rgba(0,200,117,0.12)" },
  B: { label: "Booking Forecast", color: "#0073ea", bg: "rgba(0,115,234,0.12)" },
  C: { label: "Proses Tender", color: "#7b2cbf", bg: "rgba(123,44,191,0.12)" },
  D: { label: "Aanwijzing", color: "#fdab3d", bg: "rgba(253,171,61,0.12)" },
  E: { label: "Budgeting (Quoting)", color: "#66ccff", bg: "rgba(102,204,255,0.12)" },
  H: { label: "Hold", color: "#8d949e", bg: "rgba(141,148,158,0.12)" },
  L: { label: "Lost", color: "#1f2937", bg: "rgba(31,41,55,0.12)" },
  T: { label: "Engineering Review", color: "#e44258", bg: "rgba(228,66,88,0.12)" }
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "pipeline", label: "Sales Pipeline", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

// ============================================
// INDONESIA MAP COMPONENT
// ============================================
const PROVINCE_COORDS: Record<string, { coords: [number, number]; name: string; region: string }> = {
  "jakarta": { coords: [106.8456, -6.2088], name: "DKI Jakarta", region: "Jawa" },
  "west_java": { coords: [107.6191, -6.9175], name: "Jawa Barat", region: "Jawa" },
  "central_java": { coords: [110.4225, -6.9697], name: "Jawa Tengah", region: "Jawa" },
  "east_java": { coords: [112.7521, -7.2504], name: "Jawa Timur", region: "Jawa" },
  "banten": { coords: [106.1503, -6.1200], name: "Banten", region: "Jawa" },
  "bali": { coords: [115.2167, -8.6500], name: "Bali", region: "Bali & Nusa Tenggara" },
  "north_sumatra": { coords: [99.0689, 2.1154], name: "Sumatera Utara", region: "Sumatera" },
  "west_sumatra": { coords: [100.4651, -0.9471], name: "Sumatera Barat", region: "Sumatera" },
  "south_sumatra": { coords: [104.7458, -2.9909], name: "Sumatera Selatan", region: "Sumatera" },
  "riau": { coords: [101.4498, 0.5116], name: "Riau", region: "Sumatera" },
  "lampung": { coords: [105.2667, -5.4500], name: "Lampung", region: "Sumatera" },
  "west_kalimantan": { coords: [109.3333, -0.0227], name: "Kalimantan Barat", region: "Kalimantan" },
  "east_kalimantan": { coords: [117.1536, -0.4705], name: "Kalimantan Timur", region: "Kalimantan" },
  "south_kalimantan": { coords: [114.5901, -3.3194], name: "Kalimantan Selatan", region: "Kalimantan" },
  "north_sulawesi": { coords: [124.8455, 1.4931], name: "Sulawesi Utara", region: "Sulawesi" },
  "south_sulawesi": { coords: [119.4327, -5.1476], name: "Sulawesi Selatan", region: "Sulawesi" },
  "ntb": { coords: [116.1167, -8.5833], name: "NTB", region: "Bali & Nusa Tenggara" },
  "ntt": { coords: [123.5833, -10.1667], name: "NTT", region: "Bali & Nusa Tenggara" },
  "papua": { coords: [140.7060, -2.5337], name: "Papua", region: "Papua & Maluku" },
  "maluku": { coords: [128.1814, -3.6954], name: "Maluku", region: "Papua & Maluku" },
  "batam": { coords: [104.0305, 1.1301], name: "Batam", region: "Sumatera" },
  "medan": { coords: [98.6722, 3.5952], name: "Medan", region: "Sumatera" },
  "bandung": { coords: [107.6191, -6.9175], name: "Bandung", region: "Jawa" },
  "surabaya": { coords: [112.7521, -7.2504], name: "Surabaya", region: "Jawa" },
  "yogyakarta": { coords: [110.3695, -7.7956], name: "Yogyakarta", region: "Jawa" },
  "semarang": { coords: [110.4225, -6.9697], name: "Semarang", region: "Jawa" },
  "makassar": { coords: [119.4327, -5.1476], name: "Makassar", region: "Sulawesi" },
  "manado": { coords: [124.8455, 1.4931], name: "Manado", region: "Sulawesi" },
  "palembang": { coords: [104.7458, -2.9909], name: "Palembang", region: "Sumatera" },
  "pekanbaru": { coords: [101.4498, 0.5116], name: "Pekanbaru", region: "Sumatera" },
};

// Region zoom configurations
const REGION_VIEWS: Record<string, { center: [number, number]; scale: number; label: string }> = {
  "All": { center: [118.5, -2], scale: 750, label: "Nasional" },
  "Jawa": { center: [110.0, -7.2], scale: 3200, label: "Jawa" },
  "Sumatera": { center: [102.5, -0.5], scale: 1500, label: "Sumatera" },
  "Kalimantan": { center: [114.5, -1.0], scale: 1800, label: "Kalimantan" },
  "Sulawesi": { center: [121.5, -2.0], scale: 2000, label: "Sulawesi" },
  "Bali & Nusa Tenggara": { center: [118.0, -9.0], scale: 3000, label: "Bali & NT" },
  "Papua & Maluku": { center: [134.0, -3.5], scale: 1500, label: "Papua & Maluku" },
};

// Map region keywords or actual coordinates to rough geographic coordinates
function guessCoords(deal: Deal): { coords: [number, number]; regionName: string } | null {
  if (deal.latitude != null && deal.longitude != null) {
    return { coords: [deal.longitude, deal.latitude], regionName: "Other" };
  }

  const area = (deal.area || "").toLowerCase();
  
  if (area.includes("medan")) return { ...PROVINCE_COORDS.medan, regionName: PROVINCE_COORDS.medan.region };
  if (area.includes("batam") || area.includes("hang nadim")) return { ...PROVINCE_COORDS.batam, regionName: PROVINCE_COORDS.batam.region };
  if (area.includes("pekanbaru") || area.includes("lanud")) return { ...PROVINCE_COORDS.pekanbaru, regionName: PROVINCE_COORDS.pekanbaru.region };
  if (area.includes("palembang") || area.includes("gula putih")) return { ...PROVINCE_COORDS.palembang, regionName: PROVINCE_COORDS.palembang.region };
  if (area.includes("bandung") || area.includes("sanbe")) return { ...PROVINCE_COORDS.bandung, regionName: PROVINCE_COORDS.bandung.region };
  if (area.includes("surabaya") || area.includes("galaxy")) return { ...PROVINCE_COORDS.surabaya, regionName: PROVINCE_COORDS.surabaya.region };
  if (area.includes("jogja") || area.includes("yogya") || area.includes("malyabhara")) return { ...PROVINCE_COORDS.yogyakarta, regionName: PROVINCE_COORDS.yogyakarta.region };
  if (area.includes("semarang")) return { ...PROVINCE_COORDS.semarang, regionName: PROVINCE_COORDS.semarang.region };
  if (area.includes("bali") || area.includes("denpasar")) return { ...PROVINCE_COORDS.bali, regionName: PROVINCE_COORDS.bali.region };
  if (area.includes("makassar") || area.includes("sulawesi")) return { ...PROVINCE_COORDS.makassar, regionName: PROVINCE_COORDS.makassar.region };
  if (area.includes("manado")) return { ...PROVINCE_COORDS.manado, regionName: PROVINCE_COORDS.manado.region };
  if (area.includes("lombok")) return { ...PROVINCE_COORDS.ntb, regionName: PROVINCE_COORDS.ntb.region };
  if (area.includes("papua")) return { ...PROVINCE_COORDS.papua, regionName: PROVINCE_COORDS.papua.region };
  
  if (deal.region === "East") return { coords: [112.7521, -7.2504], regionName: "Jawa" };
  if (deal.region === "Bali") return { ...PROVINCE_COORDS.bali, regionName: "Bali & Nusa Tenggara" };
  
  return { ...PROVINCE_COORDS.jakarta, regionName: "Jawa" };
}

// Drill-down modal for clicked cluster
function MapDrillDownModal({ cluster, onClose, formatRp }: { cluster: any; onClose: () => void; formatRp: (v: number) => string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "status" | "name">("value");

  const filteredDeals = useMemo(() => {
    let result = [...(cluster?.deals || [])];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((d: Deal) => 
        d.client_name.toLowerCase().includes(q) || 
        d.project_name.toLowerCase().includes(q) ||
        (d.pic || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "value") result.sort((a: Deal, b: Deal) => (Number(b.quotation) || 0) - (Number(a.quotation) || 0));
    if (sortBy === "status") result.sort((a: Deal, b: Deal) => a.status.localeCompare(b.status));
    if (sortBy === "name") result.sort((a: Deal, b: Deal) => a.client_name.localeCompare(b.client_name));
    return result;
  }, [cluster, searchTerm, sortBy]);

  if (!cluster) return null;

  const statusBreakdown = cluster.deals.reduce((acc: Record<string, { count: number; value: number }>, d: Deal) => {
    if (!acc[d.status]) acc[d.status] = { count: 0, value: 0 };
    acc[d.status].count++;
    acc[d.status].value += Number(d.quotation) || 0;
    return acc;
  }, {});

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 800, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #0a1628, #0d2137)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "rgba(102,204,255,0.7)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Region Detail</p>
              <h3 style={{ color: "white", fontSize: 22, fontWeight: 900, marginTop: 4 }}>{cluster.name}</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                {cluster.deals.length} Projects • {formatRp(cluster.totalValue)}
              </p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, padding: 10, cursor: "pointer", color: "white" }}>
              <X size={20} />
            </button>
          </div>

          {/* Status breakdown cards */}
          <div style={{ padding: "16px 28px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(statusBreakdown).sort(([a], [b]) => a.localeCompare(b)).map(([status, data]: [string, any]) => {
              const cfg = STATUS_CONFIG[status] || { label: status, color: "#888", bg: "rgba(136,136,136,0.1)" };
              return (
                <div key={status} style={{ background: cfg.bg, borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color }}>{status}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{data.count} • {formatRp(data.value)}</span>
                </div>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div style={{ padding: "16px 28px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari client, project, PIC..."
                style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500, outline: "none", background: "#f8fafc" }}
              />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["value", "status", "name"] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: sortBy === s ? "#0d2137" : "#f1f5f9", color: sortBy === s ? "#fff" : "#64748b", textTransform: "capitalize" }}
                >{s === "value" ? "Value" : s === "status" ? "Status" : "Nama"}</button>
              ))}
            </div>
          </div>

          {/* Deal list */}
          <div style={{ padding: "0 28px 24px", maxHeight: 380, overflowY: "auto" }}>
            {filteredDeals.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 40 }}>Tidak ada project ditemukan</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredDeals.map((deal: Deal) => {
                  const cfg = STATUS_CONFIG[deal.status] || { label: deal.status, color: "#888", bg: "rgba(136,136,136,0.1)" };
                  return (
                    <div key={deal.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: 14, border: "1px solid #f1f5f9" }}>
                      <span style={{ width: 32, height: 32, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: cfg.color, flexShrink: 0 }}>{deal.status}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{deal.client_name}</p>
                        <p style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{deal.project_name}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>{formatRp(Number(deal.quotation) || 0)}</p>
                        <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginTop: 2 }}>{deal.pic || "-"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function IndonesiaMap({ deals, canClickWidgets = true }: { deals: Deal[], canClickWidgets?: boolean }) {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [statusLayerFilter, setStatusLayerFilter] = useState<string | null>(null);
  const [drillDownCluster, setDrillDownCluster] = useState<any>(null);
  const [showPICLines, setShowPICLines] = useState(false);

  const regionView = REGION_VIEWS[selectedRegion] || REGION_VIEWS["All"];

  // Cluster deals by approximate geographic location
  const clusters = useMemo(() => {
    const clusterMap: Record<string, { coords: [number, number]; deals: Deal[]; totalValue: number; name: string; regionName: string }> = {};
    
    deals.forEach(deal => {
      if (deal.status === "L") return;
      if (statusLayerFilter && deal.status !== statusLayerFilter) return;
      
      const geo = guessCoords(deal);
      if (!geo) return;

      // Filter by selected region
      if (selectedRegion !== "All" && geo.regionName !== selectedRegion) return;
      
      const key = `${geo.coords[0].toFixed(1)}-${geo.coords[1].toFixed(1)}`;
      
      if (!clusterMap[key]) {
        let nearestName = "Other";
        let nearestDist = Infinity;
        for (const [, prov] of Object.entries(PROVINCE_COORDS)) {
          const dist = Math.sqrt((geo.coords[0] - prov.coords[0]) ** 2 + (geo.coords[1] - prov.coords[1]) ** 2);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestName = prov.name;
          }
        }
        clusterMap[key] = { coords: geo.coords, deals: [], totalValue: 0, name: nearestName, regionName: geo.regionName };
      }
      clusterMap[key].deals.push(deal);
      clusterMap[key].totalValue += Number(deal.quotation) || 0;
    });
    
    return Object.entries(clusterMap).map(([key, v]) => ({ key, ...v }));
  }, [deals, selectedRegion, statusLayerFilter]);

  const maxValue = useMemo(() => Math.max(...clusters.map(c => c.totalValue), 1), [clusters]);

  // Regional stats (ranking)
  const regionalStats = useMemo(() => {
    const regionMap: Record<string, { value: number; count: number; won: number }> = {};
    deals.forEach(deal => {
      if (deal.status === "L") return;
      const geo = guessCoords(deal);
      if (!geo) return;
      const rn = geo.regionName || "Other";
      if (!regionMap[rn]) regionMap[rn] = { value: 0, count: 0, won: 0 };
      regionMap[rn].value += Number(deal.quotation) || 0;
      regionMap[rn].count++;
      if (deal.status === "A") regionMap[rn].won++;
    });
    return Object.entries(regionMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [deals]);

  // PIC connection lines
  const picLines = useMemo(() => {
    if (!showPICLines) return [];
    const picLocations: Record<string, [number, number][]> = {};
    deals.forEach(deal => {
      if (deal.status === "L" || !deal.pic) return;
      const geo = guessCoords(deal);
      if (!geo) return;
      if (!picLocations[deal.pic]) picLocations[deal.pic] = [];
      const key = `${geo.coords[0].toFixed(1)}-${geo.coords[1].toFixed(1)}`;
      const exists = picLocations[deal.pic].some(c => `${c[0].toFixed(1)}-${c[1].toFixed(1)}` === key);
      if (!exists) picLocations[deal.pic].push(geo.coords);
    });
    
    const lines: { from: [number, number]; to: [number, number]; pic: string }[] = [];
    Object.entries(picLocations).forEach(([pic, coords]) => {
      if (coords.length < 2) return;
      for (let i = 0; i < coords.length - 1; i++) {
        for (let j = i + 1; j < coords.length; j++) {
          lines.push({ from: coords[i], to: coords[j], pic });
        }
      }
    });
    return lines;
  }, [deals, showPICLines]);

  // Total stats for header
  const totalStats = useMemo(() => {
    const displayed = clusters.reduce((acc, c) => ({ count: acc.count + c.deals.length, value: acc.value + c.totalValue }), { count: 0, value: 0 });
    return displayed;
  }, [clusters]);

  return (
    <div style={{ position: "relative", width: "100%", background: "linear-gradient(145deg, #060e1a 0%, #0b1a2e 30%, #0d2240 55%, #0b1a2e 80%, #060e1a 100%)", borderRadius: 24, overflow: "hidden" }}>
      
      {/* Ambient radial glow effects */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Center glow - warm accent behind Java */}
        <div style={{
          position: "absolute", left: "30%", top: "55%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(0,200,117,0.08) 0%, rgba(0,200,117,0.03) 40%, transparent 70%)",
          transform: "translate(-50%,-50%)", borderRadius: "50%"
        }} />
        {/* Top-left corner glow */}
        <div style={{
          position: "absolute", left: -60, top: -60, width: 300, height: 300,
          background: "radial-gradient(circle, rgba(102,204,255,0.06) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />
        {/* Right edge subtle glow for panel */}
        <div style={{
          position: "absolute", right: 0, top: "40%", width: 200, height: 300,
          background: "radial-gradient(ellipse at right, rgba(102,204,255,0.04) 0%, transparent 70%)",
          transform: "translateY(-50%)"
        }} />
      </div>

      {/* Dot-matrix grid overlay */}
      <svg width="100%" height="100%" style={{ opacity: 0.035, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        <defs>
          <pattern id="mapDotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#66ccff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapDotGrid)" />
      </svg>

      {/* Subtle top border glow line */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(102,204,255,0.3), transparent)"
      }} />

      {/* Title & Controls Bar */}
      <div style={{ position: "relative", zIndex: 10, padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ color: "rgba(102,204,255,0.6)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Project Distribution</p>
            <h3 style={{ color: "white", fontSize: 20, fontWeight: 900, marginTop: 4 }}>
              {selectedRegion === "All" ? "Expanded Product Line - National" : `Region: ${REGION_VIEWS[selectedRegion]?.label || selectedRegion}`}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "rgba(102,204,255,0.5)", fontSize: 10, fontWeight: 700 }}>{totalStats.count} projects</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <span style={{ color: "#00c875", fontSize: 10, fontWeight: 800 }}>{formatRp(totalStats.value)}</span>
          </div>
        </div>

        {/* Region Filter Buttons */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {Object.entries(REGION_VIEWS).map(([key, rv]) => (
            <button key={key} onClick={() => setSelectedRegion(key)}
              style={{
                padding: "6px 14px", borderRadius: 10, border: "1px solid",
                borderColor: selectedRegion === key ? "#66ccff" : "rgba(102,204,255,0.15)",
                background: selectedRegion === key ? "rgba(102,204,255,0.15)" : "rgba(255,255,255,0.02)",
                color: selectedRegion === key ? "#66ccff" : "rgba(255,255,255,0.5)",
                fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                letterSpacing: "0.02em",
                boxShadow: selectedRegion === key ? "0 0 12px rgba(102,204,255,0.15), inset 0 0 12px rgba(102,204,255,0.05)" : "none"
              }}
            >{rv.label}</button>
          ))}
        </div>

        {/* Status Layer Toggle + PIC Lines Toggle */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "rgba(102,204,255,0.4)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4 }}>Filter Status:</span>
          <button onClick={() => setStatusLayerFilter(null)}
            style={{
              padding: "4px 10px", borderRadius: 8, border: "1px solid",
              borderColor: !statusLayerFilter ? "#66ccff" : "rgba(102,204,255,0.15)",
              background: !statusLayerFilter ? "rgba(102,204,255,0.15)" : "transparent",
              color: !statusLayerFilter ? "#66ccff" : "rgba(255,255,255,0.4)",
              fontSize: 10, fontWeight: 700, cursor: "pointer",
              boxShadow: !statusLayerFilter ? "0 0 8px rgba(102,204,255,0.1)" : "none"
            }}
          >All</button>
          {["A", "B", "C", "D", "E"].map(s => {
            const cfg = STATUS_CONFIG[s];
            const isActive = statusLayerFilter === s;
            return (
              <button key={s} onClick={() => setStatusLayerFilter(isActive ? null : s)}
                style={{
                  padding: "4px 10px", borderRadius: 8, border: "1px solid",
                  borderColor: isActive ? cfg.color : "rgba(102,204,255,0.15)",
                  background: isActive ? `${cfg.color}22` : "transparent",
                  color: isActive ? cfg.color : "rgba(255,255,255,0.4)",
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  boxShadow: isActive ? `0 0 10px ${cfg.color}33` : "none"
                }}
              >{s}</button>
            );
          })}
          
          <div style={{ width: 1, height: 16, background: "rgba(102,204,255,0.15)", margin: "0 4px" }} />
          
          <button onClick={() => setShowPICLines(!showPICLines)}
            style={{
              padding: "4px 10px", borderRadius: 8, border: "1px solid",
              borderColor: showPICLines ? "#fdab3d" : "rgba(102,204,255,0.15)",
              background: showPICLines ? "rgba(253,171,61,0.15)" : "transparent",
              color: showPICLines ? "#fdab3d" : "rgba(255,255,255,0.4)",
              fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              boxShadow: showPICLines ? "0 0 10px rgba(253,171,61,0.15)" : "none"
            }}
          >
            <Activity size={10} />
            PIC Coverage
          </button>
        </div>
      </div>

      {/* Map + Side Panel Container */}
      <div style={{ display: "flex", position: "relative" }}>
        {/* Main Geographic Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: regionView.scale,
              center: regionView.center
            }}
            width={700}
            height={450}
            style={{ width: "100%", height: "auto" }}
          >
            {/* SVG Definitions for premium effects */}
            <defs>
              {/* Province gradient fill */}
              <linearGradient id="provinceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a4a6e" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#1a3a5c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#132d4a" stopOpacity={0.45} />
              </linearGradient>
              {/* Province hover gradient */}
              <linearGradient id="provinceGradHover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2a6a9e" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#1a5a8e" stopOpacity={0.5} />
              </linearGradient>
              {/* Neon glow filter for borders */}
              <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.8  0 0 0 0 1  0 0 0 0.6 0" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Bubble glow filter */}
              <filter id="bubbleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.8  0 0 0 0 1  0 0 0 0.5 0" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Radial gradient for bubble center glow */}
              <radialGradient id="bubbleInner">
                <stop offset="0%" stopColor="white" stopOpacity={0.15} />
                <stop offset="100%" stopColor="white" stopOpacity={0} />
              </radialGradient>
            </defs>

            <Geographies geography="/maps/indonesia.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="url(#provinceGrad)"
                    stroke="#4aa8d8"
                    strokeWidth={0.6}
                    filter="url(#borderGlow)"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "url(#provinceGradHover)", stroke: "#66ccff", strokeWidth: 0.8, outline: "none", cursor: canClickWidgets ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* PIC Connection Lines */}
            {picLines.map((line, idx) => (
              <Marker key={`line-${idx}`} coordinates={line.from}>
                <line
                  x1={0} y1={0}
                  x2={(line.to[0] - line.from[0]) * (regionView.scale / 100)}
                  y2={(line.to[1] - line.from[1]) * (regionView.scale / 100)}
                  stroke="#fdab3d" strokeWidth={0.8} strokeDasharray="4 3" opacity={0.4}
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="14" dur="2s" repeatCount="indefinite" />
                </line>
              </Marker>
            ))}

            {/* Animated Markers for clusters */}
            {clusters.map((cluster) => {
              const radius = Math.max(8, Math.min(35, (cluster.totalValue / maxValue) * 35));
              const isHovered = hoveredCluster === cluster.key;
              const wonDeals = cluster.deals.filter(d => d.status === "A").length;
              const totalDeals = cluster.deals.length;
              const wonRatio = wonDeals / totalDeals;
              const color = statusLayerFilter 
                ? (STATUS_CONFIG[statusLayerFilter]?.color || "#66ccff")
                : wonRatio > 0.5 ? "#00c875" : wonRatio > 0.2 ? "#fdab3d" : "#66ccff";
              
              return (
                <Marker key={cluster.key} coordinates={cluster.coords}>
                  <g filter="url(#bubbleGlow)">
                    {/* Outer pulse ring */}
                    <circle cx={0} cy={0} r={radius + 8} fill="none" stroke={color} strokeWidth={0.8} opacity={0.3}>
                      <animate attributeName="r" from={radius + 2} to={radius + 22} dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.35" to="0" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    {/* Second pulse ring (offset timing) */}
                    <circle cx={0} cy={0} r={radius + 4} fill="none" stroke={color} strokeWidth={0.5} opacity={0.2}>
                      <animate attributeName="r" from={radius} to={radius + 18} dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.25" to="0" dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Outer ring (static) */}
                    <circle cx={0} cy={0} r={radius + 3} fill="none" stroke={color} strokeWidth={0.5} opacity={isHovered ? 0.6 : 0.3}
                      style={{ transition: "all 0.3s" }}
                    />
                    
                    {/* Main bubble with gradient */}
                    <circle
                      cx={0} cy={0} r={radius}
                      fill={color} fillOpacity={isHovered ? 0.4 : 0.2}
                      stroke={color} strokeWidth={isHovered ? 2 : 1.2}
                      strokeOpacity={isHovered ? 1 : 0.7}
                      style={{ cursor: canClickWidgets ? "pointer" : "default", transition: "all 0.3s" }}
                      onMouseEnter={(e) => {
                        setHoveredCluster(cluster.key);
                        const rect = (e.target as SVGElement).closest("svg")?.getBoundingClientRect();
                        if (rect) {
                          setTooltip({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top - 10,
                            data: cluster
                          });
                        }
                      }}
                      onMouseLeave={() => { setHoveredCluster(null); setTooltip(null); }}
                      onClick={() => canClickWidgets && setDrillDownCluster(cluster)}
                    />
                    
                    {/* Inner glass highlight */}
                    <circle cx={0} cy={-radius * 0.2} r={radius * 0.55} fill="url(#bubbleInner)" style={{ pointerEvents: "none" }} />
                    
                    {/* Count label with shadow */}
                    <text x={0} y={4} textAnchor="middle" fill="white" fontSize={radius > 15 ? 12 : 9} fontWeight="900"
                      style={{ pointerEvents: "none", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                    >
                      {totalDeals}
                    </text>
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
              background: "linear-gradient(135deg, rgba(10,22,40,0.95), rgba(15,30,55,0.95))",
              border: "1px solid rgba(102,204,255,0.25)",
              borderRadius: 14,
              padding: "14px 18px",
              minWidth: 220,
              zIndex: 100,
              backdropFilter: "blur(12px)",
              pointerEvents: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(102,204,255,0.08), inset 0 1px 0 rgba(102,204,255,0.1)"
            }}>
              <p style={{ color: "#66ccff", fontSize: 11, fontWeight: 800, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {tooltip.data.name}
              </p>
              <p style={{ color: "white", fontSize: 18, fontWeight: 900 }}>
                {tooltip.data.deals.length} Projects
              </p>
              <p style={{ color: "#00c875", fontSize: 13, fontWeight: 700 }}>
                {formatRp(tooltip.data.totalValue)}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {Object.entries(
                  tooltip.data.deals.reduce((acc: Record<string, number>, d: Deal) => {
                    acc[d.status] = (acc[d.status] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([status, count]) => (
                  <span key={status} style={{
                    padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800,
                    background: STATUS_CONFIG[status]?.bg || "rgba(255,255,255,0.1)",
                    color: STATUS_CONFIG[status]?.color || "#fff"
                  }}>
                    {status}: {count as number}
                  </span>
                ))}
              </div>
              <p style={{ color: "rgba(102,204,255,0.4)", fontSize: 9, fontWeight: 600, marginTop: 8, textAlign: "center" }}>Klik untuk detail</p>
            </div>
          )}
        </div>

        {/* Regional Stats Side Panel */}
        <div style={{ width: 180, padding: "10px 16px 16px 0", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, flexShrink: 0 }}>
          <p style={{ color: "rgba(102,204,255,0.5)", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
            Ranking Wilayah
          </p>
          {regionalStats.map((rs, idx) => {
            const maxRegVal = regionalStats[0]?.value || 1;
            const pct = (rs.value / maxRegVal) * 100;
            const isSelected = selectedRegion === rs.name;
            return (
              <div key={rs.name}
                onClick={() => setSelectedRegion(isSelected ? "All" : rs.name)}
                style={{
                  cursor: "pointer", padding: "8px 10px", borderRadius: 10,
                  background: isSelected ? "rgba(102,204,255,0.1)" : "rgba(255,255,255,0.02)",
                  border: "1px solid",
                  borderColor: isSelected ? "rgba(102,204,255,0.25)" : "rgba(255,255,255,0.04)",
                  transition: "all 0.2s",
                  boxShadow: isSelected ? "0 0 12px rgba(102,204,255,0.08)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: isSelected ? "#66ccff" : "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 800 }}>
                    {idx + 1}. {rs.name}
                  </span>
                  <span style={{ color: "#00c875", fontSize: 9, fontWeight: 700 }}>{rs.count}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #3a8fd4, #00c875)", borderRadius: 2, boxShadow: "0 0 6px rgba(0,200,117,0.3)" }}
                  />
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, marginTop: 3 }}>
                  {formatRp(rs.value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ position: "relative", padding: "0 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, fontSize: 10, fontWeight: 700 }}>
          <span style={{ color: "#00c875" }}>● Won {">"} 50%</span>
          <span style={{ color: "#fdab3d" }}>● Mixed</span>
          <span style={{ color: "#66ccff" }}>● Pipeline</span>
          {showPICLines && <span style={{ color: "#fdab3d" }}>--- PIC Coverage</span>}
        </div>
      </div>

      {/* Bottom border glow line */}
      <div style={{
        position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(102,204,255,0.2), transparent)"
      }} />

      {/* Drill-down Modal */}
      {drillDownCluster && (
        <MapDrillDownModal
          cluster={drillDownCluster}
          onClose={() => setDrillDownCluster(null)}
          formatRp={formatRp}
        />
      )}
    </div>
  );
}

// ============================================
// FORMAT HELPERS
// ============================================
function formatRp(val: number): string {
  if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)}M`;
  if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(0)}Jt`;
  return `Rp ${val.toLocaleString("id-ID")}`;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#888", bg: "rgba(136,136,136,0.1)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800,
      background: cfg.bg, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.05em"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function LiveDataClient({ isAdmin = false, canClickWidgets = true, sessionName = "User" }: { isAdmin?: boolean, canClickWidgets?: boolean, sessionName?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leaderboardDeals, setLeaderboardDeals] = useState<Deal[]>([]);
  const [opsRecords, setOpsRecords] = useState<OpsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [picFilter, setPicFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [projectStateFilter, setProjectStateFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOps, setEditingOps] = useState<OpsRecord | null>(null);
  
  const [showProjectByStatusModal, setShowProjectByStatusModal] = useState(false);
  const [showBookingForecastModal, setShowBookingForecastModal] = useState(false);
  const [sectorModalState, setSectorModalState] = useState<{ isOpen: boolean; sectorName: string; color: string; deals: any[] } | null>(null);
  const [categoryModalState, setCategoryModalState] = useState<{ isOpen: boolean; categoryName: string; color: string; deals: any[] } | null>(null);
  const [statusModalState, setStatusModalState] = useState<{ isOpen: boolean; statusName: string; color: string; deals: any[] } | null>(null);
  const [showTopSalesModal, setShowTopSalesModal] = useState(false);
  const [showPICSettingsModal, setShowPICSettingsModal] = useState(false);
  const [showTargetSettingsModal, setShowTargetSettingsModal] = useState(false);
  const [showPartnershipSettingsModal, setShowPartnershipSettingsModal] = useState(false);
  const [showTargetProgressModal, setShowTargetProgressModal] = useState(false);
  const [totalTarget, setTotalTarget] = useState(0);
  const [showOpsModal, setShowOpsModal] = useState(false);
  const [presentationState, setPresentationState] = useState<PresentationState | null>(null);


  
  const itemsPerPage = 20;

  const currentFY = useMemo(() => {
    const d = new Date();
    return d.getMonth() >= 4 ? d.getFullYear() - 2000 : d.getFullYear() - 2000 - 1;
  }, []);
  const [selectedFY, setSelectedFY] = useState(currentFY);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const fyOptions = Array.from({ length: 5 }, (_, i) => currentFY - i);

  const MONTH_OPTIONS = [
    { value: 0, label: "Full FY" },
    { value: 1, label: "April" },
    { value: 2, label: "Mei" },
    { value: 3, label: "Juni" },
    { value: 4, label: "Juli" },
    { value: 5, label: "Agustus" },
    { value: 6, label: "September" },
    { value: 7, label: "Oktober" },
    { value: 8, label: "November" },
    { value: 9, label: "Desember" },
    { value: 10, label: "Januari" },
    { value: 11, label: "Februari" },
    { value: 12, label: "Maret" },
  ];

    const getMonthRange = useMemo(() => {
    if (selectedMonth === 0) return null;
    const fyYear = 2000 + selectedFY;
    const calendarMonth = selectedMonth <= 9 ? selectedMonth + 2 : selectedMonth - 10;
    const calendarYear = selectedMonth <= 9 ? fyYear : fyYear + 1;
    const start = new Date(calendarYear, calendarMonth, 1).getTime();
const end = new Date(calendarYear, calendarMonth + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
  }, [selectedFY, selectedMonth]);

  // activeDeals = ALL active deals, no FY restriction. Excludes closed and Lost.
  const activeDeals = useMemo(() => {
    return deals.filter(d => !d.is_closed && !['L', 'S', 'N'].includes(d.status));
  }, [deals]);

  // Specific deals scope for Project By Status and Pipeline Status Funnel widgets
  const projectByStatusDeals = useMemo(() => {
    return deals.filter(d => !d.is_closed && ['A', 'B', 'C', 'D', 'E'].includes(d.status));
  }, [deals]);


  // Sector groupings matching Excel definitions
  const INDUSTRY_SECTORS = ["Industri", "Heavy Industri"];
  const COMMERCIAL_SECTORS = ["Government", "Hospital", "Komersial"];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dealsRes, opsRes, leaderboardRes, targetRes] = await Promise.all([
        fetch("/api/v1/pipeline/deals").then(r => r.json()),
        fetch("/api/v1/pipeline/ops").then(r => r.json()),
        fetch("/api/v1/pipeline/deals?type=leaderboard").then(r => r.json()),
        getTargetSettings()
      ]);
      if (dealsRes.success) {
        setDeals(dealsRes.data || []);
      }
      if (opsRes.success) {
        setOpsRecords(opsRes.data || []);
      }
      if (leaderboardRes.success) {
        setLeaderboardDeals(leaderboardRes.data || []);
      }
      setTotalTarget(targetRes?.total || 0);
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const stats = useMemo(() => {
    let total = 0, won = 0, pipeline = 0, lost = 0, grossPipeline = 0;
    let wonCount = 0, activeCount = 0;
    let weightedPipeline = 0;
    let backlogValue = 0, backlogCount = 0;
    let newFyValue = 0, newFyCount = 0;

    const byStatus: Record<string, { count: number; value: number }> = {};
    const byPic: Record<string, { 
      totalValue: number; totalCount: number; 
      wonValue: number; wonCount: number; 
      lostValue: number; lostCount: number;
      overdueCount: number;
    }> = {};
    const bySector: Record<string, { count: number; value: number }> = {};
    const byCategory: Record<string, { count: number; value: number }> = {};

    const PROBABILITIES: Record<string, number> = {
      "A": 1,     // Won: 100%
      "B": 0.8,   // Budgeted: 80%
      "C": 0.6,   // Contracted: 60%
      "D": 0.4,   // Planning: 40%
      "E": 0.2,   // Estimated: 20%
      "T": 0.1,   // Targeted: 10%
      "L": 0,     // Lost: 0%
      "H": 0      // Hold: 0%
    };

    const fyStart = new Date(2000 + selectedFY, 3, 1).getTime();
    const fyEnd = new Date(2000 + selectedFY + 1, 2, 31, 23, 59, 59, 999).getTime();

    deals.forEach(d => {
      if (d.is_closed) return;
      
      const cTime = new Date(d.created_at).getTime();
      const isBacklog = cTime < fyStart;
      const val = Number(d.quotation) || 0;
      
      // Funnel & Totals
      if (d.status === "A") { won += val; wonCount++; }
      else if (d.status === "L") { lost += val; }
      else if (['C', 'D', 'E'].includes(d.status)) { pipeline += val; }
      
      grossPipeline += val;

      if (d.status !== 'L') {
        total += val;
        if (isBacklog) {
          backlogValue += val;
          backlogCount++;
        } else {
          newFyValue += val;
          newFyCount++;
        }
        
        if (['B', 'C', 'D', 'E'].includes(d.status)) activeCount++;

        // Weighted expected revenue
        const prob = PROBABILITIES[d.status] !== undefined ? PROBABILITIES[d.status] : 0;
        weightedPipeline += (val * prob);

        // By Status
        if (!byStatus[d.status]) byStatus[d.status] = { count: 0, value: 0 };
        byStatus[d.status].count++;
        byStatus[d.status].value += val;

        // By Sector
        const sec = d.sector || "Other";
        if (!bySector[sec]) bySector[sec] = { count: 0, value: 0 };
        bySector[sec].count++;
        bySector[sec].value += val;

        // By Category
        let rawCat = d.category || "Other";
        const cat = rawCat.toLowerCase().startsWith("cont") ? "Control" : rawCat;
        if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
        byCategory[cat].count++;
        byCategory[cat].value += val;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let overdueCount = 0;

    leaderboardDeals.forEach(d => {
      if (d.is_closed) return;

      const val = Number(d.quotation) || 0;
      const pic = d.pic || "Unassigned";
      if (!byPic[pic]) byPic[pic] = { totalValue: 0, totalCount: 0, wonValue: 0, wonCount: 0, lostValue: 0, lostCount: 0, overdueCount: 0 };
      
      let isCurrentFY = false;
      const rawDate = d.target_po_date || d.est_booking_month;
      if (rawDate) {
        const dt = new Date(rawDate);
        if (!isNaN(dt.getTime())) {
          const m = dt.getMonth() + 1;
          const y = dt.getFullYear();
          const fy = m >= 4 ? y - 2000 : y - 1 - 2000;
          if (fy === selectedFY) isCurrentFY = true;
        }
      }
      
      if (d.status !== "L") {
        byPic[pic].totalValue += val;
        byPic[pic].totalCount++;
      }
      
      if (d.status === "A" && isCurrentFY) { byPic[pic].wonValue += val; byPic[pic].wonCount++; }
      if (d.status === "L" && isCurrentFY) { byPic[pic].lostValue += val; byPic[pic].lostCount++; }
      
      if (d.target_po_date) {
        const targetDate = new Date(d.target_po_date);
        const isOverdueTime = targetDate.getFullYear() < today.getFullYear() || 
                              (targetDate.getFullYear() === today.getFullYear() && targetDate.getMonth() <= today.getMonth());
        if (isOverdueTime && ['B', 'C', 'D', 'E'].includes(d.status) && isCurrentFY) {
          overdueCount++;
          byPic[pic].overdueCount = (byPic[pic].overdueCount || 0) + 1;
        }
      }
    });

    const conversionRate = activeCount > 0 ? ((wonCount / activeCount) * 100).toFixed(1) : "0";
    const conversionRateValue = (pipeline + won) > 0 ? ((won / (pipeline + won)) * 100).toFixed(1) : "0";

    return {
      total, won, pipeline, lost, grossPipeline, wonCount, activeCount, weightedPipeline,
      conversionRate, conversionRateValue, overdueCount,
      backlogValue, backlogCount, newFyValue, newFyCount,
      byStatus, byPic, bySector, byCategory
    };
  }, [deals, leaderboardDeals, selectedFY, selectedMonth, getMonthRange]);

  // Filtered lists
  const filteredDeals = useMemo(() => {
    const now = new Date();
    const isOverdue = (deal: any) => {
      const targetDate = deal.target_po_date ? new Date(deal.target_po_date) : null;
      return targetDate && targetDate < now && !["A", "L", "S", "N"].includes(deal.status) && !deal.is_closed;
    };

    return deals.filter(d => {
      // deals is already filtered for non-admins at loadData, but we keep this as an extra safety measure
      if (!isAdmin && d.pic !== sessionName && d.sales_planner !== sessionName) return false;

      const s = searchTerm.toLowerCase();
      const matchSearch = !s || d.client_name?.toLowerCase().includes(s) || d.project_name?.toLowerCase().includes(s) || d.pic?.toLowerCase().includes(s) || d.remarks?.toLowerCase().includes(s);
      const matchStatus = statusFilter === "All" || d.status === statusFilter;
      const matchCategory = categoryFilter === "All" || d.category === categoryFilter;
      const matchSector = sectorFilter === "All" || d.sector === sectorFilter;
      const matchPic = picFilter === "All" || d.pic === picFilter;
      const matchSource = sourceFilter === "All" || d.source === sourceFilter;
      const matchProjectState = 
        projectStateFilter === "All" ||
        (projectStateFilter === "Closed" && d.is_closed) ||
        (projectStateFilter === "Open / On Progress" && !d.is_closed) ||
        (projectStateFilter === "Forecasted" && d.status === 'B');

      return matchSearch && matchStatus && matchCategory && matchSector && matchPic && matchSource && matchProjectState;
    }).sort((a, b) => {
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    });
  }, [deals, searchTerm, statusFilter, categoryFilter, sectorFilter, picFilter, sourceFilter, projectStateFilter, canClickWidgets, sessionName]);

  const filteredOps = useMemo(() => {
    return opsRecords.filter(o => {
      if (!isAdmin && o.pic !== sessionName) return false;

      const s = searchTerm.toLowerCase();
      const matchSearch = !s || o.customer?.toLowerCase().includes(s) || o.project_name?.toLowerCase().includes(s) || o.remark?.toLowerCase().includes(s);
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [opsRecords, searchTerm, statusFilter]);

  const paginatedDeals = filteredDeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);

  const uniquePics = useMemo(() => [...new Set(deals.map(d => d.pic).filter(Boolean))].sort(), [deals]);
  const uniqueCategories = useMemo(() => [...new Set(deals.map(d => d.category).filter(Boolean))].sort(), [deals]);
  const uniqueSectors = useMemo(() => [...new Set(deals.map(d => d.sector).filter(Boolean))].sort(), [deals]);
  const uniqueStatuses = useMemo(() => Object.keys(STATUS_CONFIG), []);

  // ============================================
  // STYLES
  // ============================================
  const cardStyle: React.CSSProperties = {
    background: "white", borderRadius: 24, border: "1px solid #e8e8e8",
    padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
  };

  // ============================================
  // RENDER: DASHBOARD TAB
  // ============================================
  const renderDashboard = () => {
    const fyStartYear = 2000 + currentFY;
    const fyStartTime = new Date(fyStartYear, 3, 1).getTime();
    const fyEndTime = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999).getTime();

    // Booking Forecast: deals where status = 'B', in current FY
    const bookingFcDeals = activeDeals.filter(d => {
      if (d.status !== 'B') return false;

      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return false; // Exclude if no target date set
      const dt = new Date(rawDate).getTime();
      return dt >= fyStartTime && dt <= fyEndTime;
    });

    const bookingFcTotal = bookingFcDeals.reduce((sum, d) => sum + Number(d.quotation || 0), 0);
    const bookingFcEastValue = bookingFcDeals.filter(d => d.region === 'East').reduce((sum, d) => sum + Number(d.quotation || 0), 0);
    const bookingFcWestValue = bookingFcDeals.filter(d => d.region === 'West').reduce((sum, d) => sum + Number(d.quotation || 0), 0);

    // Achievement: closed deals in current FY
    const closedFYDeals = deals.filter(d => {
      if (!d.is_closed) return false;
      const ut = new Date(d.updated_at).getTime();
      return ut >= fyStartTime && ut <= fyEndTime;
    });
    const closedFYValue = closedFYDeals.reduce((sum, d) => sum + Number(d.quotation || 0), 0);

    // Pipeline: status C/D/E only (not yet won, not forecasted), in current FY
    const pipelineDeals = activeDeals.filter(d => {
      if (!['C', 'D', 'E'].includes(d.status)) return false;
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return false;
      const dt = new Date(rawDate).getTime();
      return dt >= fyStartTime && dt <= fyEndTime;
    });

    const pipelineModalDeals = activeDeals.filter(d => d.status !== 'B');

    const pipelineTotal = pipelineDeals.reduce((sum, d) => sum + Number(d.quotation || 0), 0);
    const getCategoryTotal = (catName: string) => pipelineDeals.filter(d => {
      let c = d.category || "Others";
      if (c.toLowerCase().startsWith("cont")) c = "Control";
      return c.toLowerCase() === catName.toLowerCase();
    }).reduce((sum, d) => sum + Number(d.quotation || 0), 0);

    const pipelineRC = getCategoryTotal("RC");
    const pipelineEPL = getCategoryTotal("EPL");
    const pipelineControl = getCategoryTotal("Control");
    const pipelineIAQ = getCategoryTotal("IAQ");
    const pipelineVES = getCategoryTotal("VES");

    // Industry: sectors Industri + Heavy Industri
    const industryDeals = activeDeals.filter(d => INDUSTRY_SECTORS.includes(d.sector || ''));
    const industryFYDeals = industryDeals.filter(d => {
      if (!['A', 'B', 'C', 'D', 'E', 'T', 'H'].includes(d.status)) return false;
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return false;
      const dt = new Date(rawDate).getTime();
      return dt >= fyStartTime && dt <= fyEndTime;
    });

    const industryTotal = industryFYDeals.reduce((sum, d) => sum + Number(d.quotation || 0), 0);
    const getIndustryStatusTotal = (st: string) => industryFYDeals.filter(d => d.status === st).reduce((sum, d) => sum + Number(d.quotation || 0), 0);
    
    const industryA = getIndustryStatusTotal('A');
    const industryB = getIndustryStatusTotal('B');
    const industryC = getIndustryStatusTotal('C');
    const industryD = getIndustryStatusTotal('D');
    const industryE = getIndustryStatusTotal('E');

    // Commercial: sectors Government + Hospital + Komersial
    const commercialDeals = activeDeals.filter(d => COMMERCIAL_SECTORS.includes(d.sector || ''));
    const commercialFYDeals = commercialDeals.filter(d => {
      if (!['A', 'B', 'C', 'D', 'E', 'T', 'H'].includes(d.status)) return false;
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return false;
      const dt = new Date(rawDate).getTime();
      return dt >= fyStartTime && dt <= fyEndTime;
    });

    const commercialTotal = commercialFYDeals.reduce((sum, d) => sum + Number(d.quotation || 0), 0);
    const getCommercialStatusTotal = (st: string) => commercialFYDeals.filter(d => d.status === st).reduce((sum, d) => sum + Number(d.quotation || 0), 0);

    const commercialA = getCommercialStatusTotal('A');
    const commercialB = getCommercialStatusTotal('B');
    const commercialC = getCommercialStatusTotal('C');
    const commercialD = getCommercialStatusTotal('D');
    const commercialE = getCommercialStatusTotal('E');

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { 
              label: "Achievement", 
              value: formatRp(closedFYValue), 
              sub: `${closedFYDeals.length} closed · FY${currentFY}`, 
              icon: Trophy, 
              color: "#00c875", 
              gradient: "linear-gradient(135deg, #00c875 0%, #34d399 100%)",
              onClick: () => setShowTargetProgressModal(true),
              isAnimated: true
            },
            { 
              label: "Project By Status", 
              value: projectByStatusDeals.length, 
              sub: "Total active projects", 
              icon: BarChart3, 
              color: "#0073ea", 
              gradient: "linear-gradient(135deg, #0073ea 0%, #66ccff 100%)",
              onClick: () => setShowProjectByStatusModal(true),
              isAnimatedStatus: true
            },
            {
              label: "Booking Forecast", 
              value: formatRp(bookingFcTotal), 
              sub: `${bookingFcDeals.length} deals forecasted`, 
              icon: TrendingUp, 
              color: "#0ea5e9", 
              gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
              onClick: () => setShowBookingForecastModal(true),
              isAnimatedBooking: true
            },
            {
              label: "Pipeline", 
              value: formatRp(pipelineTotal), 
              sub: `${pipelineDeals.length} projects`, 
              icon: DollarSign, 
              color: "#f59e0b", 
              gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
              onClick: () => setCategoryModalState({ isOpen: true, categoryName: "Pipeline", color: "#f59e0b", deals: pipelineModalDeals }),
              isAnimatedPipeline: true
            },
            { 
              label: "Industry", 
              value: formatRp(industryTotal), 
              sub: `${industryDeals.length} projects`, 
              icon: Building2, 
              color: "#7b2cbf", 
              gradient: "linear-gradient(135deg, #7b2cbf 0%, #a855f7 100%)",
              onClick: () => setSectorModalState({ isOpen: true, sectorName: "Industry", color: "#7b2cbf", deals: industryDeals }),
              isAnimatedIndustry: true
            },
            { 
              label: "Commercial", 
              value: formatRp(commercialTotal), 
              sub: `${commercialFYDeals.length} projects · FY${currentFY}`, 
              icon: Map, 
              color: "#ef4444", 
              gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
              onClick: () => setSectorModalState({ isOpen: true, sectorName: "Commercial", color: "#ef4444", deals: commercialDeals }),
              isAnimatedCommercial: true
            },
          ].map((kpi: any, i) => {
            if (kpi.isAnimated) {
              return (
                <AnimatedAchievementCard
                  key={i}
                  kpi={kpi}
                  closedFYValue={closedFYValue}
                  closedFYDealsCount={closedFYDeals.length}
                  currentFY={currentFY}
                  totalTarget={totalTarget}
                  formatRp={formatRp}
                  canClickWidgets={canClickWidgets}
                  cardStyle={cardStyle}
                />
              );
            }
            if (kpi.isAnimatedBooking) {
              return (
                <AnimatedBookingForecastCard
                  key={i}
                  kpi={kpi}
                  bookingFcDeals={bookingFcDeals}
                  bookingFcEastValue={bookingFcEastValue}
                  bookingFcWestValue={bookingFcWestValue}
                  bookingFcTotalValue={bookingFcTotal}
                  formatRp={formatRp}
                  canClickWidgets={canClickWidgets}
                  cardStyle={cardStyle}
                />
              );
            }
            if (kpi.isAnimatedPipeline) {
              return (
                <AnimatedPipelineCard
                  key={i}
                  kpi={kpi}
                  pipelineDeals={pipelineDeals}
                  pipelineTotal={pipelineTotal}
                  pipelineRC={pipelineRC}
                  pipelineEPL={pipelineEPL}
                  pipelineControl={pipelineControl}
                  pipelineIAQ={pipelineIAQ}
                  pipelineVES={pipelineVES}
                  formatRp={formatRp}
                  canClickWidgets={canClickWidgets}
                  cardStyle={cardStyle}
                />
              );
            }
            if (kpi.isAnimatedIndustry) {
              return (
                <AnimatedIndustryCard
                  key={i}
                  kpi={kpi}
                  industryDeals={industryDeals}
                  industryTotal={industryTotal}
                  industryA={industryA}
                  industryB={industryB}
                  industryC={industryC}
                  industryD={industryD}
                  industryE={industryE}
                  formatRp={formatRp}
                  canClickWidgets={canClickWidgets}
                  cardStyle={cardStyle}
                />
              );
            }
            if (kpi.isAnimatedCommercial) {
              return (
                <AnimatedCommercialCard
                  key={i}
                  kpi={kpi}
                  commercialDeals={commercialFYDeals}
                  commercialTotal={commercialTotal}
                  commercialA={commercialA}
                  commercialB={commercialB}
                  commercialC={commercialC}
                  commercialD={commercialD}
                  commercialE={commercialE}
                  formatRp={formatRp}
                  canClickWidgets={canClickWidgets}
                  cardStyle={cardStyle}
                />
              );
            }
            if (kpi.isAnimatedStatus) {
              return (
                <AnimatedProjectByStatusCard
                  key={i}
                  kpi={kpi}
                  activeDeals={projectByStatusDeals}
                  formatRp={formatRp}
                  canClickWidgets={canClickWidgets}
                  cardStyle={cardStyle}
                />
              );
            }
            return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={canClickWidgets ? kpi.onClick : undefined}
              style={{ ...cardStyle, background: kpi.gradient, display: "flex", alignItems: "center", gap: 16, cursor: canClickWidgets ? "pointer" : "default", padding: "20px", transition: "all 0.15s" }}
              whileHover={{ scale: 1.02, boxShadow: `0 8px 25px ${kpi.color}40` }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{kpi.label}</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>{kpi.value}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{kpi.sub}</p>
              </div>
            </motion.div>
          )})}
        </div>

        {/* INDONESIA MAP */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <IndonesiaMap deals={activeDeals} canClickWidgets={canClickWidgets} />
        </motion.div>

        {/* CLOSED PROJECTS WIDGET */}
        <ClosedProjectsWidget 
          deals={deals} 
          currentFY={currentFY} 
          selectedFY={selectedFY} 
          setSelectedFY={setSelectedFY} 
          selectedMonth={selectedMonth} 
          setSelectedMonth={setSelectedMonth} 
          fyOptions={fyOptions} 
          MONTH_OPTIONS={MONTH_OPTIONS} 
        />



        {/* SALES PERFORMANCE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TOP PERFORMERS (MOST PO) */}
          <div 
            style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", cursor: canClickWidgets ? "pointer" : "default", transition: "transform 0.2s" }}
            onClick={() => canClickWidgets && setShowTopSalesModal(true)}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0, 200, 117, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={16} color="#00c875" />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#323338" }}>Top Sales Performers (PO)</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(stats.byPic)
                .filter(([name, data]) => name !== "Unassigned" && data.wonValue > 0)
                .sort(([, a], [, b]) => b.wonValue - a.wonValue)
                .slice(0, 5)
                .map(([pic, data], idx) => {
                  const maxVal = Math.max(...Object.values(stats.byPic).map(v => v.wonValue));
                  const winRate = data.totalValue > 0 ? Math.round((data.wonValue / data.totalValue) * 100) : 0;
                  return (
                    <div key={pic} style={{ position: "relative", cursor: canClickWidgets ? "pointer" : "default" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canClickWidgets && (isAdmin || pic === sessionName)) setPresentationState({ title: `Top Performer: ${pic}`, subtitle: `Win Rate: ${winRate}% · Won: ${formatRp(data.wonValue)}`, color: "#00c875", data: leaderboardDeals.filter(d => d.pic === pic) });
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "flex-end" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#323338" }}>{idx + 1}. {pic}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#00c875", background: "rgba(0,200,117,0.1)", padding: "2px 6px", borderRadius: 4 }}>Win: {winRate}%</span>
                          <span style={{ fontSize: 12, fontWeight: 900, color: "#00c875" }}>{formatRp(data.wonValue)}</span>
                        </div>
                      </div>
                      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(data.wonValue / maxVal) * 100}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#00c875", borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* OVERDUE PROJECTS LEADERBOARD */}
          <div style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={16} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#323338" }}>Sales Overdue Leaderboard</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(stats.byPic)
                .filter(([name, data]) => name !== "Unassigned" && (data as any).overdueCount > 0)
                .sort(([, a], [, b]) => (b as any).overdueCount - (a as any).overdueCount)
                .slice(0, 5)
                .map(([pic, data], idx) => {
                  const overdueCount = (data as any).overdueCount;
                  return (
                    <div key={pic} style={{ position: "relative", cursor: canClickWidgets ? "pointer" : "default" }}
                      onClick={() => canClickWidgets && setPresentationState({ title: `Overdue: ${pic}`, subtitle: `${overdueCount} projects melewati target PO`, color: "#ef4444", data: leaderboardDeals.filter(d => {
                        if (d.pic !== pic || !d.target_po_date || !['B', 'C', 'D', 'E'].includes(d.status)) return false;
                        const td = new Date(d.target_po_date);
                        const ty = new Date();
                        return td.getFullYear() < ty.getFullYear() || (td.getFullYear() === ty.getFullYear() && td.getMonth() <= ty.getMonth());
                      }) })}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "flex-end" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#323338" }}>{idx + 1}. {pic}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: 4 }}>{overdueCount} Projects Overdue</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* LOST OPPORTUNITIES */}
          <div style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(228, 66, 88, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={16} color="#1f2937" />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#323338" }}>Critical Loss (Lost Value)</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(stats.byPic)
                .filter(([name, data]) => name !== "Unassigned" && data.lostValue > 0)
                .sort(([, a], [, b]) => b.lostValue - a.lostValue)
                .slice(0, 5)
                .map(([pic, data], idx) => {
                  const maxVal = Math.max(...Object.values(stats.byPic).map(v => v.lostValue));
                  return (
                    <div key={pic} style={{ position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "flex-end" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#323338" }}>{idx + 1}. {pic}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#1f2937", background: "rgba(31,41,55,0.1)", padding: "2px 6px", borderRadius: 4 }}>{data.lostCount} projects</span>
                          <span style={{ fontSize: 12, fontWeight: 900, color: "#1f2937" }}>{formatRp(data.lostValue)}</span>
                        </div>
                      </div>
                      <div style={{ height: 8, background: "#fee2e2", borderRadius: 4, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(data.lostValue / maxVal) * 100}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#1f2937", borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* PIPELINE FUNNEL & COMPARATIVE ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: canClickWidgets ? "pointer" : "default" }} onClick={() => canClickWidgets && setStatusModalState({ isOpen: true, statusName: "Overview", color: "#10b981", deals: projectByStatusDeals })}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879" }}>Pipeline Status Funnel</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["E", "D", "C", "B", "A"]
                .map((status) => {
                  const data = stats.byStatus[status];
                  if (!data) return null;
                  const maxVal = Math.max(...Object.values(stats.byStatus).map(v => v.value));
                  const cfg = STATUS_CONFIG[status] || { label: status, color: "#888" };
                  const pct = (data.value / maxVal) * 100;
                  return (
                    <div key={status} style={{ display: "flex", alignItems: "center", gap: 12, cursor: canClickWidgets ? "pointer" : "default" }} onClick={() => canClickWidgets && setStatusModalState({ isOpen: true, statusName: "Overview", color: cfg.color, deals: projectByStatusDeals })}>
                      <span style={{ width: 20, fontSize: 14, fontWeight: 900, color: cfg.color, textAlign: "right" }}>{status}</span>
                      <div style={{ flex: 1, height: 32, background: "#f8fafc", borderRadius: 6, display: "flex", alignItems: "center" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                          style={{ height: "100%", background: cfg.color, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 12, minWidth: 20 }}
                        >
                          {pct > 15 && <span style={{ color: "white", fontSize: 10, fontWeight: 800 }}>{formatRp(data.value)}</span>}
                        </motion.div>
                        {pct <= 15 && <span style={{ marginLeft: 8, color: "#323338", fontSize: 10, fontWeight: 800 }}>{formatRp(data.value)}</span>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", marginBottom: 20 }}>Pipeline vs PO Conversion</h3>
            <div style={{ position: "relative", height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Simple CSS Donut Chart for Win/Loss/Pipeline */}
              <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                {(() => {
                  const total = stats.grossPipeline;
                  if (total === 0) return null;
                  const wonPct = stats.won / total;
                  const lostPct = stats.lost / total;
                  const circumference = 2 * Math.PI * 80;
                  const wonStroke = wonPct * circumference;
                  const lostStroke = lostPct * circumference;
                  return (
                    <>
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#00c875" strokeWidth="20" strokeDasharray={`${wonStroke} ${circumference}`} />
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#1f2937" strokeWidth="20" strokeDasharray={`${lostStroke} ${circumference}`} strokeDashoffset={-wonStroke} />
                    </>
                  );
                })()}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: canClickWidgets ? "pointer" : "default" }} onClick={() => canClickWidgets && setPresentationState({ title: "Gross Pipeline", subtitle: "All Active Projects", color: "#323338", data: activeDeals.filter(d => !["L", "H"].includes(d.status)) })}>
                <text style={{ fontSize: 10, fontWeight: 800, color: "#676879", letterSpacing: "0.05em" }}>GROSS PIPELINE</text>
                <text style={{ fontSize: 18, fontWeight: 900, color: "#323338", marginTop: 2 }}>{formatRp(stats.grossPipeline)}</text>
              </div>
              
              <div style={{ position: "absolute", bottom: -20, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#00c875", textTransform: "uppercase" }}>Secured PO</p>
                  <p style={{ fontSize: 13, fontWeight: 900, color: "#323338" }}>{formatRp(stats.won)}</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#1f2937", textTransform: "uppercase" }}>Lost Value</p>
                  <p style={{ fontSize: 13, fontWeight: 900, color: "#323338" }}>{formatRp(stats.lost)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTOR & CATEGORY DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline by Sector */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0, 115, 234, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={16} color="#0073ea" />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#323338" }}>Pipeline by Sector</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(() => {
                const sectorColors = ["#0073ea", "#00c875", "#fdab3d", "#7b2cbf", "#e44258"];
                const entries = Object.entries(stats.bySector).sort(([, a], [, b]) => b.value - a.value).slice(0, 5);
                const maxVal = Math.max(...entries.map(([, v]) => v.value), 1);
                return entries.map(([sector, data], idx) => (
                  <div key={sector} style={{ display: "flex", alignItems: "center", gap: 12, cursor: canClickWidgets ? "pointer" : "default" }} onClick={() => canClickWidgets && setSectorModalState({ isOpen: true, sectorName: sector, color: sectorColors[idx % sectorColors.length], deals: activeDeals.filter(d => d.sector === sector) })}>
                    <span style={{ width: 90, fontSize: 10, fontWeight: 800, color: sectorColors[idx % sectorColors.length] }}>{sector}</span>
                    <div style={{ flex: 1, height: 28, background: "#f8fafc", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(data.value / maxVal) * 100}%` }} transition={{ duration: 0.8 }}
                        style={{ height: "100%", background: sectorColors[idx % sectorColors.length], borderRadius: 8, opacity: 0.8 }}
                      />
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 800, color: "#323338" }}>
                        {formatRp(data.value)}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Pipeline by Category */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: canClickWidgets ? "pointer" : "default" }} onClick={() => canClickWidgets && setCategoryModalState({ isOpen: true, categoryName: "Overview", color: "#fdab3d", deals: activeDeals })}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(253, 171, 61, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Layers size={16} color="#fdab3d" />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#323338" }}>Pipeline by Category</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(() => {
                const CAT_COLORS: Record<string, string> = {
                  'EPL': '#fdab3d',
                  'RC': '#7b2cbf',
                  'IAQ': '#00c875',
                  'Control': '#0073ea',
                  'VES': '#e44258',
                  'Others': '#94a3b8'
                };
                const entries = Object.entries(stats.byCategory).sort(([, a], [, b]) => b.value - a.value).slice(0, 5);
                const maxVal = Math.max(...entries.map(([, v]) => v.value), 1);
                return entries.map(([category, data], idx) => {
                  const color = CAT_COLORS[category] || '#94a3b8';
                  return (
                  <div key={category} style={{ display: "flex", alignItems: "center", gap: 12, cursor: canClickWidgets ? "pointer" : "default" }} onClick={() => canClickWidgets && setCategoryModalState({ isOpen: true, categoryName: "Overview", color, deals: activeDeals })}>
                    <span style={{ width: 90, fontSize: 10, fontWeight: 800, color }}>{category}</span>
                    <div style={{ flex: 1, height: 28, background: "#f8fafc", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(data.value / maxVal) * 100}%` }} transition={{ duration: 0.8 }}
                        style={{ height: "100%", background: color, borderRadius: 8, opacity: 0.8 }}
                      />
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 800, color: "#323338" }}>
                        {formatRp(data.value)}
                      </span>
                    </div>
                  </div>
                );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: PIPELINE TABLE (Sales + Partnership)
  // ============================================
  const renderPipelineTable = (source?: string) => {
    const data = source 
      ? filteredDeals.filter(d => source === "EPL" ? (d.source === "EPL" || d.source === "Sales") : d.source === source) 
      : filteredDeals;
    const paginated = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const pages = Math.ceil(data.length / itemsPerPage);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Filters */}
        <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#c4c4c4" }} />
            <input
              type="text" placeholder="Search client, project, PIC..."
              value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 16, background: "#f5f6f8", border: "2px solid transparent", borderRadius: 14, fontSize: 13, fontWeight: 600, color: "#323338", outline: "none" }}
            />
          </div>
          
          {[
            { label: "Project State", val: projectStateFilter, set: setProjectStateFilter, opts: ["Open / On Progress", "Closed", "Forecasted"] },
            { label: "Status", val: statusFilter, set: setStatusFilter, opts: uniqueStatuses as string[] },
            { label: "Category", val: categoryFilter, set: setCategoryFilter, opts: uniqueCategories as string[] },
            { label: "Sector", val: sectorFilter, set: setSectorFilter, opts: uniqueSectors as string[] },
            { label: "PIC", val: picFilter, set: setPicFilter, opts: uniquePics as string[] },
          ].map(f => (
            <select key={f.label} value={f.val} onChange={e => { f.set(e.target.value); setCurrentPage(1); }}
              style={{ padding: "10px 14px", background: "#f5f6f8", border: "1px solid #e8e8e8", borderRadius: 12, fontSize: 11, fontWeight: 800, color: "#323338", textTransform: "uppercase", cursor: canClickWidgets ? "pointer" : "default" }}
            >
              <option value="All">All {f.label}s</option>
              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#676879" }}>
              {data.length} results · {formatRp(data.reduce((s, d) => s + Number(d.quotation), 0))}
            </span>
            <button onClick={() => { setEditingDeal(null); setShowAddModal(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              <Plus size={14} /> Add Project
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead>
                <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e8e8e8" }}>
                  {["Close", "Client / Project", "Category", "Sector", "PIC", "Quotation", "Status", "Remarks"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#676879" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((deal) => {
                  const targetDate = deal.target_po_date ? new Date(deal.target_po_date) : null;
                  const isOverdue = targetDate && targetDate < new Date() && !["A", "L", "S", "N"].includes(deal.status) && !deal.is_closed;
                  const isClosed = deal.is_closed;
                  const isWonNotClosed = deal.status === "A" && !deal.is_closed;
                  
                  let rowClass = "";
                  let bgColor = "transparent";
                  let bgHover = "#f8f9fb";
                  
                  if (isOverdue) {
                     rowClass = "animate-pulse border-red-500 border-l-4";
                     bgColor = "rgba(239,68,68,0.05)";
                     bgHover = "rgba(239,68,68,0.1)";
                  } else if (isWonNotClosed) {
                     rowClass = "border-green-500 border-l-4";
                     bgColor = "rgba(34,197,94,0.05)";
                     bgHover = "rgba(34,197,94,0.1)";
                  } else if (deal.status === 'L') {
                      rowClass = "border-gray-800 border-l-4";
                      bgColor = "rgba(31,41,55,0.05)";
                      bgHover = "rgba(31,41,55,0.1)";
                  } else if (deal.status === 'H') {
                      rowClass = "border-gray-400 border-l-4";
                      bgColor = "rgba(141,148,158,0.05)";
                      bgHover = "rgba(141,148,158,0.1)";
                  } else if (isClosed) {
                     rowClass = "border-blue-500 border-l-4";
                     bgColor = "#f0f7ff";
                     bgHover = "#e0f0ff";
                  }
                  
                  return (
                  <tr key={deal.id} className={rowClass} style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.15s", backgroundColor: bgColor, cursor: canClickWidgets ? "pointer" : "default" }}
                    onClick={() => { setEditingDeal(deal); setShowAddModal(true); }}
                    onMouseEnter={e => (e.currentTarget.style.background = bgHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = bgColor)}
                  >
                    <td style={{ padding: "12px 16px", width: 60 }} onClick={e => e.stopPropagation()}>
                        <label style={{ display: "flex", alignItems: "center", cursor: canClickWidgets ? "pointer" : "default" }}>
                          <input type="checkbox" checked={isClosed} onChange={async (e) => {
                            const newState = e.target.checked;
                            setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, is_closed: newState } : d));
                            const res = await updateDeal(deal.id, { is_closed: newState });
                            if ((res as any).error) {
                              setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, is_closed: !newState } : d));
                              alert("Failed to update close status: " + (res as any).error);
                            }
                          }} style={{ width: 16, height: 16, cursor: canClickWidgets ? "pointer" : "default" }} />
                        </label>
                      </td>
                    <td style={{ padding: "12px 16px", maxWidth: 300 }}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#323338", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{deal.client_name}</p>
                        {new Date(deal.created_at).getTime() < new Date(2000 + selectedFY, 3, 1).getTime() && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-700 leading-none">BACKLOG</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#676879", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{deal.project_name}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 8, background: "#f0f0ff", fontSize: 10, fontWeight: 800, color: "#5a189a" }}>{deal.category || "-"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#676879" }}>{deal.sector || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#323338" }}>{deal.pic || "-"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: "#323338", fontVariantNumeric: "tabular-nums" }}>
                      {formatRp(Number(deal.quotation))}
                    </td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={deal.status} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "#676879", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {deal.remarks || "-"}
                    </td>
                  </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 60, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#c4c4c4", fontStyle: "italic" }}>No matching records found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 16, borderTop: "1px solid #f0f0f0" }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === 1 ? 0.3 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#676879" }}>{currentPage} / {pages}</span>
              <button onClick={() => setCurrentPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === pages ? 0.3 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: OPS TABLE
  // ============================================
  const renderOpsTable = () => {
    const data = filteredOps;
    const paginated = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const pages = Math.ceil(data.length / itemsPerPage);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#c4c4c4" }} />
            <input type="text" placeholder="Search customer, project..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 16, background: "#f5f6f8", border: "2px solid transparent", borderRadius: 14, fontSize: 13, fontWeight: 600, color: "#323338", outline: "none" }}
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: "10px 14px", background: "#f5f6f8", border: "1px solid #e8e8e8", borderRadius: 12, fontSize: 11, fontWeight: 800, textTransform: "uppercase", cursor: canClickWidgets ? "pointer" : "default" }}
          >
            <option value="All">All Status</option>
            {["A", "B", "C", "D", "E", "H", "L", "T"].map(s => <option key={s} value={s}>{s} - {STATUS_CONFIG[s]?.label || s}</option>)}
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#676879" }}>
              {data.length} records · {formatRp(data.reduce((s, o) => s + Number(o.total_value), 0))}
            </span>
            <button onClick={() => { setEditingOps(null); setShowOpsModal(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              <Plus size={14} /> Add Record
            </button>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e8e8e8" }}>
                  {["#", "Customer", "Project", "Total Value", "Status", "Remark"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#676879" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((ops, idx) => (
                  <tr key={ops.id} style={{ borderBottom: "1px solid #f0f0f0", cursor: canClickWidgets ? "pointer" : "default" }}
                    onClick={() => { setEditingOps(ops); setShowOpsModal(true); }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#c4c4c4" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#323338", maxWidth: 200 }}>{ops.customer}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#676879", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ops.project_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: "#323338", fontVariantNumeric: "tabular-nums" }}>{formatRp(Number(ops.total_value))}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={ops.status} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "#676879", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ops.remark || "-"}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 60, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#c4c4c4", fontStyle: "italic" }}>No matching records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 16, borderTop: "1px solid #f0f0f0" }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === 1 ? 0.3 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#676879" }}>{currentPage} / {pages}</span>
              <button onClick={() => setCurrentPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === pages ? 0.3 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: SETTINGS TAB
  // ============================================
  const renderSettings = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#323338", marginBottom: 16 }}>Reference Data & Lookup Tables</h3>
        <p style={{ fontSize: 13, color: "#676879", marginBottom: 24 }}>
          Manage status codes, categories, sectors, PIC list, and RC product legends used across the pipeline system.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[
            { title: "Status Codes", desc: "A (Won), B (Budgeted), C (Contracted)...", count: 10, icon: "🏷️" },
            { title: "Categories", desc: "RC, EPL, IAQ, VES, Cont...", count: 8, icon: "📦" },
            { title: "Sectors", desc: "Hospital, Komersial, Government...", count: 5, icon: "🏢" },
            { title: "Sales PIC", desc: "Map Sales Engineers to Areas", count: uniquePics.length, icon: "👥" },
            { title: "Regions", desc: "West, East, Bali", count: 3, icon: "🌍" },
            { title: "RC Legends", desc: "WC CSD, WC VSD, AS CSD...", count: 16, icon: "❄️" },
            { title: "Sales Targets", desc: "Total & PIC specific targets", count: uniquePics.length, icon: "🎯" },
            { title: "Partnership Config", desc: "Manage Sales Relation PICs", count: 1, icon: "🤝" },
          ].map((item, i) => (
            <div key={i} style={{ padding: 20, background: "#f8f9fb", borderRadius: 16, border: "1px solid #e8e8e8", cursor: canClickWidgets ? "pointer" : "default", transition: "all 0.15s" }}
              onClick={() => { 
                if (item.title === "Sales PIC") setShowPICSettingsModal(true); 
                if (item.title === "Sales Targets") setShowTargetSettingsModal(true); 
                if (item.title === "Partnership Config") setShowPartnershipSettingsModal(true);
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0073ea"; e.currentTarget.style.background = "#f0f7ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.background = "#f8f9fb"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#323338" }}>{item.title}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#676879" }}>{item.count} items</p>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#999" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Import Section */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#323338", marginBottom: 16 }}>Data Import / Export</h3>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ padding: "12px 24px", background: "#323338", color: "white", borderRadius: 14, border: "none", fontSize: 12, fontWeight: 800, cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", gap: 8 }}>
            <Upload size={16} /> Import from Excel
          </button>
          <button style={{ padding: "12px 24px", background: "white", color: "#323338", borderRadius: 14, border: "1px solid #e8e8e8", fontSize: 12, fontWeight: 800, cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", gap: 8 }}>
            <Download size={16} /> Export to Excel
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* HEADER */}
      <div className="px-4 md:px-8 py-4" style={{ background: "white", borderBottom: "1px solid #e8e8e8", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => router.push("/home")} style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid #e8e8e8", background: "white", cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowLeft size={18} color="#676879" />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={18} color="white" />
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: "#323338", letterSpacing: "-0.02em" }}>Live Data</h1>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#676879", marginTop: 2, marginLeft: 42 }}>
                Pipeline Tracker & Analytics — DASI Service
              </p>
            </div>
          </div>

            <div className="flex items-center gap-4">
              <button onClick={loadData} style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #e8e8e8", background: "white", fontSize: 11, fontWeight: 800, cursor: canClickWidgets ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6, color: "#676879" }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

      {/* TAB NAV */}
      <div className="px-4 md:px-8" style={{ background: "white", borderBottom: "1px solid #e8e8e8" }}>
        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ display: "flex", gap: 0, maxWidth: 1400, margin: "0 auto" }}>
          {TABS.filter(t => t.id !== "settings" || isAdmin).map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearchTerm(""); setStatusFilter("All"); setCategoryFilter("All"); setSectorFilter("All"); setPicFilter("All"); }}
                style={{
                  padding: "14px 24px", border: "none", background: "transparent", cursor: canClickWidgets ? "pointer" : "default",
                  fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
                  color: isActive ? "#0073ea" : "#676879",
                  borderBottom: isActive ? "3px solid #0073ea" : "3px solid transparent",
                  display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s"
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 100 }}>
            <RefreshCw size={32} color="#0073ea" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#676879" }}>Loading pipeline data...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "pipeline" && renderPipelineTable()}
              {activeTab === "ops" && renderOpsTable()}
              {activeTab === "partnership" && renderPipelineTable("Partnership")}
              {activeTab === "settings" && renderSettings()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <DealFormModal sessionName={sessionName} isAdmin={isAdmin} isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={loadData} deal={editingDeal} />
      <OpsFormModal isOpen={showOpsModal} onClose={() => setShowOpsModal(false)} onSuccess={loadData} opsRecord={editingOps} />
      <ProjectByStatusModal isOpen={showProjectByStatusModal} onClose={() => setShowProjectByStatusModal(false)} deals={projectByStatusDeals} initialFY={selectedFY} />
      <BookingForecastModal isOpen={showBookingForecastModal} onClose={() => setShowBookingForecastModal(false)} deals={activeDeals} initialFY={selectedFY} />
      <SectorPipelineModal 
        isOpen={sectorModalState?.isOpen || false} 
        onClose={() => setSectorModalState(null)} 
        deals={sectorModalState?.deals || []} 
        initialFY={selectedFY}
        sectorName={sectorModalState?.sectorName || ""} 
        color={sectorModalState?.color} 
      />

      <CategoryPipelineModal 
        isOpen={categoryModalState?.isOpen || false} 
        onClose={() => setCategoryModalState(null)} 
        deals={categoryModalState?.deals || []} 
        initialFY={selectedFY}
        categoryName={categoryModalState?.categoryName || ""} 
        color={categoryModalState?.color} 
      />

      <StatusPipelineModal 
        isOpen={statusModalState?.isOpen || false} 
        onClose={() => setStatusModalState(null)} 
        deals={statusModalState?.deals || []} 
        initialFY={selectedFY}
        statusName={statusModalState?.statusName || ""} 
        color={statusModalState?.color} 
      />

      <TopSalesModal isOpen={showTopSalesModal} onClose={() => setShowTopSalesModal(false)} deals={activeDeals} initialFY={selectedFY} />
      <PICSettingsModal isOpen={showPICSettingsModal} onClose={() => setShowPICSettingsModal(false)} />
      <TargetSettingsModal isOpen={showTargetSettingsModal} onClose={() => setShowTargetSettingsModal(false)} />
      <PartnershipSettingsModal isOpen={showPartnershipSettingsModal} onClose={() => setShowPartnershipSettingsModal(false)} />
      <TargetProgressModal isOpen={showTargetProgressModal} onClose={() => setShowTargetProgressModal(false)} formatRp={formatRp} deals={deals} currentFY={currentFY} fyOptions={fyOptions} />
      <PresentationModal state={presentationState} onClose={() => setPresentationState(null)} formatRp={formatRp} STATUS_CONFIG={STATUS_CONFIG} />
    </div>
  );
}

function AnimatedAchievementCard({ 
  kpi, 
  closedFYValue, 
  closedFYDealsCount, 
  currentFY, 
  totalTarget, 
  formatRp, 
  canClickWidgets,
  cardStyle
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const progressPct = totalTarget > 0 ? (closedFYValue / totalTarget) * 100 : 0;
  const progressStr = Math.min(Math.round(progressPct * 10) / 10, 100) + "%";

  const contents = [
    { value: formatRp(closedFYValue), sub: `${closedFYDealsCount} projects · FY${currentFY}` },
    { value: progressStr, sub: `Closed vs Target · FY${currentFY}` },
    { value: `${closedFYDealsCount} projects`, sub: `Total Closed · FY${currentFY}` }
  ];

  const currentContent = contents[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
      onClick={canClickWidgets ? kpi.onClick : undefined}
      style={{ ...cardStyle, background: kpi.gradient, display: "flex", alignItems: "center", gap: 16, cursor: canClickWidgets ? "pointer" : "default", padding: "20px", transition: "all 0.15s" }}
      whileHover={{ scale: 1.02, boxShadow: `0 8px 25px ${kpi.color}40` }}
    >
      <div style={{ minWidth: 0, position: "relative", height: 48, flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{kpi.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>{currentContent.value}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentContent.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AnimatedProjectByStatusCard({ 
  kpi, 
  activeDeals,
  formatRp, 
  canClickWidgets,
  cardStyle
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const statuses = [
    { code: 'A', name: 'Won' },
    { code: 'B', name: 'Budgeted' },
    { code: 'C', name: 'Contracted' },
    { code: 'D', name: 'Planning' },
    { code: 'E', name: 'Estimated' },
    { code: 'T', name: 'Targeted' },
    { code: 'H', name: 'Hold' }
  ];

  const contents = useMemo(() => {
    return statuses.map(s => {
      const dealsInStatus = activeDeals.filter((d: any) => d.status === s.code);
      const totalValue = dealsInStatus.reduce((sum: number, d: any) => sum + (Number(d.quotation) || 0), 0);
      return {
        value: `${s.code} : ${formatRp(totalValue)}`,
        sub: s.name
      };
    });
  }, [activeDeals, formatRp]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [contents.length]);

  const currentContent = contents[currentIndex] || { value: 0, sub: '' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      onClick={canClickWidgets ? kpi.onClick : undefined}
      style={{ ...cardStyle, background: kpi.gradient, display: "flex", alignItems: "center", gap: 16, cursor: canClickWidgets ? "pointer" : "default", padding: "20px", transition: "all 0.15s" }}
      whileHover={{ scale: 1.02, boxShadow: `0 8px 25px ${kpi.color}40` }}
    >
      <div style={{ minWidth: 0, position: "relative", height: 48, flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{kpi.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>{currentContent.value}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentContent.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AnimatedBookingForecastCard({ 
  kpi, 
  bookingFcDeals,
  bookingFcEastValue,
  bookingFcWestValue,
  bookingFcTotalValue,
  formatRp, 
  canClickWidgets,
  cardStyle
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const contents = [
    { value: formatRp(bookingFcTotalValue), sub: `Total · ${bookingFcDeals.length} projects` },
    { value: `East : ${formatRp(bookingFcEastValue)}`, sub: `East Region` },
    { value: `West : ${formatRp(bookingFcWestValue)}`, sub: `West Region` }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [contents.length]);

  const currentContent = contents[currentIndex] || { value: 0, sub: '' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      onClick={canClickWidgets ? kpi.onClick : undefined}
      style={{ ...cardStyle, background: kpi.gradient, display: "flex", alignItems: "center", gap: 16, cursor: canClickWidgets ? "pointer" : "default", padding: "20px", transition: "all 0.15s" }}
      whileHover={{ scale: 1.02, boxShadow: `0 8px 25px ${kpi.color}40` }}
    >
      <div style={{ minWidth: 0, position: "relative", height: 48, flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{kpi.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>{currentContent.value}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentContent.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AnimatedPipelineCard({ 
  kpi, 
  pipelineDeals,
  pipelineTotal,
  pipelineRC,
  pipelineEPL,
  pipelineControl,
  pipelineIAQ,
  pipelineVES,
  formatRp, 
  canClickWidgets,
  cardStyle
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const contents = [
    { value: formatRp(pipelineTotal), sub: `Total · ${pipelineDeals.length} projects` },
    { value: `RC : ${formatRp(pipelineRC)}`, sub: `RC Category` },
    { value: `EPL : ${formatRp(pipelineEPL)}`, sub: `EPL Category` },
    { value: `Control : ${formatRp(pipelineControl)}`, sub: `Control Category` },
    { value: `IAQ : ${formatRp(pipelineIAQ)}`, sub: `IAQ Category` },
    { value: `VES : ${formatRp(pipelineVES)}`, sub: `VES Category` }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [contents.length]);

  const currentContent = contents[currentIndex] || { value: 0, sub: '' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      onClick={canClickWidgets ? kpi.onClick : undefined}
      style={{ ...cardStyle, background: kpi.gradient, display: "flex", alignItems: "center", gap: 16, cursor: canClickWidgets ? "pointer" : "default", padding: "20px", transition: "all 0.15s" }}
      whileHover={{ scale: 1.02, boxShadow: `0 8px 25px ${kpi.color}40` }}
    >
      <div style={{ minWidth: 0, position: "relative", height: 48, flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{kpi.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>{currentContent.value}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentContent.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AnimatedIndustryCard({ 
  kpi, 
  industryDeals,
  industryTotal,
  industryA,
  industryB,
  industryC,
  industryD,
  industryE,
  formatRp, 
  canClickWidgets,
  cardStyle
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const contents = [
    { value: formatRp(industryTotal), sub: `Total · ${industryDeals.length} projects` },
    { value: `A : ${formatRp(industryA)}`, sub: `Status A` },
    { value: `B : ${formatRp(industryB)}`, sub: `Status B` },
    { value: `C : ${formatRp(industryC)}`, sub: `Status C` },
    { value: `D : ${formatRp(industryD)}`, sub: `Status D` },
    { value: `E : ${formatRp(industryE)}`, sub: `Status E` }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [contents.length]);

  const currentContent = contents[currentIndex] || { value: 0, sub: '' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      onClick={canClickWidgets ? kpi.onClick : undefined}
      style={{ ...cardStyle, background: kpi.gradient, display: "flex", alignItems: "center", gap: 16, cursor: canClickWidgets ? "pointer" : "default", padding: "20px", transition: "all 0.15s" }}
      whileHover={{ scale: 1.02, boxShadow: `0 8px 25px ${kpi.color}40` }}
    >
      <div style={{ minWidth: 0, position: "relative", height: 48, flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{kpi.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>{currentContent.value}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentContent.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AnimatedCommercialCard({ 
  kpi, 
  commercialDeals,
  commercialTotal,
  commercialA,
  commercialB,
  commercialC,
  commercialD,
  commercialE,
  formatRp, 
  canClickWidgets,
  cardStyle
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const contents = [
    { value: formatRp(commercialTotal), sub: `Total · ${commercialDeals.length} projects` },
    { value: `A : ${formatRp(commercialA)}`, sub: `Status A` },
    { value: `B : ${formatRp(commercialB)}`, sub: `Status B` },
    { value: `C : ${formatRp(commercialC)}`, sub: `Status C` },
    { value: `D : ${formatRp(commercialD)}`, sub: `Status D` },
    { value: `E : ${formatRp(commercialE)}`, sub: `Status E` }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [contents.length]);

  const currentContent = contents[currentIndex] || { value: 0, sub: '' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      onClick={canClickWidgets ? kpi.onClick : undefined}
      style={{ ...cardStyle, background: kpi.gradient, display: "flex", alignItems: "center", gap: 16, cursor: canClickWidgets ? "pointer" : "default", padding: "20px", transition: "all 0.15s" }}
      whileHover={{ scale: 1.02, boxShadow: `0 8px 25px ${kpi.color}40` }}
    >
      <div style={{ minWidth: 0, position: "relative", height: 48, flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{kpi.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>{currentContent.value}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentContent.sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
