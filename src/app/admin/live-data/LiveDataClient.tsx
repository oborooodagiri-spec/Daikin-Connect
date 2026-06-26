"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, BarChart3, PieChart, Map, Settings, Plus, Search,
  Download, Upload, Edit2, Trash2, ChevronRight, ChevronLeft,
  Filter, DollarSign, Target, Users, Building2, ArrowUpRight,
  ArrowDownRight, Activity, Globe2, Layers, RefreshCw, X,
  CheckCircle2, Clock, AlertTriangle, Briefcase, ArrowLeft
} from "lucide-react";

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
  booking_fc?: string;
  remarks?: string;
  source: string;
  priority?: string;
  created_at: string;
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
  A: { label: "Won", color: "#00c875", bg: "rgba(0,200,117,0.12)" },
  B: { label: "Budgeted", color: "#0073ea", bg: "rgba(0,115,234,0.12)" },
  C: { label: "Contracted", color: "#7b2cbf", bg: "rgba(123,44,191,0.12)" },
  D: { label: "Planning", color: "#fdab3d", bg: "rgba(253,171,61,0.12)" },
  E: { label: "Submitted", color: "#66ccff", bg: "rgba(102,204,255,0.12)" },
  H: { label: "Hold", color: "#676879", bg: "rgba(103,104,121,0.12)" },
  L: { label: "Lost", color: "#e44258", bg: "rgba(228,66,88,0.12)" },
  T: { label: "Tender", color: "#ff9f43", bg: "rgba(255,159,67,0.12)" },
  S: { label: "Done", color: "#00c875", bg: "rgba(0,200,117,0.12)" },
  N: { label: "No Response", color: "#c4c4c4", bg: "rgba(196,196,196,0.12)" },
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "pipeline", label: "Sales Pipeline", icon: TrendingUp },
  { id: "ops", label: "Operations", icon: Activity },
  { id: "partnership", label: "Partnership", icon: Briefcase },
  { id: "settings", label: "Settings", icon: Settings },
];

// ============================================
// INDONESIA MAP COMPONENT (SVG-based)
// ============================================
const PROVINCE_COORDS: Record<string, { x: number; y: number; name: string }> = {
  "jakarta": { x: 310, y: 330, name: "DKI Jakarta" },
  "west_java": { x: 320, y: 340, name: "Jawa Barat" },
  "central_java": { x: 360, y: 345, name: "Jawa Tengah" },
  "east_java": { x: 400, y: 340, name: "Jawa Timur" },
  "banten": { x: 295, y: 330, name: "Banten" },
  "bali": { x: 435, y: 350, name: "Bali" },
  "north_sumatra": { x: 180, y: 220, name: "Sumatera Utara" },
  "west_sumatra": { x: 190, y: 260, name: "Sumatera Barat" },
  "south_sumatra": { x: 240, y: 300, name: "Sumatera Selatan" },
  "riau": { x: 220, y: 240, name: "Riau" },
  "lampung": { x: 270, y: 310, name: "Lampung" },
  "west_kalimantan": { x: 330, y: 260, name: "Kalimantan Barat" },
  "east_kalimantan": { x: 400, y: 240, name: "Kalimantan Timur" },
  "south_kalimantan": { x: 380, y: 290, name: "Kalimantan Selatan" },
  "north_sulawesi": { x: 470, y: 240, name: "Sulawesi Utara" },
  "south_sulawesi": { x: 450, y: 310, name: "Sulawesi Selatan" },
  "ntb": { x: 450, y: 360, name: "NTB" },
  "ntt": { x: 480, y: 370, name: "NTT" },
  "papua": { x: 620, y: 280, name: "Papua" },
  "maluku": { x: 540, y: 280, name: "Maluku" },
  "batam": { x: 240, y: 220, name: "Batam" },
  "medan": { x: 170, y: 200, name: "Medan" },
  "bandung": { x: 330, y: 345, name: "Bandung" },
  "surabaya": { x: 410, y: 340, name: "Surabaya" },
  "yogyakarta": { x: 365, y: 350, name: "Yogyakarta" },
  "semarang": { x: 365, y: 340, name: "Semarang" },
  "makassar": { x: 455, y: 315, name: "Makassar" },
  "manado": { x: 475, y: 235, name: "Manado" },
  "palembang": { x: 250, y: 295, name: "Palembang" },
  "pekanbaru": { x: 215, y: 240, name: "Pekanbaru" },
};

