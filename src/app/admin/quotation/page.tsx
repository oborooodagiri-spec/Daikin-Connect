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

        <div className="app-grid">
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

      <style>{`
        .app-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
        }
        
        @media (min-width: 640px) {
          .app-grid {
            gap: 20px;
          }
        }
        
        .app-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          background: #ffffff;
          border: 1px solid #e6e9ef;
          border-radius: 16px;
          padding: 16px 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          user-select: none;
          flex: 0 0 calc(33.333% - 8px);
          max-width: calc(33.333% - 8px);
        }

        @media (min-width: 480px) {
          .app-item {
            flex: 0 0 110px;
            max-width: 110px;
          }
        }

        .app-item:hover {
          border-color: #0073ea;
          box-shadow: 0 10px 15px -3px rgba(0, 73, 234, 0.08), 0 4px 6px -2px rgba(0, 73, 234, 0.04);
          transform: translateY(-2px);
        }
        
        .app-item:active {
          transform: translateY(0) scale(0.97);
        }
        
        .app-icon-container {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .app-item:hover .app-icon-container {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        
        .app-label {
          font-size: 11px;
          font-weight: 600;
          color: #323338;
          line-height: 1.3;
          max-width: 90px;
          word-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        @media (min-width: 640px) {
          .app-icon-container {
            width: 52px;
            height: 52px;
            border-radius: 14px;
          }
          .app-label {
            font-size: 12px;
            font-weight: 600;
          }
        }
      `}</style>
    </div>
  );
}
