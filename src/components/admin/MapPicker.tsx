"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2, Layers, Map as MapIcon } from "lucide-react";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Google Maps Tile Layer configurations
const MAP_LAYERS = {
  roadmap: {
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    label: "Map",
    attribution: '&copy; Google Maps',
  },
  satellite: {
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    label: "Satellite",
    attribution: '&copy; Google Maps',
  },
  hybrid: {
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    label: "Hybrid",
    attribution: '&copy; Google Maps',
  },
  terrain: {
    url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    label: "Terrain",
    attribution: '&copy; Google Maps',
  },
};

type MapLayerKey = keyof typeof MAP_LAYERS;

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, name?: string) => void;
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
  const [activeLayer, setActiveLayer] = useState<MapLayerKey>("roadmap");
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // Use Photon geocoder (better fuzzy matching) with Indonesian locale bias
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5&lang=id&lat=-2.5&lon=118&zoom=5`
      );
      const photonData = await photonRes.json();

      let results: any[] = [];

      if (photonData.features && photonData.features.length > 0) {
        results = photonData.features.map((f: any) => ({
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          display_name: [
            f.properties.name,
            f.properties.street,
            f.properties.city || f.properties.county,
            f.properties.state,
            f.properties.country,
          ].filter(Boolean).join(", "),
        }));
      }

      // Fallback: if Photon returns few results, also try Nominatim
      if (results.length < 3) {
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=id&accept-language=id`
          );
          const nomData = await nomRes.json();
          
          // Merge unique results (avoid duplicates by checking proximity)
          nomData.forEach((item: any) => {
            const isDuplicate = results.some(
              (r) => Math.abs(parseFloat(r.lat) - parseFloat(item.lat)) < 0.001 &&
                     Math.abs(parseFloat(r.lon) - parseFloat(item.lon)) < 0.001
            );
            if (!isDuplicate) {
              results.push(item);
            }
          });
        } catch {
          // Nominatim fallback failed, continue with Photon results
        }
      }

      setSearchResults(results.slice(0, 6));
    } catch (err) {
      console.error("Search failed:", err);
      // Final fallback: try Nominatim alone
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=id`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (item: any) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    onChange(newLat, newLng, item.display_name);
    setCenter([newLat, newLng]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const currentLayer = MAP_LAYERS[activeLayer];

  return (
    <div className="space-y-3 mt-4">
      {/* Search Bar */}
      <div className="relative group">
         <form onSubmit={handleSearch} className="relative z-[1001]">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi (contoh: YKK Zipco, Plaza Indonesia)..."
              className="w-full pl-11 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
               {searching ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Search size={16} />}
            </div>
            <button 
              type="button"
              onClick={handleSearch}
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
        {/* Layer Switcher */}
        <div className="absolute top-3 right-3 z-[1000]">
          <button
            type="button"
            onClick={() => setShowLayerPicker(!showLayerPicker)}
            className="w-9 h-9 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
            title="Ganti tampilan peta"
          >
            <Layers size={16} className="text-slate-600" />
          </button>
          {showLayerPicker && (
            <div className="absolute top-11 right-0 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden min-w-[120px]">
              {(Object.keys(MAP_LAYERS) as MapLayerKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActiveLayer(key); setShowLayerPicker(false); }}
                  className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                    activeLayer === key 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <MapIcon size={12} />
                  {MAP_LAYERS[key].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution={currentLayer.attribution}
            url={currentLayer.url}
            maxZoom={20}
          />
          <LocationMarker lat={lat} lng={lng} onChange={onChange} />
          <ChangeView center={center} />
        </MapContainer>
      </div>
      <p className="text-[9px] text-slate-400 font-bold italic px-1">* Klik pada peta atau gunakan search untuk memindahkan pin. Gunakan tombol <Layers size={10} className="inline" /> untuk mengganti tampilan peta.</p>
    </div>
  );
}
