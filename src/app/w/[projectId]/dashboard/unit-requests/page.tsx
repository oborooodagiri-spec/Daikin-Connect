"use client";

import { useEffect, useState, useTransition } from "react";
import { getPendingUnitRequests, approveUnitRequest, rejectUnitRequest } from "@/app/actions/unit_requests";
import { Check, X, Clock, Info, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UnitEditRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    const res = await getPendingUnitRequests();
    if (res.success) {
      setRequests(res.data);
    }
    setLoading(false);
  }

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    startTransition(async () => {
      let res;
      if (action === 'approve') {
        res = await approveUnitRequest(requestId);
      } else {
        const note = prompt("Alasan penolakan:");
        if (note === null) return;
        res = await rejectUnitRequest(requestId, note);
      }

      if (res.success) {
        loadRequests();
      } else {
        alert(res.error || "Gagal memproses permintaan");
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">
            Unit <span className="not-italic text-blue-500">Edit Requests</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Validation Queue for Vendor Proposed Changes</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
           <Clock size={16} className="text-blue-500"/>
           <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{requests.length} Pending</span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 border border-dashed border-slate-200 flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <Info size={32}/>
           </div>
           <h3 className="text-lg font-black text-slate-400 uppercase">No Pending Requests</h3>
           <p className="text-xs text-slate-300 mt-1">All unit data changes have been processed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {requests.map((req) => (
              <RequestCard 
                key={req.id} 
                request={req} 
                onApprove={() => handleAction(req.id, 'approve')}
                onReject={() => handleAction(req.id, 'reject')}
                disabled={isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, onApprove, onReject, disabled }: any) {
  const details = JSON.parse(request.details_json);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300"
    >
      <div className="p-6 flex flex-col md:flex-row gap-6">
        {/* Requester Info */}
        <div className="md:w-1/4 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested By</p>
            <p className="text-sm font-bold text-slate-800">{request.users.name}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase">{request.users.company_name || 'Vendor'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</p>
            <p className="text-sm font-black text-[#003366] uppercase">{request.units.tag_number}</p>
            <p className="text-[10px] font-medium text-slate-400">{request.units.brand} - {request.units.model}</p>
          </div>
          <div className="pt-2 text-[10px] text-slate-300 font-medium">
             {new Date(request.requested_at).toLocaleString()}
          </div>
        </div>

        {/* Changes Diff */}
        <div className="flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-100">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <DiffItem label="Brand" current={request.units.brand} proposed={details.brand} />
              <DiffItem label="Model" current={request.units.model} proposed={details.model} />
              <DiffItem label="Unit Type" current={request.units.unit_type} proposed={details.unit_type} />
              <DiffItem label="Capacity" current={request.units.capacity} proposed={details.capacity} />
              <DiffItem label="Location" current={request.units.location} proposed={details.location} />
              <DiffItem label="Area" current={request.units.area} proposed={details.area} />
              <DiffItem label="Floor" current={request.units.building_floor} proposed={details.building_floor} />
              <DiffItem label="Tenant" current={request.units.room_tenant} proposed={details.room_tenant} />
              <DiffItem label="Serial Num" current={request.units.serial_number} proposed={details.serial_number} />
              <DiffItem label="Status" current={request.units.status} proposed={details.status} />
              <DiffItem label="YOI" current={request.units.yoi} proposed={details.yoi} />
           </div>
        </div>

        {/* Actions */}
        <div className="md:w-1/5 flex flex-col gap-2 justify-center">
          <button 
            onClick={onApprove} disabled={disabled}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            <Check size={16}/> Approve
          </button>
          <button 
            onClick={onReject} disabled={disabled}
            className="w-full py-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <X size={16}/> Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DiffItem({ label, current, proposed }: any) {
  const isChanged = current?.toString() !== proposed?.toString();
  
  return (
    <div className={`space-y-1 p-2 rounded-lg transition-colors ${isChanged ? "bg-blue-50/50 border border-blue-100" : ""}`}>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="text-slate-400 line-through opacity-40 italic">{current?.toString() || '-'}</span>
        <span className="text-slate-300">→</span>
        <span className={isChanged ? "text-blue-600 font-black" : "text-slate-800"}>{proposed?.toString() || '-'}</span>
        {isChanged && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
      </div>
    </div>
  );
}
