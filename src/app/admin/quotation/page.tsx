"use client";

import { BookOpen, Briefcase, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuotationDashboard() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 64px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ padding: "6px 12px", background: "#323338", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            QUOTATION & RATES
          </div>
        </div>
        
        <p style={{ fontSize: 13, color: "#676879", marginBottom: 24, fontWeight: 600 }}>
          Manage BoQ and Official Rate Cards
        </p>

        <div className="app-grid-admin">
          {/* Master Pricelist */}
          <div 
            className="app-item"
            onClick={() => router.push("/admin/pricelist")}
          >
             <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #2b9348 0%, #55a630 100%)" }}>
                <Database size={22} />
             </div>
             <span className="app-label">Master Pricelist</span>
          </div>

          {/* BoQ Builder */}
          <div 
            className="app-item"
            onClick={() => router.push("/admin/quotation/boq-builder")}
          >
             <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #5a189a 0%, #7b2cbf 100%)" }}>
                <BookOpen size={22} />
             </div>
             <span className="app-label">EPL BoQ Builder</span>
          </div>

          {/* Rate Card */}
          <div 
            className="app-item"
            onClick={() => router.push("/admin/quotation/rate-card")}
          >
             <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #0073ea 0%, #00a1e4 100%)" }}>
                <Briefcase size={22} />
             </div>
             <span className="app-label">Rate Card Maintenance</span>
          </div>
        </div>
      </main>
    </div>
  );
}
