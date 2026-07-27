import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { getPICAreas, updatePICAreas, getSalesEngineers } from "@/app/actions/pipeline";

const REGION_OPTIONS = ["West", "East", "Bali", "National", "Other"];

interface PICSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PICSettingsModal({ isOpen, onClose }: PICSettingsModalProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPic, setNewPic] = useState("");
  const [newArea, setNewArea] = useState("");
  const [salesEngineers, setSalesEngineers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadMappings();
    }
  }, [isOpen]);

  const loadMappings = async () => {
    setLoading(true);
    const [areasRes, seRes] = await Promise.all([
      getPICAreas(),
      getSalesEngineers()
    ]);
    setMappings(areasRes || {});
    if (seRes.success) {
      setSalesEngineers(seRes.data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updatePICAreas(mappings);
    setSaving(false);
    if (res.error) {
      alert("Failed to save: " + res.error);
    } else {
      onClose();
    }
  };

  const addMapping = () => {
    if (!newPic.trim() || !newArea.trim()) return;
    setMappings(prev => ({ ...prev, [newPic.trim()]: newArea.trim() }));
    setNewPic("");
    setNewArea("");
  };

  const removeMapping = (pic: string) => {
    setMappings(prev => {
      const copy = { ...prev };
      delete copy[pic];
      return copy;
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 600, background: "white", borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#323338" }}>PIC Area Settings</h2>
            <p style={{ fontSize: 13, color: "#676879", marginTop: 4 }}>Map Sales Engineers to their respective areas.</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#f5f6f8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#676879" />
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: 40, color: "#676879" }}>Loading...</p>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", background: "#f8f9fb", padding: 16, borderRadius: 12, border: "1px solid #e8e8e8" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#676879", marginBottom: 6, display: "block" }}>PIC Name</label>
                <select value={newPic} onChange={e => setNewPic(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e8e8e8", fontSize: 13, outline: "none", background: "white", cursor: "pointer" }}>
                  <option value="">Select PIC</option>
                  {salesEngineers.map(se => (
                    <option key={se.id} value={se.name}>{se.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#676879", marginBottom: 6, display: "block" }}>Area / Region</label>
                <select value={newArea} onChange={e => setNewArea(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e8e8e8", fontSize: 13, outline: "none", background: "white", cursor: "pointer" }}>
                  <option value="">Select Area</option>
                  {REGION_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button onClick={addMapping} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#0073ea", color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, height: 40 }}>
                <Plus size={16} /> Add
              </button>
            </div>

            <div style={{ border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e8e8e8" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#676879" }}>PIC Name</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#676879" }}>Area</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(mappings).map(([pic, area]) => (
                    <tr key={pic} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#323338" }}>{pic}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#676879" }}>{area}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button onClick={() => removeMapping(pic)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(mappings).length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#999", fontStyle: "italic" }}>No PIC mappings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
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
