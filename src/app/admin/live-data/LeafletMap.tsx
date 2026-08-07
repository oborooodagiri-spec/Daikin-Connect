"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap, Tooltip } from "react-leaflet";
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
  canClickWidgets 
}: any) {
  
  // Base center & zoom (Nasional)
  let center: [number, number] = [-2.0, 118.0];
  let zoom = 5;

  if (drillDownCluster) {
    // Zoom into the specific cluster
    center = [drillDownCluster.coords[1], drillDownCluster.coords[0]];
    zoom = 8;
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

        {clusters.map((cluster: any) => {
          const radius = Math.max(12, Math.min(35, (cluster.totalValue / maxValue) * 35));
          const wonDeals = cluster.deals.filter((d: any) => d.status === "A").length;
          const totalDeals = cluster.deals.length;
          const wonRatio = wonDeals / totalDeals;
          const color = statusLayerFilter 
            ? (STATUS_CONFIG[statusLayerFilter]?.color || "#66ccff")
            : wonRatio > 0.5 ? "#00c875" : wonRatio > 0.2 ? "#fdab3d" : "#66ccff";
          
          const isActive = drillDownCluster?.key === cluster.key;

          return (
            <CircleMarker
              key={cluster.key}
              center={[cluster.coords[1], cluster.coords[0]]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: isActive ? 0.8 : 0.6,
                color: "#ffffff",
                weight: isActive ? 3 : 1,
                opacity: 1
              }}
              eventHandlers={{
                click: () => {
                  if (!canClickWidgets) return;
                  if (isActive) {
                    setDrillDownCluster(null);
                    setDrillDownSearch("");
                  } else {
                    setDrillDownCluster(cluster);
                    setDrillDownSearch("");
                  }
                }
              }}
            >
              <Tooltip direction="bottom" offset={[0, 10]} opacity={1} permanent>
                <div style={{ textAlign: "center", fontWeight: "bold", color: "#333", fontSize: "10px" }}>
                  {totalDeals}
                  <br/>
                  <span style={{ fontSize: "8px", color: "#666" }}>{cluster.name}</span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
