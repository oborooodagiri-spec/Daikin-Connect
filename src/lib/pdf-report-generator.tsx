"use client";

import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { format } from "date-fns";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export async function generateComprehensivePDF(data: any, startDate: string, endDate: string) {
  const { ReportBase } = await import("@/components/ReportBase");
  const { createRoot } = await import("react-dom/client");
  
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  
  // Define Pages to Render
  const pages = [
    // Page 1: Executive Summary
    <div className="py-10 space-y-12">
      <div className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100">
        <h3 className="text-sm font-black text-[#003366] mb-8 uppercase tracking-widest border-b pb-4">Executive Summary</h3>
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-6">
            <p className="text-[10pt] text-slate-500 font-bold uppercase">Customer</p>
            <p className="text-xl font-black text-slate-800">{data.project?.customers?.name || "N/A"}</p>
          </div>
          <div className="space-y-6">
            <p className="text-[10pt] text-slate-500 font-bold uppercase">Project Name</p>
            <p className="text-xl font-black text-slate-800">{data.project?.name || "Global"}</p>
          </div>
          <div className="space-y-6">
            <p className="text-[10pt] text-slate-500 font-bold uppercase">Reporting Period</p>
            <p className="text-sm font-black text-[#00a1e4] px-4 py-2 bg-blue-50 rounded-full inline-block">
              {format(new Date(startDate), "dd MMM yyyy")} - {format(new Date(endDate), "dd MMM yyyy")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Total Units", value: data.stats.totalUnits, color: "bg-slate-100 text-slate-800" },
          { label: "Normal", value: data.stats.normalUnits, color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
          { label: "On Progress", value: data.stats.onProgressUnits, color: "bg-blue-50 text-blue-600 border border-blue-100" },
          { label: "Problem", value: data.stats.problemUnits, color: "bg-rose-50 text-rose-600 border border-rose-100" }
        ].map((s, i) => (
          <div key={i} className={`${s.color} p-6 rounded-3xl text-center`}>
            <p className="text-[8pt] font-black uppercase mb-2 opacity-70">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[2rem] border border-slate-200">
        <h3 className="text-sm font-black text-[#003366] mb-8 uppercase tracking-widest">Top 5 Issues (Pareto Analysis)</h3>
        <div className="space-y-4">
          {data.topIssues.map((issue: any, i: number) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-[10pt] font-black text-slate-400 w-6">0{i+1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-[10pt] font-bold text-slate-700">{issue.name}</span>
                  <span className="text-[10pt] font-black text-[#003366]">{issue.value} Cases</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#00a1e4] h-full rounded-full" 
                    style={{ width: `${(issue.value / data.topIssues[0].value) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // Page 2: Maintenance Timeline
    <div className="py-10 space-y-10">
       <h3 className="text-sm font-black text-[#003366] mb-8 uppercase tracking-widest border-b pb-4">Maintenance Schedule vs Actual</h3>
       <table className="w-full text-left border-collapse">
         <thead>
           <tr className="bg-slate-50">
             <th className="p-4 text-[9pt] font-black uppercase text-slate-400 border-b">Unit Tag</th>
             <th className="p-4 text-[9pt] font-black uppercase text-slate-400 border-b">Activity</th>
             <th className="p-4 text-[9pt] font-black uppercase text-slate-400 border-b">Scheduled</th>
             <th className="p-4 text-[9pt] font-black uppercase text-slate-400 border-b">Actual</th>
             <th className="p-4 text-[9pt] font-black uppercase text-slate-400 border-b">Status</th>
           </tr>
         </thead>
         <tbody>
           {data.units.slice(0, 15).map((u: any, i: number) => {
             const lastActivity = u.activities[0];
             const schedule = u.schedules[0];
             return (
               <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                 <td className="p-4 text-[9pt] font-bold text-slate-800">{u.tag_number || "-"}</td>
                 <td className="p-4 text-[9pt] font-bold text-slate-600">{lastActivity?.type || "Waiting"}</td>
                 <td className="p-4 text-[8pt] font-medium text-slate-500">{schedule ? format(new Date(schedule.start_at), "dd/MM/yy") : "-"}</td>
                 <td className="p-4 text-[8pt] font-medium text-slate-500">{lastActivity ? format(new Date(lastActivity.service_date), "dd/MM/yy") : "-"}</td>
                 <td className="p-4">
                    <span className={`text-[7pt] font-black uppercase px-3 py-1 rounded-full ${u.status === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {u.status}
                    </span>
                 </td>
               </tr>
             )
           })}
         </tbody>
       </table>
    </div>,

    // Page 3: Complaints & Authorization
    <div className="py-10 space-y-16">
      <div className="space-y-8">
        <h3 className="text-sm font-black text-[#003366] mb-4 uppercase tracking-widest border-b pb-4">Recent Complaints Log</h3>
        {data.complaints.length > 0 ? (
          <div className="space-y-4">
             {data.complaints.slice(0, 5).map((c: any, i: number) => (
               <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                 <div>
                   <p className="text-[10pt] font-black text-slate-800 mb-1">{c.units?.tag_number} - {c.customer_name}</p>
                   <p className="text-[9pt] text-slate-500 italic">"{c.description}"</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[8pt] font-black text-[#00a1e4] uppercase">{format(new Date(c.created_at), "dd MMM yyyy")}</p>
                   <p className="text-[8pt] font-bold text-slate-400 mt-1">{c.status}</p>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <p className="text-[10pt] text-slate-400 italic">No complaints recorded in this period.</p>
        )}
      </div>

      <div className="mt-20 pt-20 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-20">
          <div className="text-center space-y-24">
            <p className="text-[10pt] font-black text-[#003366] uppercase tracking-widest">Daikin / EPL Representative</p>
            <div className="w-48 h-24 border-b-2 border-slate-200 mx-auto relative flex items-center justify-center">
               <span className="absolute -bottom-8 text-[9pt] font-bold text-slate-400 uppercase">( Signature & Stamp )</span>
            </div>
            <div className="pt-4">
              <p className="text-[10pt] font-black text-slate-800">________________________</p>
              <p className="text-[8pt] font-bold text-slate-400 uppercase mt-2">Field Engineer / Supervisor</p>
            </div>
          </div>

          <div className="text-center space-y-24">
            <p className="text-[10pt] font-black text-[#003366] uppercase tracking-widest">Client Authorization</p>
            <div className="w-48 h-24 border-b-2 border-slate-200 mx-auto relative flex items-center justify-center">
               <span className="absolute -bottom-8 text-[9pt] font-bold text-slate-400 uppercase">( Signature & Stamp )</span>
            </div>
            <div className="pt-4">
              <p className="text-[10pt] font-black text-slate-800">________________________</p>
              <p className="text-[8pt] font-bold text-slate-400 uppercase mt-2">Valued Customer Representative</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ];

  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();

    const pageDiv = document.createElement("div");
    pageDiv.style.width = "210mm";
    pageDiv.style.height = "297mm";
    pageDiv.style.position = "absolute";
    pageDiv.style.top = "-9999px";
    pageDiv.style.left = "-9999px";
    document.body.appendChild(pageDiv);

    const root = createRoot(pageDiv);
    
    await new Promise<void>((resolve) => {
      root.render(
        <ReportBase 
          reportTitle="COMPREHENSIVE DASHBOARD STATUS REPORT" 
          reportCode={`DBR-${data.project?.id || 'GLB'}-${format(new Date(), 'yyyyMMdd')}`}
          pageNumber={i + 1}
          totalPages={totalPages}
          isFixedHeight={true}
        >
          {pages[i]}
        </ReportBase>
      );
      setTimeout(resolve, 500); // Give time for charts/images
    });

    const canvas = await html2canvas(pageDiv, { 
      scale: 2, 
      useCORS: true, 
      windowWidth: 794,
      height: 1123 
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, A4_HEIGHT_MM);

    root.unmount();
    document.body.removeChild(pageDiv);
  }

  pdf.save(`Daikin-ProjectReport-${data.project?.name || 'Global'}-${format(new Date(), 'yyyyMMdd')}.pdf`);
}
