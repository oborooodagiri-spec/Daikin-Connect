import React, { useState, useEffect } from "react";
import { X, Save, Search } from "lucide-react";
import { getPartnershipPICs, updatePartnershipPICs, getInternalUsers } from "@/app/actions/pipeline";

interface PartnershipSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnershipSettingsModal({ isOpen, onClose }: PartnershipSettingsModalProps) {
  const [selectedPics, setSelectedPics] = useState<string[]>([]);
  const [internalUsers, setInternalUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const [picsRes, usersRes] = await Promise.all([
      getPartnershipPICs(),
      getInternalUsers()
    ]);
    setSelectedPics(picsRes || []);
    if ((usersRes as any).success) {
      setInternalUsers((usersRes as any).data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updatePartnershipPICs(selectedPics);
    setSaving(false);
    if ((res as any).error) {
      alert("Failed to save: " + (res as any).error);
    } else {
      onClose();
    }
  };

  const toggleSelection = (name: string) => {
    setSelectedPics(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  if (!isOpen) return null;

  const filteredUsers = internalUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 600, background: "white", borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#323338" }}>Partnership Config</h2>
            <p style={{ fontSize: 13, color: "#676879", marginTop: 4 }}>Select users who can act as Partnership PIC / Sales Relation.</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#f5f6f8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#676879" />
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: 40, color: "#676879" }}>Loading...</p>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Search size={16} color="#999" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                placeholder="Search user..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 12, border: "1px solid #e8e8e8", fontSize: 14, outline: "none", background: "#f8f9fb" }} 
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filteredUsers.map(user => {
                const isSelected = selectedPics.includes(user.name);
                return (
                  <label key={user.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, border: `1px solid ${isSelected ? "#0073ea" : "#e8e8e8"}`, background: isSelected ? "#f0f7ff" : "white", cursor: "pointer", transition: "all 0.15s" }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelection(user.name)}
                      style={{ width: 18, height: 18, accentColor: "#0073ea", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 14, fontWeight: isSelected ? 800 : 600, color: isSelected ? "#0073ea" : "#323338" }}>
                      {user.name}
                    </span>
                  </label>
                );
              })}
            </div>
            {filteredUsers.length === 0 && (
              <p style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 13 }}>No users found.</p>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32, paddingTop: 24, borderTop: "1px solid #e8e8e8" }}>
          <button onClick={onClose} style={{ padding: "0 20px", height: 44, borderRadius: 12, border: "1px solid #e8e8e8", background: "white", color: "#676879", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "0 24px", height: 44, borderRadius: 12, border: "none", background: "#0073ea", color: "white", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
