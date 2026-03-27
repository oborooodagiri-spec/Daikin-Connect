import React from "react";

export default function SummaryCards({ data }: { data: any }) {
  const cards = [
    { title: "TOTAL CUSTOMERS", value: data.totalCustomers, type: "number", color: "blue-500", suffix: "" },
    { title: "ACTIVE SITES", value: data.activeSites, type: "number", color: "sky-500", suffix: "" },
    { title: "DATABASE ASSETS", value: data.databaseAssets, type: "number", color: "slate-700", suffix: " UNITS" },
    { title: "AUDIT", value: data.databaseAssets > 0 ? ((data.audit / data.databaseAssets) * 100).toFixed(1) : "0.0", type: "percent", color: "bg-[#00A0E9]", text: "text-[#00A0E9]", suffix: "%" },
    { title: "PREVENTIVE", value: data.databaseAssets > 0 ? ((data.preventive / data.databaseAssets) * 100).toFixed(1) : "0.0", type: "percent", color: "bg-[#00B06B]", text: "text-[#00B06B]", suffix: "%" },
    { title: "CORRECTIVE", value: data.databaseAssets > 0 ? ((data.corrective / data.databaseAssets) * 100).toFixed(1) : "0.0", type: "percent", color: "bg-[#F39C12]", text: "text-[#F39C12]", suffix: "%" }
  ];

  return (
    <div className="grid grid-cols-6 gap-6 w-full">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
          <h2 className="text-[10px] font-black tracking-widest text-[#B5BACD] uppercase mb-4">{c.title}</h2>
          <div className="flex items-end gap-1 font-black">
            <span className={`text-4xl ${c.type === "percent" ? "text-[#121420]" : "text-[#2A2B33]"}`}>{c.value}</span>
            {c.suffix && <span className={`text-xs pb-1 uppercase ${c.type === "percent" ? "text-slate-600 font-black" : "text-slate-300 font-bold tracking-widest"}`}>{c.suffix}</span>}
          </div>
          {c.type === "percent" && (
            <div className={`absolute left-0 top-6 bottom-6 w-2 rounded-r-full ${c.color} shadow-sm`}></div>
          )}
        </div>
      ))}
    </div>
  );
}