// Map region keywords to rough coordinates
function guessCoords(deal: Deal): { x: number; y: number } | null {
  const text = `${deal.client_name} ${deal.project_name} ${deal.area || ""} ${deal.remarks || ""}`.toLowerCase();
  
  if (text.includes("medan")) return PROVINCE_COORDS.medan;
  if (text.includes("batam") || text.includes("hang nadim")) return PROVINCE_COORDS.batam;
  if (text.includes("pekanbaru") || text.includes("lanud")) return PROVINCE_COORDS.pekanbaru;
  if (text.includes("palembang") || text.includes("gula putih")) return PROVINCE_COORDS.palembang;
  if (text.includes("bandung") || text.includes("sanbe")) return PROVINCE_COORDS.bandung;
  if (text.includes("surabaya") || text.includes("galaxy")) return PROVINCE_COORDS.surabaya;
  if (text.includes("jogja") || text.includes("yogya") || text.includes("malyabhara")) return PROVINCE_COORDS.yogyakarta;
  if (text.includes("semarang")) return PROVINCE_COORDS.semarang;
  if (text.includes("bali") || text.includes("denpasar")) return PROVINCE_COORDS.bali;
  if (text.includes("makassar") || text.includes("sulawesi")) return PROVINCE_COORDS.makassar;
  if (text.includes("manado")) return PROVINCE_COORDS.manado;
  if (text.includes("lombok")) return PROVINCE_COORDS.ntb;
  if (text.includes("papua")) return PROVINCE_COORDS.papua;
  
  // Default: Region based
  if (deal.region === "East") return { x: 410, y: 340 };
  if (deal.region === "Bali") return PROVINCE_COORDS.bali;
  
  // Default West = Jakarta area
  return PROVINCE_COORDS.jakarta;
}

