"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, BarChart3, PieChart, Map, Settings, Plus, Search,
  Download, Upload, Edit2, Trash2, ChevronRight, ChevronLeft,
  Filter, DollarSign, Target, Users, Building2, ArrowUpRight,
  ArrowDownRight, Activity, Globe2, Layers, RefreshCw, X,
  CheckCircle2, Clock, AlertTriangle, Briefcase, ArrowLeft, Trophy
} from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import DealFormModal from "./DealFormModal";
import OpsFormModal from "./OpsFormModal";

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
  updated_at: string;
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
// INDONESIA MAP COMPONENT
// ============================================
const PROVINCE_COORDS: Record<string, { coords: [number, number]; name: string }> = {
  "jakarta": { coords: [106.8456, -6.2088], name: "DKI Jakarta" },
  "west_java": { coords: [107.6191, -6.9175], name: "Jawa Barat" },
  "central_java": { coords: [110.4225, -6.9697], name: "Jawa Tengah" },
  "east_java": { coords: [112.7521, -7.2504], name: "Jawa Timur" },
  "banten": { coords: [106.1503, -6.1200], name: "Banten" },
  "bali": { coords: [115.2167, -8.6500], name: "Bali" },
  "north_sumatra": { coords: [99.0689, 2.1154], name: "Sumatera Utara" },
  "west_sumatra": { coords: [100.4651, -0.9471], name: "Sumatera Barat" },
  "south_sumatra": { coords: [104.7458, -2.9909], name: "Sumatera Selatan" },
  "riau": { coords: [101.4498, 0.5116], name: "Riau" },
  "lampung": { coords: [105.2667, -5.4500], name: "Lampung" },
  "west_kalimantan": { coords: [109.3333, -0.0227], name: "Kalimantan Barat" },
  "east_kalimantan": { coords: [117.1536, -0.4705], name: "Kalimantan Timur" },
  "south_kalimantan": { coords: [114.5901, -3.3194], name: "Kalimantan Selatan" },
  "north_sulawesi": { coords: [124.8455, 1.4931], name: "Sulawesi Utara" },
  "south_sulawesi": { coords: [119.4327, -5.1476], name: "Sulawesi Selatan" },
  "ntb": { coords: [116.1167, -8.5833], name: "NTB" },
  "ntt": { coords: [123.5833, -10.1667], name: "NTT" },
  "papua": { coords: [140.7060, -2.5337], name: "Papua" },
  "maluku": { coords: [128.1814, -3.6954], name: "Maluku" },
  "batam": { coords: [104.0305, 1.1301], name: "Batam" },
  "medan": { coords: [98.6722, 3.5952], name: "Medan" },
  "bandung": { coords: [107.6191, -6.9175], name: "Bandung" },
  "surabaya": { coords: [112.7521, -7.2504], name: "Surabaya" },
  "yogyakarta": { coords: [110.3695, -7.7956], name: "Yogyakarta" },
  "semarang": { coords: [110.4225, -6.9697], name: "Semarang" },
  "makassar": { coords: [119.4327, -5.1476], name: "Makassar" },
  "manado": { coords: [124.8455, 1.4931], name: "Manado" },
  "palembang": { coords: [104.7458, -2.9909], name: "Palembang" },
  "pekanbaru": { coords: [101.4498, 0.5116], name: "Pekanbaru" },
};

// Map region keywords to rough geographic coordinates
function guessCoords(deal: Deal): { coords: [number, number] } | null {
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
  if (deal.region === "East") return { coords: [112.7521, -7.2504] }; // East defaults to Surabaya roughly
  if (deal.region === "Bali") return PROVINCE_COORDS.bali;
  
  // Default West = Jakarta area
  return PROVINCE_COORDS.jakarta;
}

