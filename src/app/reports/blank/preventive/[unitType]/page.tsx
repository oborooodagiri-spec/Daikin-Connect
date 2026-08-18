"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReportBase } from "@/components/ReportBase";
import { getUWAPPreventiveSections } from "@/components/UWAPPreventivePDFTemplate";
import { getFCUPreventiveSections } from "@/components/FCUPreventivePDFTemplate";
import { getAHUPreventiveSections } from "@/components/AHUPreventivePDFTemplate";
import { getChillerPreventiveSections } from "@/components/ChillerPreventivePDFTemplate";
import { Download, ChevronLeft } from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export default function BlankReportPage() {
  const params = useParams();
  const router = useRouter();
  const unitType = decodeURIComponent(params.unitType as string).toUpperCase();
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [reportScale, setReportScale] = useState(1);
  const [sectionHeights, setSectionHeights] = useState<number[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const reportWidth = 794; 
      const availableWidth = window.innerWidth - 20; 
      if (availableWidth < reportWidth) {
        setReportScale(availableWidth / reportWidth);
      } else {
        setReportScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    try {
      setDownloading(true);
      const elements = reportRef.current.querySelectorAll('.report-page');
      if (elements.length === 0) throw new Error("No pages found");

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const canvas = await html2canvas(el, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(`Blank_Format_Report_${unitType}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  // Generate blank data
  let sections: React.ReactNode[] = [];
  const dummyData = {
    header: {},
    scope: {},
    technicalAdvice: "",
    activity_photos: []
  };
  const dummyUnit = {
    unit_type: unitType,
    brand: "",
    building_floor: "",
    model: "",
    area: "",
    serial_number: "",
    tag_number: ""
  };

  if (unitType === "UWAP" || unitType.includes("AIR COOLED SCREW")) {
    sections = getUWAPPreventiveSections(dummyData, dummyUnit, "", "");
  } else if (unitType === "FCU" || unitType.includes("FAN COIL UNIT")) {
    sections = getFCUPreventiveSections(dummyData, dummyUnit, "", "");
  } else if (unitType === "AHU" || unitType.includes("AIR HANDLING UNIT")) {
    sections = getAHUPreventiveSections(dummyData, dummyUnit, "", "");
  } else if (unitType === "WCC" || unitType.includes("WATER COOLED")) {
    sections = getChillerPreventiveSections(dummyData, dummyUnit, "", "");
  } else {
    // Default fallback to UWAP format if unknown
    sections = getUWAPPreventiveSections(dummyData, dummyUnit, "", "");
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-[800px] mb-6 flex justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-[#323338]">Blank Report Format</h1>
            <p className="text-xs font-bold text-slate-400">Preview & Download</p>
          </div>
        </div>
        
        <button 
          onClick={handleDownload} 
          disabled={downloading}
          className="px-6 py-2.5 bg-[#0073ea] text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {downloading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sedang Proses...</>
          ) : (
            <><Download size={16} /> Download PDF</>
          )}
        </button>
      </div>

      <div 
        style={{
          transform: `scale(${reportScale})`,
          transformOrigin: 'top center',
          width: '794px',
          marginBottom: `${(1 - reportScale) * -1122}px`,
        }}
      >
        <div ref={reportRef} className="bg-[#f8f9fc]">
          <ReportBase
            title={`PREVENTIVE MAINTENANCE - ${unitType}`}
            headerData={{...dummyData.header, ...dummyUnit}}
            sections={sections}
            pageHeights={sectionHeights}
            isLandscape={false}
          />
        </div>
      </div>
    </div>
  );
}
