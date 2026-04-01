"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Target, FileText } from "lucide-react";

export default function SchedulesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Calendar Board", href: "/dashboard/schedules", icon: CalendarDays },
    { name: "Target & Tracking", href: "/dashboard/schedules/targets", icon: Target },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-[#00a1e4] mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Master Schedule</span>
          </div>
          <h1 className="text-4xl font-black text-[#003366] tracking-tight">
            Schedule & Operations
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Manage daily activities, assign tasks, and track performance targets.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 mt-4">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm tracking-wide transition-colors ${
                  isActive 
                    ? "border-[#00a1e4] text-[#003366]" 
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-t-xl"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#00a1e4]" : "opacity-60"} />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
