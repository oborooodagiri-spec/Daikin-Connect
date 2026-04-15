"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, X, Mail, RefreshCcw } from "lucide-react";
import Portal from "../Portal";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (code: string, trustDevice: boolean) => void;
  isLoading: boolean;
}

export default function TwoFactorModal({ isOpen, onClose, email, onVerify, isLoading }: TwoFactorModalProps) {
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(c => c !== "")) {
      const isTrusted = (document.getElementById('trustDevice') as HTMLInputElement)?.checked || false;
      onVerify(newCode.join(""), isTrusted);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#003366]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header / Accent */}
            <div className="h-2 bg-[#00a1e4]" />
            
            <div className="p-8 md:p-10 space-y-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-[#00a1e4] shadow-xl shadow-blue-500/10">
                <ShieldCheck size={40} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tight">Two-Step Verification</h2>
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <Mail size={14} />
                  <p className="text-sm font-medium italic">Code sent to {email.replace(/(.{3})(.*)(?=@)/, '$1***')}</p>
                </div>
              </div>

              <div className="flex justify-between gap-3 px-4">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    disabled={isLoading}
                    className="w-12 h-16 text-center text-2xl font-black text-[#003366] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#00a1e4] focus:bg-white focus:outline-none transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 justify-center mb-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input 
                      type="checkbox" 
                      id="trustDevice"
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-slate-200 rounded-lg group-hover:border-[#00a1e4] peer-checked:bg-[#00a1e4] peer-checked:border-[#00a1e4] transition-all duration-300"></div>
                    <ShieldCheck className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#00a1e4] transition-colors">Trust this device for 30 days</span>
                </label>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    const isTrusted = (document.getElementById('trustDevice') as HTMLInputElement)?.checked || false;
                    onVerify(code.join(""), isTrusted);
                  }}
                  disabled={isLoading || code.includes("")}
                  className="w-full py-5 bg-[#003366] hover:bg-[#002244] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? (
                    <RefreshCcw size={18} className="animate-spin" />
                  ) : (
                    <>
                      Verify Login <ArrowRight size={18} />
                    </>
                  )}
                </button>
                
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Didn't receive the email? <span className="text-[#00a1e4] cursor-pointer hover:underline">Resend Code</span>
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
