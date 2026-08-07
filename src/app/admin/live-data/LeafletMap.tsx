"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Dynamic map controller to fly to location
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function LeafletMap({ 
  clusters, 
  drillDownCluster, 
  setDrillDownCluster, 
  setDrillDownSearch, 
  statusLayerFilter, 
  STATUS_CONFIG, 
  canClickWidgets,
  selectedRegion,
  setSelectedRegion,
  currentZoomLevel = 0
}: any) {
  
  // Base center & zoom (Nasional)
  let center: [number, number] = [-2.0, 118.0];
  let zoom = 5;

  if (drillDownCluster) {
    // Zoom into the specific cluster
    // Offset longitude by -1.5 degrees so the point sits visually in the right 65% of the screen (since the left 35% is covered by the panel)
    center = [drillDownCluster.coords[1], drillDownCluster.coords[0] - 1.5];
    zoom = 7; // slightly lower zoom to show more context next to the panel
  } else if (selectedRegion && selectedRegion !== "All" && clusters && clusters.length > 0) {
    let sumLat = 0;
    let sumLng = 0;
    clusters.forEach((c: any) => {
      sumLat += c.coords[1];
      sumLng += c.coords[0];
    });
    // Add a slight offset to the right since the right panel takes up some space, 
    // but not as much as the drill-down panel (so -1.0)
    center = [sumLat / clusters.length, (sumLng / clusters.length) - 1.0];
    const isLargeRegion = ["Jawa", "Sumatera", "Kalimantan", "Sulawesi", "Bali & Nusa Tenggara", "Papua & Maluku"].includes(selectedRegion);
    zoom = currentZoomLevel === 1 ? (isLargeRegion ? 6 : 7) : 8; // Deeper zoom for province
  }

  const maxValue = Math.max(...clusters.map((c: any) => c.totalValue), 1);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 450, position: "relative" }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: "100%", height: "100%", background: "#c8e6f5" }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
      >
        <MapController center={center} zoom={zoom} />
        
        {/* Realistic Satellite/Terrain Map - Esri World Imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          opacity={1}
        />

        <style>{`
          .pulse-bubble {
            border-radius: 50%;
            color: white;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            border: 2px solid white;
          }
          .pulse-bubble::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid inherit;
            opacity: 0;
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .custom-pulsing-marker {
            background: transparent;
            border: none;
          }
        `}</style>

        {clusters.map((cluster: any) => {
          const totalDeals = cluster.deals.length;
          
          // Radius based on number of projects (min 16px, max 40px)
          const minRadius = 16;
          const maxRadius = 40;
          const maxExpectedDeals = 50; 
          const radiusToUse = Math.min(maxRadius, minRadius + (totalDeals / maxExpectedDeals) * (maxRadius - minRadius));
          
          const wonDeals = cluster.deals.filter((d: any) => d.status === "A").length;
          const wonRatio = wonDeals / totalDeals;
          const color = statusLayerFilter 
            ? (STATUS_CONFIG[statusLayerFilter]?.color || "#66ccff")
            : wonRatio > 0.5 ? "#00c875" : wonRatio > 0.2 ? "#fdab3d" : "#ff3366";
          
          const isActive = drillDownCluster?.key === cluster.key;
          const borderColor = isActive ? "#ffffff" : color;

          let icon;
          if (typeof window !== "undefined") {
            const L = require("leaflet");
            icon = new L.DivIcon({
              className: 'custom-pulsing-marker',
              html: `<div class="pulse-bubble" style="width: ${radiusToUse * 2}px; height: ${radiusToUse * 2}px; background: ${color}; border-color: ${borderColor}; box-shadow: ${isActive ? '0 0 20px ' + color : '0 4px 10px rgba(0,0,0,0.4)'}">
                      <span style="font-size: ${radiusToUse > 20 ? '13px' : '11px'}">${totalDeals}</span>
                     </div>`,
              iconSize: [radiusToUse * 2, radiusToUse * 2],
              iconAnchor: [radiusToUse, radiusToUse]
            });
          }

          return icon ? (
            <Marker
              key={cluster.key}
              position={[cluster.coords[1], cluster.coords[0]]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (!canClickWidgets) return;
                  if (currentZoomLevel === 0) {
                    // Level 0 (National) -> Level 1 (Island)
                    setSelectedRegion(cluster.regionName);
                  } else if (currentZoomLevel === 1) {
                    // Level 1 (Island) -> Level 2 (Province)
                    setSelectedRegion(cluster.name);
                  } else {
                    // Level 2 (Province) -> Level 3 (City Detail)
                    if (isActive) {
                      setDrillDownCluster(null);
                      setDrillDownSearch("");
                    } else {
                      setDrillDownCluster(cluster);
                      setDrillDownSearch("");
                    }
                  }
                }
              }}
            />
          ) : null;
        })}
      </MapContainer>
    </div>
  );
}
