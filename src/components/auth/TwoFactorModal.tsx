"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [otpValue, setOtpValue] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setOtpValue("");
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtpValue(val);
    
    // Auto-verify when 6 digits are reached
    if (val.length === 6) {
       // Optional: We could trigger onVerify here, but keeping button for explicit user intent
    }
  };

  const handleVerify = () => {
    if (otpValue.length === 6) {
      onVerify(otpValue, trustDevice);
    }
  };

  const handleResend = () => {
    setIsResending(true);
    // In a real app, you'd trigger a server action here
    setTimeout(() => setIsResending(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop with premium blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#001b3d]/40 backdrop-blur-[12px]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
          >
            {/* Top Indicator */}
            <div className="h-1.5 w-full bg-[#0073ea]" />
            
            <div className="p-8 md:p-12 space-y-10">
              {/* Icon & Close */}
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0073ea] shadow-inner">
                  <ShieldCheck size={32} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Title & Info */}
              <div className="space-y-3 text-left">
                <h2 className="text-3xl font-black text-[#323338] tracking-tight leading-none">Security Verification</h2>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Mail size={16} className="shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                    Sent to <span className="text-[#0073ea]">{email.replace(/(.{3})(.*)(?=@)/, '$1***')}</span>
                  </p>
                </div>
              </div>

              {/* OTP Input Section */}
              <div className="relative group">
                {/* Hidden Real Input for Mobile Optimization */}
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otpValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otpValue.length === 6) handleVerify();
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                  autoFocus
                  maxLength={6}
                />
                
                {/* Visual Boxes */}
                <div 
                  className="flex justify-between gap-2.5 sm:gap-3"
                  onClick={() => inputRef.current?.focus()}
                >
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const digit = otpValue[idx] || "";
                    const isFocused = otpValue.length === idx;
                    const isFilled = otpValue.length > idx;

                    return (
                      <motion.div
                        key={idx}
                        animate={isFocused ? { scale: 1.05, borderColor: "#0073ea" } : { scale: 1, borderColor: "#f1f5f9" }}
                        className={`relative flex-1 aspect-[3/4] sm:aspect-square flex items-center justify-center text-3xl font-black rounded-2xl border-2 transition-all duration-200
                          ${isFocused ? 'border-[#0073ea] bg-white ring-4 ring-blue-50 shadow-lg' : 'bg-slate-50 border-slate-100'}
                          ${isFilled ? 'text-[#0073ea] border-[#0073ea]/20' : 'text-slate-300'}
                        `}
                      >
                        {digit}
                        {isFocused && (
                          <motion.div 
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-0.5 h-8 bg-[#0073ea] absolute"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Trust Device Option */}
              <div className="flex items-center justify-center">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <input 
                      type="checkbox" 
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-slate-200 rounded-lg group-hover:border-[#0073ea] peer-checked:bg-[#0073ea] peer-checked:border-[#0073ea] transition-all duration-300"></div>
                    <ShieldCheck className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] group-hover:text-[#323338] transition-colors">Trust this device for today</span>
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-6 pt-2">
                <button
                  onClick={handleVerify}
                  disabled={isLoading || otpValue.length < 6}
                  className="w-full py-6 bg-[#0073ea] hover:bg-[#005bb5] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,115,234,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isLoading ? (
                    <RefreshCcw size={20} className="animate-spin" />
                  ) : (
                    <>
                      Verify Login <ArrowRight size={18} />
                    </>
                  )}
                </button>
                
                <div className="flex flex-col items-center gap-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     Didn't receive the email?
                   </p>
                   <button 
                     onClick={handleResend}
                     disabled={isResending}
                     className="text-[#0073ea] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                   >
                     {isResending ? (
                       <span className="flex items-center gap-2">Sending... <RefreshCcw size={10} className="animate-spin" /></span>
                     ) : "Resend Code"}
                   </button>
                </div>
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