function IndonesiaMap({ deals }: { deals: Deal[] }) {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any } | null>(null);

  // Cluster deals by approximate geographic location
  const clusters = useMemo(() => {
    const clusterMap: Record<string, { coords: [number, number]; deals: Deal[]; totalValue: number; name: string }> = {};
    
    deals.forEach(deal => {
      if (deal.status === "L") return; // Skip lost deals
      const geo = guessCoords(deal);
      if (!geo) return;
      
      // Cluster by roughly grouping coordinates (round to 1 decimal place = ~11km)
      const key = `${geo.coords[0].toFixed(1)}-${geo.coords[1].toFixed(1)}`;
      
      if (!clusterMap[key]) {
        // Find nearest named location
        let nearestName = "Other";
        let nearestDist = Infinity;
        for (const [, prov] of Object.entries(PROVINCE_COORDS)) {
          // simple euclidean dist for finding nearest named point (good enough for labeling)
          const dist = Math.sqrt((geo.coords[0] - prov.coords[0]) ** 2 + (geo.coords[1] - prov.coords[1]) ** 2);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestName = prov.name;
          }
        }
        clusterMap[key] = { coords: geo.coords, deals: [], totalValue: 0, name: nearestName };
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
      <svg width="100%" viewBox="0 0 700 450" style={{ opacity: 0.06, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        {Array.from({ length: 35 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={450} stroke="#66ccff" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 23 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 20} x2={700} y2={i * 20} stroke="#66ccff" strokeWidth={0.5} />
        ))}
      </svg>

      {/* Main Geographic Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 750,
          center: [118.5, -2]
        }}
        width={700}
        height={450}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography="/maps/indonesia.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#66ccff"
                fillOpacity={0.12}
                stroke="#66ccff"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fillOpacity: 0.25, outline: "none", cursor: "pointer" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Animated Markers for clusters */}
        {clusters.map((cluster) => {
          const radius = Math.max(8, Math.min(35, (cluster.totalValue / maxValue) * 35));
          const isHovered = hoveredCluster === cluster.key;
          const wonDeals = cluster.deals.filter(d => d.status === "A").length;
          const totalDeals = cluster.deals.length;
          const wonRatio = wonDeals / totalDeals;
          const color = wonRatio > 0.5 ? "#00c875" : wonRatio > 0.2 ? "#fdab3d" : "#66ccff";
          
          return (
            <Marker key={cluster.key} coordinates={cluster.coords}>
              <g>
                {/* Pulse animation */}
                <circle cx={0} cy={0} r={radius + 8} fill="none" stroke={color} strokeWidth={1} opacity={0.3}>
                  <animate attributeName="r" from={radius} to={radius + 20} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                
                {/* Main dot */}
                <circle
                  cx={0} cy={0} r={radius}
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
                <text x={0} y={4} textAnchor="middle" fill="white" fontSize={radius > 15 ? 11 : 9} fontWeight="800">
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
          Expanded Product Line - National
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
  const [leaderboardDeals, setLeaderboardDeals] = useState<Deal[]>([]);
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
  const [editingOps, setEditingOps] = useState<OpsRecord | null>(null);
  const [showOpsModal, setShowOpsModal] = useState(false);
  const itemsPerPage = 20;

  const currentFY = useMemo(() => {
    const d = new Date();
    return d.getMonth() >= 4 ? d.getFullYear() - 2000 : d.getFullYear() - 2000 - 1;
  }, []);
  const [selectedFY, setSelectedFY] = useState(currentFY);
  const fyOptions = Array.from({ length: 5 }, (_, i) => currentFY - i);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dealsRes, opsRes, leaderboardRes] = await Promise.all([
        fetch("/api/v1/pipeline/deals").then(r => r.json()),
        fetch("/api/v1/pipeline/ops").then(r => r.json()),
        fetch("/api/v1/pipeline/deals?type=leaderboard").then(r => r.json()),
      ]);
      if (dealsRes.success) setDeals(dealsRes.data || []);
      if (opsRes.success) setOpsRecords(opsRes.data || []);
      if (leaderboardRes.success) setLeaderboardDeals(leaderboardRes.data || []);
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const stats = useMemo(() => {
    let total = 0, won = 0, pipeline = 0, lost = 0;
    let wonCount = 0, activeCount = 0;
    let weightedPipeline = 0;
    let backlogValue = 0, backlogCount = 0;
    let newFyValue = 0, newFyCount = 0;

    const byStatus: Record<string, { count: number; value: number }> = {};
    const byPic: Record<string, { 
      totalValue: number; totalCount: number; 
      wonValue: number; wonCount: number; 
      lostValue: number; lostCount: number;
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
      "H": 0,     // Hold: 0%
      "S": 0,
      "N": 0
    };

    const fyStart = new Date(2000 + selectedFY, 3, 1).getTime(); // April 1
    const fyEnd = new Date(2000 + selectedFY + 1, 2, 31, 23, 59, 59, 999).getTime(); // March 31

    deals.forEach(d => {
      const cTime = new Date(d.created_at).getTime();
      const uTime = new Date(d.updated_at).getTime();

      // FY FILTERING LOGIC
      if (cTime > fyEnd) return; // Created after this FY ended
      if (['A', 'L'].includes(d.status) && uTime < fyStart) return; // Closed before this FY started
      
      const isBacklog = cTime < fyStart;
      const val = Number(d.quotation) || 0;
      
      total += val;
      if (isBacklog) {
        backlogValue += val;
        backlogCount++;
      } else {
        newFyValue += val;
        newFyCount++;
      }
      
      // Funnel & Totals
      if (d.status === "A") { won += val; wonCount++; }
      else if (d.status === "L") { lost += val; }
      else { pipeline += val; }
      
      if (!["L", "H"].includes(d.status)) activeCount++;

      // Weighted expected revenue
      const prob = PROBABILITIES[d.status] !== undefined ? PROBABILITIES[d.status] : 0;
      weightedPipeline += (val * prob);

      // By Status
      if (!byStatus[d.status]) byStatus[d.status] = { count: 0, value: 0 };
      byStatus[d.status].count++;
      byStatus[d.status].value += val;

      // By PIC (Advanced) - Now handled via leaderboardDeals separately
      // Removed from this deals.forEach loop to avoid duplicate/missing global PIC stats

      // By Sector
      const sec = d.sector || "Other";
      if (!bySector[sec]) bySector[sec] = { count: 0, value: 0 };
      bySector[sec].count++;
      bySector[sec].value += val;

      // By Category
      const cat = d.category || "Other";
      if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
      byCategory[cat].count++;
      byCategory[cat].value += val;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let overdueCount = 0;

    leaderboardDeals.forEach(d => {
      const val = Number(d.quotation) || 0;
      const pic = d.pic || "Unassigned";
      if (!byPic[pic]) byPic[pic] = { totalValue: 0, totalCount: 0, wonValue: 0, wonCount: 0, lostValue: 0, lostCount: 0, overdueCount: 0 };
      byPic[pic].totalValue += val;
      byPic[pic].totalCount++;
      if (d.status === "A") { byPic[pic].wonValue += val; byPic[pic].wonCount++; }
      if (d.status === "L") { byPic[pic].lostValue += val; byPic[pic].lostCount++; }
      
      if (d.target_po_date) {
        const targetDate = new Date(d.target_po_date);
        if (targetDate < today && !["A", "L", "S", "N"].includes(d.status)) {
          overdueCount++;
          byPic[pic].overdueCount = (byPic[pic].overdueCount || 0) + 1;
        }
      }
    });

    const conversionRate = activeCount > 0 ? ((wonCount / activeCount) * 100).toFixed(1) : "0";
    const conversionRateValue = (pipeline + won) > 0 ? ((won / (pipeline + won)) * 100).toFixed(1) : "0";

    return {
      total, won, pipeline, lost, wonCount, activeCount, weightedPipeline,
      conversionRate, conversionRateValue, overdueCount,
      backlogValue, backlogCount, newFyValue, newFyCount,
      byStatus, byPic, bySector, byCategory
    };
  }, [deals, leaderboardDeals, selectedFY]);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: `FY${selectedFY} Pipeline`, value: formatRp(stats.newFyValue), sub: `${stats.newFyCount} projects created this year`, icon: Briefcase, color: "#00c875", gradient: "linear-gradient(135deg, #00c875 0%, #34d399 100%)" },
          { label: "Backlog Pipeline", value: formatRp(stats.backlogValue), sub: `${stats.backlogCount} projects carried over`, icon: Clock, color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" },
          { label: "Gross Pipeline (Total)", value: formatRp(stats.pipeline), sub: `${deals.length} active projects`, icon: DollarSign, color: "#0073ea", gradient: "linear-gradient(135deg, #0073ea 0%, #66ccff 100%)" },
          { label: "Expected Revenue", value: formatRp(stats.weightedPipeline), sub: `Risk-adjusted projection`, icon: Target, color: "#7b2cbf", gradient: "linear-gradient(135deg, #7b2cbf 0%, #a855f7 100%)" },
          { label: "Total Won", value: formatRp(stats.won), sub: `${stats.wonCount} projects secured`, icon: Trophy, color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" },
          { label: "Overdue Projects", value: stats.overdueCount, sub: `Past Target PO`, icon: AlertTriangle, color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, cursor: "default", padding: "20px" }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: kpi.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${kpi.color}40` }}>
              <kpi.icon size={22} color="white" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", marginBottom: 4 }}>{kpi.label}</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#323338", letterSpacing: "-0.02em" }}>{kpi.value}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: kpi.color, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INDONESIA MAP */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <IndonesiaMap deals={deals} />
      </motion.div>

      {/* SALES PERFORMANCE MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP PERFORMERS (MOST PO) */}
        <div style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
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
                  <div key={pic} style={{ position: "relative" }}>
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
                  <div key={pic} style={{ position: "relative" }}>
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
              <AlertTriangle size={16} color="#e44258" />
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
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#e44258", background: "rgba(228,66,88,0.1)", padding: "2px 6px", borderRadius: 4 }}>{data.lostCount} projects</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: "#e44258" }}>{formatRp(data.lostValue)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: "#fee2e2", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(data.lostValue / maxVal) * 100}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#e44258", borderRadius: 4 }} />
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
          <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", marginBottom: 20 }}>Pipeline Status Funnel</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["T", "E", "D", "C", "B", "A"]
              .map((status) => {
                const data = stats.byStatus[status];
                if (!data) return null;
                const maxVal = Math.max(...Object.values(stats.byStatus).map(v => v.value));
                const cfg = STATUS_CONFIG[status] || { label: status, color: "#888" };
                const pct = (data.value / maxVal) * 100;
                return (
                  <div key={status} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 80, fontSize: 10, fontWeight: 800, color: cfg.color, textAlign: "right" }}>{cfg.label}</span>
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
                const total = stats.pipeline + stats.won + stats.lost;
                if (total === 0) return null;
                const wonPct = stats.won / total;
                const lostPct = stats.lost / total;
                const circumference = 2 * Math.PI * 80;
                const wonStroke = wonPct * circumference;
                const lostStroke = lostPct * circumference;
                return (
                  <>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#00c875" strokeWidth="20" strokeDasharray={`${wonStroke} ${circumference}`} />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e44258" strokeWidth="20" strokeDasharray={`${lostStroke} ${circumference}`} strokeDashoffset={-wonStroke} />
                  </>
                );
              })()}
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <text style={{ fontSize: 10, fontWeight: 800, color: "#676879", letterSpacing: "0.05em" }}>GROSS PIPELINE</text>
              <text style={{ fontSize: 18, fontWeight: 900, color: "#323338", marginTop: 2 }}>{formatRp(stats.pipeline + stats.won + stats.lost)}</text>
            </div>
            
            <div style={{ position: "absolute", bottom: -20, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: "#00c875", textTransform: "uppercase" }}>Secured PO</p>
                <p style={{ fontSize: 13, fontWeight: 900, color: "#323338" }}>{formatRp(stats.won)}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: "#e44258", textTransform: "uppercase" }}>Lost Value</p>
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
                <div key={sector} style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(253, 171, 61, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={16} color="#fdab3d" />
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#323338" }}>Pipeline by Category</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(() => {
              const catColors = ["#fdab3d", "#7b2cbf", "#00c875", "#0073ea", "#ff9f43"];
              const entries = Object.entries(stats.byCategory).sort(([, a], [, b]) => b.value - a.value).slice(0, 5);
              const maxVal = Math.max(...entries.map(([, v]) => v.value), 1);
              return entries.map(([category, data], idx) => (
                <div key={category} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 90, fontSize: 10, fontWeight: 800, color: catColors[idx % catColors.length] }}>{category}</span>
                  <div style={{ flex: 1, height: 28, background: "#f8fafc", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(data.value / maxVal) * 100}%` }} transition={{ duration: 0.8 }}
                      style={{ height: "100%", background: catColors[idx % catColors.length], borderRadius: 8, opacity: 0.8 }}
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
                  {["Client / Project", "Category", "Sector", "PIC", "Quotation", "Status", "Remarks", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#676879" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((deal) => {
                  const targetDate = deal.target_po_date ? new Date(deal.target_po_date) : null;
                  const isOverdue = targetDate && targetDate < new Date() && !["A", "L", "S", "N"].includes(deal.status);
                  
                  return (
                  <tr key={deal.id} className={isOverdue ? "animate-pulse border-red-500 border-l-4" : ""} style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.15s", backgroundColor: isOverdue ? "rgba(239,68,68,0.05)" : "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.1)" : "#f8f9fb")}
                    onMouseLeave={e => (e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.05)" : "transparent")}
                  >
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
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); setShowAddModal(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex">
                        <Edit2 size={16} />
                      </button>
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
                  {["#", "Customer", "Project", "Total Value", "Status", "Remark", "Actions"].map(h => (
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
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingOps(ops); setShowOpsModal(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 60, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#c4c4c4", fontStyle: "italic" }}>No matching records found</td></tr>
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
      <div className="px-4 md:px-8 py-4" style={{ background: "white", borderBottom: "1px solid #e8e8e8", position: "sticky", top: 0, zIndex: 50 }}>
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

            <div className="flex items-center gap-4">
              <select value={selectedFY} onChange={e => setSelectedFY(Number(e.target.value))}
                className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer">
                {fyOptions.map(fy => (
                  <option key={fy} value={fy}>FY{fy} {fy === currentFY ? "(Current)" : ""}</option>
                ))}
              </select>
              <button onClick={loadData} style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #e8e8e8", background: "white", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#676879" }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

      {/* TAB NAV */}
      <div className="px-4 md:px-8" style={{ background: "white", borderBottom: "1px solid #e8e8e8" }}>
        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ display: "flex", gap: 0, maxWidth: 1400, margin: "0 auto" }}>
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
              {activeTab === "pipeline" && renderPipelineTable("EPL")}
              {activeTab === "ops" && renderOpsTable()}
              {activeTab === "partnership" && renderPipelineTable("Partnership")}
              {activeTab === "settings" && renderSettings()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <DealFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={loadData} deal={editingDeal} sessionName="" />
      <OpsFormModal isOpen={showOpsModal} onClose={() => setShowOpsModal(false)} onSuccess={loadData} opsRecord={editingOps} />
    </div>
  );
}