function IndonesiaMap({ deals }: { deals: Deal[] }) {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any } | null>(null);

  // Cluster deals by approximate location
  const clusters = useMemo(() => {
    const clusterMap: Record<string, { x: number; y: number; deals: Deal[]; totalValue: number; name: string }> = {};
    
    deals.forEach(deal => {
      if (deal.status === "L") return; // Skip lost deals
      const coords = guessCoords(deal);
      if (!coords) return;
      
      // Snap to grid for clustering
      const key = `${Math.round(coords.x / 30) * 30}-${Math.round(coords.y / 30) * 30}`;
      
      if (!clusterMap[key]) {
        // Find nearest named location
        let nearestName = "Other";
        let nearestDist = Infinity;
        for (const [, prov] of Object.entries(PROVINCE_COORDS)) {
          const dist = Math.sqrt((coords.x - prov.x) ** 2 + (coords.y - prov.y) ** 2);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestName = prov.name;
          }
        }
        clusterMap[key] = { x: coords.x, y: coords.y, deals: [], totalValue: 0, name: nearestName };
      }
      clusterMap[key].deals.push(deal);
      clusterMap[key].totalValue += Number(deal.quotation) || 0;
    });
    
    return Object.entries(clusterMap).map(([key, v]) => ({ key, ...v }));
  }, [deals]);

  const maxValue = useMemo(() => Math.max(...clusters.map(c => c.totalValue), 1), [clusters]);

  return (
    <div style={{ position: "relative", width: "100%", background: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)", borderRadius: 24, overflow: "hidden", padding: "20px 0" }}>
      {/* Grid overlay */}
      <svg width="100%" viewBox="0 0 700 450" style={{ opacity: 0.06 }}>
        {Array.from({ length: 35 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={450} stroke="#66ccff" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 23 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 20} x2={700} y2={i * 20} stroke="#66ccff" strokeWidth={0.5} />
        ))}
      </svg>

      {/* Main Map SVG */}
      <svg width="100%" viewBox="0 0 700 450" style={{ position: "absolute", top: 20, left: 0 }}>
        {/* Simplified Indonesia Outline */}
        <g opacity={0.15} fill="none" stroke="#66ccff" strokeWidth={1}>
          {/* Sumatra */}
          <path d="M140,170 L160,180 L190,210 L210,240 L230,260 L260,290 L280,310 L260,320 L240,310 L220,290 L200,270 L180,250 L160,230 L140,210 Z" fill="#66ccff" fillOpacity={0.08} />
          {/* Java */}
          <path d="M280,325 L300,320 L320,325 L340,330 L360,335 L380,335 L400,330 L420,335 L435,340 L420,350 L400,350 L380,350 L360,350 L340,345 L320,340 L300,335 L285,330 Z" fill="#66ccff" fillOpacity={0.08} />
          {/* Kalimantan */}
          <path d="M300,220 L330,210 L360,220 L400,210 L420,230 L410,260 L400,280 L380,300 L360,290 L340,280 L320,270 L310,250 L300,230 Z" fill="#66ccff" fillOpacity={0.08} />
          {/* Sulawesi */}
          <path d="M430,230 L450,220 L470,230 L480,250 L470,270 L460,280 L450,300 L440,320 L450,310 L460,300 L470,290 L460,280 L450,270 L440,260 L430,250 Z" fill="#66ccff" fillOpacity={0.08} />
          {/* Bali & Nusa */}
          <ellipse cx={437} cy={352} rx={8} ry={6} fill="#66ccff" fillOpacity={0.1} />
          <ellipse cx={458} cy={362} rx={12} ry={5} fill="#66ccff" fillOpacity={0.08} />
          <ellipse cx={485} cy={368} rx={15} ry={5} fill="#66ccff" fillOpacity={0.08} />
          {/* Papua */}
          <path d="M560,250 L580,240 L610,250 L640,260 L650,280 L640,300 L620,310 L600,300 L580,290 L570,270 Z" fill="#66ccff" fillOpacity={0.08} />
          {/* Maluku */}
          <ellipse cx={530} cy={275} rx={15} ry={20} fill="#66ccff" fillOpacity={0.06} />
        </g>

        {/* Animated Pulse rings for clusters */}
        {clusters.map((cluster) => {
          const radius = Math.max(8, Math.min(35, (cluster.totalValue / maxValue) * 35));
          const isHovered = hoveredCluster === cluster.key;
          const wonDeals = cluster.deals.filter(d => d.status === "A").length;
          const totalDeals = cluster.deals.length;
          const wonRatio = wonDeals / totalDeals;
          const color = wonRatio > 0.5 ? "#00c875" : wonRatio > 0.2 ? "#fdab3d" : "#66ccff";
          
          return (
            <g key={cluster.key}>
              {/* Pulse animation */}
              <circle cx={cluster.x} cy={cluster.y} r={radius + 8} fill="none" stroke={color} strokeWidth={1} opacity={0.3}>
                <animate attributeName="r" from={radius} to={radius + 20} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              
              {/* Main dot */}
              <circle
                cx={cluster.x} cy={cluster.y} r={radius}
                fill={color} fillOpacity={isHovered ? 0.5 : 0.25}
                stroke={color} strokeWidth={isHovered ? 2 : 1}
                style={{ cursor: "pointer", transition: "all 0.2s" }}
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
              />
              
              {/* Count label */}
              <text x={cluster.x} y={cluster.y + 4} textAnchor="middle" fill="white" fontSize={radius > 15 ? 11 : 9} fontWeight="800">
                {totalDeals}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: tooltip.x,
          top: tooltip.y,
          transform: "translate(-50%, -100%)",
          background: "rgba(10,22,40,0.95)",
          border: "1px solid rgba(102,204,255,0.3)",
          borderRadius: 12,
          padding: "12px 16px",
          minWidth: 200,
          zIndex: 100,
          backdropFilter: "blur(10px)"
        }}>
          <p style={{ color: "#66ccff", fontSize: 11, fontWeight: 800, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {tooltip.data.name}
          </p>
          <p style={{ color: "white", fontSize: 18, fontWeight: 900 }}>
            {tooltip.data.deals.length} Projects
          </p>
          <p style={{ color: "#00c875", fontSize: 13, fontWeight: 700 }}>
            Rp {(tooltip.data.totalValue / 1e9).toFixed(1)}B
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
        </div>
      )}

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", gap: 12, fontSize: 10, fontWeight: 700 }}>
        <span style={{ color: "#00c875" }}>● Won {">"}50%</span>
        <span style={{ color: "#fdab3d" }}>● Mixed</span>
        <span style={{ color: "#66ccff" }}>● Pipeline</span>
      </div>

      {/* Title */}
      <div style={{ position: "absolute", top: 20, left: 24 }}>
        <p style={{ color: "rgba(102,204,255,0.6)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Project Distribution</p>
        <h3 style={{ color: "white", fontSize: 20, fontWeight: 900, marginTop: 4 }}>
          Peta Indonesia
        </h3>
      </div>
    </div>
  );
}

// ============================================
// FORMAT HELPERS
// ============================================
function formatRp(val: number): string {
  if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(0)}M`;
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
export default function LiveDataClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [opsRecords, setOpsRecords] = useState<OpsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [picFilter, setPicFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const itemsPerPage = 20;

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dealsRes, opsRes] = await Promise.all([
        fetch("/api/v1/pipeline/deals").then(r => r.json()),
        fetch("/api/v1/pipeline/ops").then(r => r.json()),
      ]);
      if (dealsRes.success) setDeals(dealsRes.data || []);
      if (opsRes.success) setOpsRecords(opsRes.data || []);
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const stats = useMemo(() => {
    const total = deals.reduce((s, d) => s + Number(d.quotation), 0);
    const won = deals.filter(d => d.status === "A").reduce((s, d) => s + Number(d.quotation), 0);
    const pipeline = deals.filter(d => ["B", "C", "D", "E", "T"].includes(d.status)).reduce((s, d) => s + Number(d.quotation), 0);
    const lost = deals.filter(d => d.status === "L").reduce((s, d) => s + Number(d.quotation), 0);
    const wonCount = deals.filter(d => d.status === "A").length;
    const activeCount = deals.filter(d => !["L", "H"].includes(d.status)).length;
    const conversionRate = activeCount > 0 ? ((wonCount / activeCount) * 100).toFixed(1) : "0";

    // By status
    const byStatus: Record<string, { count: number; value: number }> = {};
    deals.forEach(d => {
      if (!byStatus[d.status]) byStatus[d.status] = { count: 0, value: 0 };
      byStatus[d.status].count++;
      byStatus[d.status].value += Number(d.quotation);
    });

    // By PIC
    const byPic: Record<string, { count: number; value: number }> = {};
    deals.forEach(d => {
      const pic = d.pic || "Unassigned";
      if (!byPic[pic]) byPic[pic] = { count: 0, value: 0 };
      byPic[pic].count++;
      byPic[pic].value += Number(d.quotation);
    });

    // By sector
    const bySector: Record<string, { count: number; value: number }> = {};
    deals.forEach(d => {
      const sec = d.sector || "Other";
      if (!bySector[sec]) bySector[sec] = { count: 0, value: 0 };
      bySector[sec].count++;
      bySector[sec].value += Number(d.quotation);
    });

    // By category
    const byCategory: Record<string, { count: number; value: number }> = {};
    deals.forEach(d => {
      const cat = d.category || "Other";
      if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
      byCategory[cat].count++;
      byCategory[cat].value += Number(d.quotation);
    });

    // OPS stats
    const opsTotal = opsRecords.reduce((s, o) => s + Number(o.total_value), 0);
    const opsDone = opsRecords.filter(o => o.status === "S").reduce((s, o) => s + Number(o.total_value), 0);

    return { total, won, pipeline, lost, wonCount, activeCount, conversionRate, byStatus, byPic, bySector, byCategory, opsTotal, opsDone };
  }, [deals, opsRecords]);

  // Filtered lists
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const s = searchTerm.toLowerCase();
      const matchSearch = !s || d.client_name?.toLowerCase().includes(s) || d.project_name?.toLowerCase().includes(s) || d.pic?.toLowerCase().includes(s) || d.remarks?.toLowerCase().includes(s);
      const matchStatus = statusFilter === "All" || d.status === statusFilter;
      const matchCategory = categoryFilter === "All" || d.category === categoryFilter;
      const matchSector = sectorFilter === "All" || d.sector === sectorFilter;
      const matchPic = picFilter === "All" || d.pic === picFilter;
      const matchSource = sourceFilter === "All" || d.source === sourceFilter;
      return matchSearch && matchStatus && matchCategory && matchSector && matchPic && matchSource;
    });
  }, [deals, searchTerm, statusFilter, categoryFilter, sectorFilter, picFilter, sourceFilter]);

  const filteredOps = useMemo(() => {
    return opsRecords.filter(o => {
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
  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {[
          { label: "Total Pipeline", value: formatRp(stats.total), sub: `${deals.length} projects`, icon: DollarSign, color: "#0073ea", gradient: "linear-gradient(135deg, #0073ea 0%, #66ccff 100%)" },
          { label: "Won / Approved", value: formatRp(stats.won), sub: `${stats.wonCount} deals`, icon: CheckCircle2, color: "#00c875", gradient: "linear-gradient(135deg, #00c875 0%, #00e68a 100%)" },
          { label: "Active Pipeline", value: formatRp(stats.pipeline), sub: `Conversion: ${stats.conversionRate}%`, icon: Target, color: "#fdab3d", gradient: "linear-gradient(135deg, #fdab3d 0%, #ffc107 100%)" },
          { label: "Operations", value: formatRp(stats.opsTotal), sub: `${opsRecords.length} records`, icon: Activity, color: "#7b2cbf", gradient: "linear-gradient(135deg, #7b2cbf 0%, #a855f7 100%)" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, cursor: "default" }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: kpi.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <kpi.icon size={24} color="white" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", marginBottom: 4 }}>{kpi.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#323338", letterSpacing: "-0.02em" }}>{kpi.value}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: kpi.color }}>{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INDONESIA MAP */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <IndonesiaMap deals={deals} />
      </motion.div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Pipeline by Status - Bar */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", marginBottom: 20 }}>Pipeline by Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(stats.byStatus)
              .sort(([, a], [, b]) => b.value - a.value)
              .map(([status, data]) => {
                const maxBarVal = Math.max(...Object.values(stats.byStatus).map(v => v.value));
                const pct = maxBarVal > 0 ? (data.value / maxBarVal) * 100 : 0;
                const cfg = STATUS_CONFIG[status] || { label: status, color: "#888" };
                return (
                  <div key={status} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 70, fontSize: 10, fontWeight: 800, color: cfg.color }}>{cfg.label}</span>
                    <div style={{ flex: 1, height: 28, background: "#f5f6f8", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        style={{ height: "100%", background: cfg.color, borderRadius: 8, opacity: 0.8 }}
                      />
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 800, color: "#323338" }}>
                        {formatRp(data.value)} ({data.count})
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Pipeline by Sector - Donut-like */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", marginBottom: 20 }}>Pipeline by Sector</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(() => {
              const sectorColors = ["#0073ea", "#00c875", "#fdab3d", "#7b2cbf", "#e44258"];
              const entries = Object.entries(stats.bySector).sort(([, a], [, b]) => b.value - a.value);
              const maxVal = Math.max(...entries.map(([, v]) => v.value));
              return entries.map(([sector, data], idx) => (
                <div key={sector} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 90, fontSize: 10, fontWeight: 800, color: sectorColors[idx % sectorColors.length] }}>{sector}</span>
                  <div style={{ flex: 1, height: 28, background: "#f5f6f8", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${(data.value / maxVal) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      style={{ height: "100%", background: sectorColors[idx % sectorColors.length], borderRadius: 8, opacity: 0.7 }}
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
      </div>

      {/* TOP PIC PERFORMERS */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", marginBottom: 20 }}>Top Sales Performance (by PIC)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {Object.entries(stats.byPic)
            .filter(([name]) => name !== "Unassigned")
            .sort(([, a], [, b]) => b.value - a.value)
            .slice(0, 12)
            .map(([pic, data], idx) => {
              const colors = ["#0073ea", "#00c875", "#fdab3d", "#7b2cbf", "#e44258", "#ff9f43"];
              const color = colors[idx % colors.length];
              return (
                <div key={pic} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8f9fb", borderRadius: 16, border: `1px solid ${idx < 3 ? color + "30" : "#e8e8e8"}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color }}>
                    {idx + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#323338" }}>{pic}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color }}>{formatRp(data.value)} · {data.count} deals</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: PIPELINE TABLE (Sales + Partnership)
  // ============================================
  const renderPipelineTable = (source?: string) => {
    const data = source ? filteredDeals.filter(d => d.source === source) : filteredDeals;
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
            { label: "Status", val: statusFilter, set: setStatusFilter, opts: Object.keys(STATUS_CONFIG) },
            { label: "Category", val: categoryFilter, set: setCategoryFilter, opts: uniqueCategories as string[] },
            { label: "Sector", val: sectorFilter, set: setSectorFilter, opts: uniqueSectors as string[] },
            { label: "PIC", val: picFilter, set: setPicFilter, opts: uniquePics as string[] },
          ].map(f => (
            <select key={f.label} value={f.val} onChange={e => { f.set(e.target.value); setCurrentPage(1); }}
              style={{ padding: "10px 14px", background: "#f5f6f8", border: "1px solid #e8e8e8", borderRadius: 12, fontSize: 11, fontWeight: 800, color: "#323338", textTransform: "uppercase", cursor: "pointer" }}
            >
              <option value="All">All {f.label}s</option>
              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#676879", alignSelf: "center" }}>
              {data.length} results · {formatRp(data.reduce((s, d) => s + Number(d.quotation), 0))}
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead>
                <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e8e8e8" }}>
                  {["Client / Project", "Category", "Sector", "PIC", "Quotation", "Status", "Remarks"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#676879" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((deal) => (
                  <tr key={deal.id} style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", maxWidth: 300 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#323338", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{deal.client_name}</p>
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
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 60, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#c4c4c4", fontStyle: "italic" }}>No matching records found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 16, borderTop: "1px solid #f0f0f0" }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === 1 ? 0.3 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#676879" }}>{currentPage} / {pages}</span>
              <button onClick={() => setCurrentPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === pages ? 0.3 : 1 }}>
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
            style={{ padding: "10px 14px", background: "#f5f6f8", border: "1px solid #e8e8e8", borderRadius: 12, fontSize: 11, fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}
          >
            <option value="All">All Status</option>
            {["S", "A", "B", "C", "D", "E", "N", "H", "L"].map(s => <option key={s} value={s}>{s} - {STATUS_CONFIG[s]?.label || s}</option>)}
          </select>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: "#676879" }}>
            {data.length} records · {formatRp(data.reduce((s, o) => s + Number(o.total_value), 0))}
          </span>
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
                  <tr key={ops.id} style={{ borderBottom: "1px solid #f0f0f0" }}
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
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === 1 ? 0.3 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#676879" }}>{currentPage} / {pages}</span>
              <button onClick={() => setCurrentPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e8e8e8", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === pages ? 0.3 : 1 }}>
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
            { title: "Sales PIC", desc: "Dea, Iik, Zaqi, Fian...", count: 13, icon: "👥" },
            { title: "Regions", desc: "West, East, Bali", count: 3, icon: "🌍" },
            { title: "RC Legends", desc: "WC CSD, WC VSD, AS CSD...", count: 16, icon: "❄️" },
          ].map((item, i) => (
            <div key={i} style={{ padding: 20, background: "#f8f9fb", borderRadius: 16, border: "1px solid #e8e8e8", cursor: "pointer", transition: "all 0.15s" }}
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
          <button style={{ padding: "12px 24px", background: "#323338", color: "white", borderRadius: 14, border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Upload size={16} /> Import from Excel
          </button>
          <button style={{ padding: "12px 24px", background: "white", color: "#323338", borderRadius: 14, border: "1px solid #e8e8e8", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
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
      <div style={{ background: "white", borderBottom: "1px solid #e8e8e8", padding: "16px 32px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => router.push("/home")} style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid #e8e8e8", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

          <button onClick={loadData} style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #e8e8e8", background: "white", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#676879" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* TAB NAV */}
      <div style={{ background: "white", borderBottom: "1px solid #e8e8e8", padding: "0 32px" }}>
        <div style={{ display: "flex", gap: 0, maxWidth: 1400, margin: "0 auto" }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearchTerm(""); setStatusFilter("All"); setCategoryFilter("All"); setSectorFilter("All"); setPicFilter("All"); }}
                style={{
                  padding: "14px 24px", border: "none", background: "transparent", cursor: "pointer",
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
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
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
              {activeTab === "pipeline" && renderPipelineTable("EPL")}
              {activeTab === "ops" && renderOpsTable()}
              {activeTab === "partnership" && renderPipelineTable("Partnership")}
              {activeTab === "settings" && renderSettings()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
