"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Sliders } from "lucide-react";
import LiveMonitoringClient from "./LiveMonitoringClient";
import RegisterClient from "./RegisterClient";

interface Props {
  gatewayId: string;
  initialTab?: string;
}

export default function GatewayDetailView({ gatewayId, initialTab }: Props) {
  const [activeTab, setActiveTab] = useState<"live" | "registers">(
    initialTab === "registers" ? "registers" : "live"
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Top Navigation & Sub-System Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-gray-800">
        <Link
          href="/admin/modbus"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Kembali ke Modbus Gateway</span>
        </Link>

        {/* Segmented Mode Selector */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "live"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Live SCADA & Monitoring</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("registers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "registers"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kelola Register</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === "live" ? (
        <LiveMonitoringClient gatewayId={gatewayId} />
      ) : (
        <RegisterClient gatewayId={gatewayId} />
      )}
    </div>
  );
}
