"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2 } from "lucide-react";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return lat && lng ? (
    <Marker position={[lat, lng]} />
  ) : null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [center, setCenter] = useState<[number, number]>([lat || -6.2088, lng || 106.8456]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (item: any) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    onChange(newLat, newLng);
    setCenter([newLat, newLng]);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-3 mt-4">
      {/* Search Bar */}
      <div className="relative group">
         <form onSubmit={handleSearch} className="relative z-[1001]">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi (contoh: Plaza Indonesia)..."
              className="w-full pl-11 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
               {searching ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Search size={16} />}
            </div>
            <button 
              type="submit"
              disabled={searching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#003366] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all"
            >
               Search
            </button>
         </form>

         {/* Search Results Dropdown */}
         {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-[1002] overflow-hidden animate-in fade-in slide-in-from-top-2">
               {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectLocation(item)}
                    className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-start gap-3 border-b border-slate-50 last:border-none transition-colors"
                  >
                     <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                     <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{item.display_name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lat: {item.lat}, Lng: {item.lon}</p>
                     </div>
                  </button>
               ))}
            </div>
         )}
      </div>

      <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker lat={lat} lng={lng} onChange={onChange} />
          <ChangeView center={center} />
        </MapContainer>
      </div>
      <p className="text-[9px] text-slate-400 font-bold italic px-1">* Klik pada peta atau gunakan search untuk memindahkan pin.</p>
    </div>
  );
}
