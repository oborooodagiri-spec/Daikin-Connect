import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { format } from "date-fns";
import { ReportBase } from "@/components/ReportBase";
import { ReportBaseLandscape } from "@/components/ReportBaseLandscape";
import { createRoot } from "react-dom/client";

export async function generateConsolidatedPDF(data: any) {
  
  const pdf = new jsPDF("p", "mm", "a4");

  const portraitPages = [
    // Page 1: Cover & Executive Summary
    <div className="py-10 space-y-12 h-full">
      <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a1e4]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <h3 className="text-[10pt] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Executive Summary</h3>
        
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div className="space-y-2">
            <p className="text-[8pt] font-black text-slate-400 uppercase tracking-widest">Customer</p>
            <p className="text-2xl font-black text-[#003366]">{data.project?.customers?.name || "Private Client"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[8pt] font-black text-slate-400 uppercase tracking-widest">Site Name</p>
            <p className="text-2xl font-black text-[#003366]">{data.project?.name || "Project Site"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[8pt] font-black text-slate-400 uppercase tracking-widest">Reporting Period</p>
            <p className="text-lg font-black text-[#00a1e4]">{data.summary.monthName} {data.summary.year}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-16">
           <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[8pt] font-black text-slate-400 uppercase mb-4">Achievement Rate</p>
              <p className="text-4xl font-black text-[#003366]">{data.summary.achievementRate}%</p>
              <p className="text-[9pt] font-bold text-slate-400 mt-2">{data.summary.totalActual} of {data.summary.totalTarget} units completed</p>
           </div>
           <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[8pt] font-black text-slate-400 uppercase mb-4">Average Vitality</p>
              <p className="text-4xl font-black text-emerald-500">{data.summary.avgPerformance}%</p>
              <p className="text-[9pt] font-bold text-slate-400 mt-2">Overall site efficiency rating</p>
           </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10pt] font-black text-[#003366] uppercase tracking-widest">Status Distribution</h4>
           <div className="space-y-2">
              {data.charts.statusDistribution.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[9pt] font-bold text-slate-600 w-24">{s.name}</span>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.name === 'Normal' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${(s.value / data.summary.totalActual) * 100}%` }} />
                  </div>
                  <span className="text-[9pt] font-black text-[#003366]">{s.value}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="absolute bottom-10 left-10 right-10 p-8 border-t border-slate-100 text-center">
           <p className="text-[8pt] font-bold text-slate-300 uppercase tracking-[0.2em]">Automated Output via Daikin Connect Intelligence Hub</p>
        </div>
      </div>
    </div>,

    // Page 2: Analytical Visuals
    <div className="py-10 space-y-12">
       <h3 className="text-[10pt] font-black text-slate-400 uppercase tracking-[0.3em] border-b pb-4">Chart Performers & Trends</h3>
       
       <div className="grid grid-cols-2 gap-10">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
             <p className="text-[8pt] font-black text-[#00a1e4] uppercase mb-6">Weekly Achievement Trend</p>
             <div className="space-y-4">
                {data.charts.weeklyTrends.map((w: any, i: number) => (
                  <div key={i}>
                     <div className="flex justify-between mb-1">
                        <span className="text-[8pt] font-bold text-slate-500">{w.name}</span>
                        <span className="text-[8pt] font-black text-[#003366]">{w.actual}/{w.target}</span>
                     </div>
                     <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#003366] h-full" style={{ width: `${(w.actual / w.target) * 100}%` }} />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
             <p className="text-[8pt] font-black text-[#00a1e4] uppercase mb-6">Top Issues Pareto</p>
             <div className="space-y-4">
                {data.charts.topIssues.map((issue: any, i: number) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <span className="text-[8pt] font-bold text-slate-600">{issue.name}</span>
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[8pt] font-black rounded-lg">{issue.value} Cases</span>
                   </div>
                ))}
             </div>
          </div>
       </div>

       <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
          <p className="text-[8pt] font-black text-blue-600 uppercase mb-4">Operations Analyst Note</p>
          <p className="text-[10pt] font-medium text-slate-600 leading-relaxed italic">
            "Based on the consolidated thermal analytics for {data.summary.monthName}, the site exhibits an average vitality of {data.summary.avgPerformance}%. 
            Weekly consistency peaked in {[...data.charts.weeklyTrends].sort((a:any,b:any)=>b.actual-a.actual)[0]?.name}. 
            Technical logsheets for problematic units are attached for further investigation."
          </p>
       </div>
    </div>
  ];

  // LANDSCAPE PAGES: Daily List (Logbooks)
  const technicalPages: React.ReactElement[] = [];
  const itemsPerPage = 12;
  const totalTechnicalPages = Math.ceil(data.activities.length / itemsPerPage);

  for (let i = 0; i < totalTechnicalPages; i++) {
    const pageItems = data.activities.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
    technicalPages.push(
      <div className="py-6 h-full flex flex-col">
        <h3 className="text-[9pt] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Daily List Service HVAC Units (Logsheets)</h3>
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Date</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Unit Tag</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Area</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Amp (Avg)</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Flow</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Ent/Lvg DB</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">ΔT</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Score</th>
              <th className="p-3 text-[7pt] font-black uppercase text-slate-400 border border-slate-200">Status & Recommendations</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((act: any, idx: number) => {
              const deltaT = (Number(act.entering_db || 0) - Number(act.leaving_db || 0)).toFixed(1);
              return (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 text-[8pt] border border-slate-200 font-medium whitespace-nowrap">{new Date(act.service_date).toLocaleDateString()}</td>
                  <td className="p-3 text-[8pt] border border-slate-200 font-bold text-[#003366]">{act.units?.tag_number || act.unit_tag}</td>
                  <td className="p-3 text-[8pt] border border-slate-200 font-medium">{act.units?.area || "-"}</td>
                  <td className="p-3 text-[8pt] border border-slate-200 font-mono text-center">
                    {act.amp_r ? ((Number(act.amp_r) + Number(act.amp_s) + Number(act.amp_t)) / 3).toFixed(1) : "-"}
                  </td>
                  <td className="p-3 text-[8pt] border border-slate-200 font-mono text-center">{act.design_airflow || "-"}</td>
                  <td className="p-3 text-[8pt] border border-slate-200 font-mono text-center">{act.entering_db}/{act.leaving_db}</td>
                  <td className="p-3 text-[8pt] border border-slate-200 font-black text-center">{deltaT}°</td>
                  <td className="p-3 text-[8pt] border border-slate-200 font-black text-center text-[#00a1e4]">{act.performance?.score}%</td>
                  <td className="p-3 text-[7pt] border border-slate-200 font-medium italic text-slate-500">
                    {act.engineer_note || "Unit operational."}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const totalPages = portraitPages.length + technicalPages.length;
  const reportCode = `CON-${data.project?.id || 'GLB'}-${format(new Date(), 'yyyyMMdd')}`;

  // RENDER PORTRAIT PAGES
  for (let i = 0; i < portraitPages.length; i++) {
    if (i > 0) pdf.addPage();
    const pageDiv = document.createElement("div");
    pageDiv.style.width = "210mm";
    pageDiv.style.height = "297mm";
    pageDiv.style.position = "absolute";
    pageDiv.style.top = "-9999px";
    document.body.appendChild(pageDiv);
    const root = createRoot(pageDiv);
    await new Promise<void>((resolve) => {
      root.render(
        <ReportBase 
          reportTitle="MONTHLY OPERATIONS CONSOLIDATED REPORT" reportCode={reportCode}
          pageNumber={i + 1} totalPages={totalPages}
        >
          {portraitPages[i]}
        </ReportBase>
      );
      setTimeout(resolve, 600);
    });
    const canvas = await html2canvas(pageDiv, { scale: 2, useCORS: true, windowWidth: 794, height: 1123 });
    pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), 'JPEG', 0, 0, 210, 297);
    root.unmount();
    document.body.removeChild(pageDiv);
  }

  // RENDER LANDSCAPE PAGES
  for (let i = 0; i < technicalPages.length; i++) {
    pdf.addPage("a4", "l");
    const pageDiv = document.createElement("div");
    pageDiv.style.width = "297mm";
    pageDiv.style.height = "210mm";
    pageDiv.style.position = "absolute";
    pageDiv.style.top = "-9999px";
    document.body.appendChild(pageDiv);
    const root = createRoot(pageDiv);
    await new Promise<void>((resolve) => {
      root.render(
        <ReportBaseLandscape 
          reportTitle="SITE TECHNICAL LOGSHEETS" reportCode={reportCode}
          pageNumber={portraitPages.length + i + 1} totalPages={totalPages}
        >
          {technicalPages[i]}
        </ReportBaseLandscape>
      );
      setTimeout(resolve, 600);
    });
    const canvas = await html2canvas(pageDiv, { scale: 2, useCORS: true, windowWidth: 1123, height: 794 });
    pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), 'JPEG', 0, 0, 297, 210);
    root.unmount();
    document.body.removeChild(pageDiv);
  }

  pdf.save(`Daikin-MonthlyConsolidated-${data.project?.name || 'Project'}-${data.summary.monthName}-${data.summary.year}.pdf`);
}
