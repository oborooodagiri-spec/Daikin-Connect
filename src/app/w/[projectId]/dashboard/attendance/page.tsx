"use client";

import React, { useEffect, useState } from "react";
import AttendanceClient from "@/components/attendance/AttendanceClient";
import { Loader2 } from "lucide-react";

import { useParams } from "next/navigation";

export default function AttendancePage() {
  const params = useParams();
  const projectIdStr = params?.projectId as string;
  const projectId = projectIdStr && projectIdStr !== "empty" ? projectIdStr : null;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
           <p className="text-2xl">⚠️</p>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">No Active Project</h2>
        <p className="text-slate-500 text-sm">
          Please select a project from the top navigation to check in.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AttendanceClient projectId={projectId} />
    </div>
  );
}
