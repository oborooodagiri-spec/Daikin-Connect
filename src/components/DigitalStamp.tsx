import React from "react";

interface DigitalStampProps {
  label?: string;
  subLabel?: string;
  name?: string;
  date?: string | Date;
}

export const DigitalStamp = ({ 
  label = "VERIFIED", 
  subLabel = "EPL CONNECT",
  name,
  date 
}: DigitalStampProps) => {
  return (
    <div style={{
      width: "35mm",
      height: "35mm",
      border: "3px double #003366",
      borderRadius: "50%",
      padding: "2mm",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transform: "rotate(-15deg)",
      opacity: 0.8,
      margin: "0 auto",
      position: "relative",
      backgroundColor: "rgba(0,51,102,0.05)",
      fontFamily: "'Inter', sans-serif",
      userSelect: "none",
      pointerEvents: "none",
    }}>
      <div style={{ 
        border: "1px solid #003366", 
        borderRadius: "50%", 
        width: "100%", 
        height: "100%", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        textAlign: "center"
      }}>
        <p style={{ 
          fontSize: "5pt", 
          fontWeight: 900, 
          color: "#003366", 
          textTransform: "uppercase", 
          margin: 0,
          lineHeight: 1
        }}>{subLabel}</p>
        
        <div style={{ 
          width: "90%", 
          height: "1px", 
          backgroundColor: "#003366", 
          margin: "1mm 0" 
        }}></div>

        <p style={{ 
          fontSize: "7pt", 
          fontWeight: 800, 
          color: "#003366", 
          textTransform: "uppercase", 
          margin: 0,
          backgroundColor: "white",
          padding: "0 2mm",
          border: "1px solid #003366",
          borderRadius: "1mm",
          boxShadow: "1px 1px 0 rgba(0,0,0,0.1)"
        }}>{label}</p>

        <div style={{ 
          width: "90%", 
          height: "1px", 
          backgroundColor: "#003366", 
          margin: "1mm 0" 
        }}></div>

        <p style={{ 
          fontSize: "5pt", 
          fontWeight: 700, 
          color: "#003366", 
          textTransform: "uppercase", 
          margin: "0.5mm 0 0 0",
          maxWidth: "25mm",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>{name || "DIGITAL RECORD"}</p>
        
        <p style={{ 
          fontSize: "4pt", 
          fontWeight: 500, 
          color: "#003366", 
          margin: 0 
        }}>{date ? (typeof date === 'string' ? date : date.toLocaleDateString()) : new Date().getFullYear()}</p>
      </div>
      
      {/* Texture Overlays for "Stamp" effect */}
      <div style={{ 
        position: "absolute", 
        top: 0, left: 0, right: 0, bottom: 0, 
        backgroundImage: "radial-gradient(circle, #003366 1px, transparent 1px)", 
        backgroundSize: "2mm 2mm", 
        opacity: 0.1 
      }}></div>
    </div>
  );
};
