import React, { useState, useEffect } from "react";
import { X, Save, Target } from "lucide-react";
import { getTargetSettings, updateTargetSettings, getSalesEngineers } from "@/app/actions/pipeline";

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TargetSettingsModal({ isOpen, onClose }: TargetSettingsModalProps) {
  const [totalTarget, setTotalTarget] = useState<number>(0);
  const [picTargets, setPicTargets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salesEngineers, setSalesEngineers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const [targetsRes, seRes] = await Promise.all([
      getTargetSettings(),
      getSalesEngineers()
    ]);
    
    setTotalTarget(targetsRes?.total || 0);
    setPicTargets(targetsRes?.byPic || {});
    
    if ((seRes as any).success) {
      setSalesEngineers((seRes as any).data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      total: totalTarget,
      byPic: picTargets,
    };
    const res = await updateTargetSettings(data);
    setSaving(false);
    if ((res as any).error) {
      alert("Failed to save: " + (res as any).error);
    } else {
      onClose();
    }
  };

  const updatePicTarget = (pic: string, value: string) => {
    const numericValue = value ? parseInt(value.replace(/\D/g, ""), 10) : 0;
    setPicTargets(prev => ({ ...prev, [pic]: numericValue }));
  };

  const formatCurrency = (val: number) => {
    if (!val) return "";
    return "Rp " + val.toLocaleString("id-ID");
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 600, background: "white", borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#323338" }}>Sales Targets</h2>
            <p style={{ fontSize: 13, color: "#676879", marginTop: 4 }}>Set overall target and individual PIC targets.</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#f5f6f8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#676879" />
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: 40, color: "#676879" }}>Loading...</p>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#f8f9fb", padding: 16, borderRadius: 12, border: "1px solid #e8e8e8" }}>
              <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#676879" }}>
                Total Target
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: 10, fontSize: 14, fontWeight: 600, color: "#323338" }}>Rp</span>
                <input 
                  type="text" 
                  value={formatCurrency(totalTarget).replace("Rp ", "")} 
                  onChange={e => {
                    const numericValue = e.target.value ? parseInt(e.target.value.replace(/\D/g, ""), 10) : 0;
                    setTotalTarget(numericValue);
                  }}
                  style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 10, border: "1px solid #e8e8e8", fontSize: 15, fontWeight: 700, outline: "none", background: "white" }} 
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#323338", marginBottom: 12 }}>Target Per PIC / Sales</h3>
              <div style={{ border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e8e8e8" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#676879", width: "40%" }}>PIC Name</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#676879" }}>Target (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesEngineers
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((se) => (
                      <tr key={se.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#323338" }}>{se.name}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <input 
                            type="text"
                            value={formatCurrency(picTargets[se.name] || 0).replace("Rp ", "")}
                            onChange={(e) => updatePicTarget(se.name, e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e8e8e8", fontSize: 13, fontWeight: 600, outline: "none" }}
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    ))}
                    {salesEngineers.length === 0 && (
                      <tr>
                        <td colSpan={2} style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#999", fontStyle: "italic" }}>No registered PICs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
          <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #e8e8e8", background: "white", fontSize: 13, fontWeight: 800, color: "#676879", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "#00c875", color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
