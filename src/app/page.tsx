"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, 
  Activity, ShieldCheck, Database, Zap, ClipboardCheck, History 
} from "lucide-react";

import { login, register } from "./actions/auth";
import { APP_VERSION } from "@/lib/version";

export default function LoginPage() {
  const [isRequestMode, setIsRequestMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      
      if (isRequestMode) {
        formData.append("name", name);
        const result = await register(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          setMessage(result.success);
          setIsRequestMode(false);
          setName("");
          setPassword("");
        }
      } else {
        const result = await login(formData);
        if (result?.error) {
          setError(result.error);
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040814] flex flex-col md:flex-row text-slate-200 font-sans selection:bg-[#00a1e4] selection:text-white overflow-hidden relative">
      
      {/* Background Animated Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#00a1e4] mix-blend-screen blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute top-[40%] text-right -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#003366] mix-blend-screen blur-[150px]"
        />
      </div>

      {/* Left Panel - Hero Branding (Desktop Only) */}
      <div className="hidden md:flex md:w-5/12 relative z-10 flex-col justify-between p-12 lg:p-16 border-r border-white/5 bg-black/20 backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <img src="/daikin_logo.png" className="h-8 w-auto brightness-0 invert object-contain" alt="Daikin" />
          <div className="w-[1px] h-6 bg-white/20"></div>
          <img src="/logo_epl_connect_1.png" className="h-8 w-auto brightness-0 invert object-contain" alt="EPL Connect" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#00a1e4] mb-6">
            <Activity className="w-3.5 h-3.5" />
            <span className="mt-0.5">Secure Gateway</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[1.1] mb-6">
            Master <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a1e4] to-blue-600">
              Asset Data
            </span>
          </h1>
          
          <p className="text-slate-400 text-sm font-medium tracking-wide max-w-sm leading-relaxed mb-12">
            Centralized performance monitoring and digitalized reporting system.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MarketingCard 
              icon={<ShieldCheck className="w-5 h-5" />} 
              title="End-to-End Encryption" 
              desc="Military-grade data protection"
              color="blue"
            />
            <MarketingCard 
              icon={<Database className="w-5 h-5" />} 
              title="Real-time Synchronization" 
              desc="Live operational metrics"
              color="emerald"
            />
            <MarketingCard 
              icon={<Zap className="w-5 h-5" />} 
              title="Predictive Maintenance" 
              desc="Early failure detection"
              color="amber"
              opacity={0.8}
            />
            <MarketingCard 
              icon={<ClipboardCheck className="w-5 h-5" />} 
              title="Automated Compliance" 
              desc="Audit-ready digital reports"
              color="cyan"
              opacity={0.8}
            />
          </div>
        </motion.div>

         {/* Quality Assurance Section */}
         <div className="mt-auto pt-12">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Certified & Compliant By</p>
            <div className="flex items-center gap-6 opacity-60 hover:opacity-100 transition-all duration-700">
              <div className="bg-white p-1 rounded-sm shadow-lg overflow-hidden">
                <img src="/kan1.jpg" className="h-6 w-auto object-contain" alt="KAN" />
              </div>
              <div className="bg-white p-1 rounded-sm shadow-lg overflow-hidden">
                <img src="/green-building-council-1.png" className="h-6 w-auto object-contain" alt="Green Building Council" />
              </div>
              <div className="bg-white p-1 rounded-sm shadow-lg overflow-hidden">
                <img src="/TUVnord-.png" className="h-6 w-auto object-contain" alt="TUV Nord" />
              </div>
            </div>
          </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 w-full min-h-screen md:min-h-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center justify-center gap-6 mb-10 mt-8">
          <div className="flex items-center gap-4">
            <img src="/daikin_logo.png" className="h-7 object-contain brightness-0 invert" alt="Daikin" />
            <div className="w-[1px] h-5 bg-white/20"></div>
            <img src="/logo_epl_connect_1.png" className="h-7 object-contain brightness-0 invert" alt="EPL Connect" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#00a1e4]">
            <Activity className="w-3 h-3" />
            <span>Secure Gateway</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl relative"
        >
          {/* Subtle top glare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
              {isRequestMode ? "Create Access Request" : "Welcome Back"}
            </h2>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {isRequestMode ? "Enter details to authorize" : "Sign in to Command Center"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <p>{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isRequestMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="group"
              >
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#00a1e4]" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-medium text-white focus:bg-white/5 focus:border-[#00a1e4] focus:ring-1 focus:ring-[#00a1e4] outline-none transition-all duration-300 placeholder:text-slate-500"
                    placeholder="Full Name"
                  />
                </div>
              </motion.div>
            )}

            <div className="group">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#00a1e4]" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-medium text-white focus:bg-white/5 focus:border-[#00a1e4] focus:ring-1 focus:ring-[#00a1e4] outline-none transition-all duration-300 placeholder:text-slate-500"
                  placeholder="Email Address"
                />
              </div>
            </div>

            <div className="group">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#00a1e4]" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isRequestMode}
                  className="w-full pl-12 pr-12 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-medium text-white focus:bg-white/5 focus:border-[#00a1e4] focus:ring-1 focus:ring-[#00a1e4] outline-none transition-all duration-300 placeholder:text-slate-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isRequestMode && (
                <div className="flex justify-end mt-3 px-2">
                  <Link href="/forgot-password" className="text-[10px] font-black text-slate-500 hover:text-[#00a1e4] transition-colors uppercase tracking-[0.2em]">
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden bg-gradient-to-r from-[#00a1e4] to-blue-600 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] py-4 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,161,228,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover/btn:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isRequestMode ? "Submit Request" : "Authenticate"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs font-semibold text-slate-400">
            {isRequestMode ? "Already have access?" : "Need an account?"}{" "}
            <button 
              onClick={() => {
                setIsRequestMode(!isRequestMode);
                setError(null);
                setMessage(null);
              }}
              className="text-[#00a1e4] hover:text-white transition-colors ml-1 font-bold underline decoration-[#00a1e4]/30 underline-offset-4"
            >
              {isRequestMode ? "Sign In Here" : "Request Access"}
            </button>
          </div>
        </motion.div>

        {/* Mobile Copyright Footer */}
        <div className="mt-12 md:mt-24 text-center pb-8 md:pb-0 relative z-10 w-full">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            © 2026 VALUE ENGINEERING SERVICES <span className="text-[#00a1e4] mx-2">•</span> D2
          </p>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] mt-2">
            {APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
}

function MarketingCard({ icon, title, desc, color, opacity = 1 }: { icon: any, title: string, desc: string, color: string, opacity?: number }) {
  const colorMap: any = {
    blue: "bg-blue-500/20 text-blue-400 border-white/10",
    emerald: "bg-emerald-500/20 text-emerald-400 border-white/10",
    amber: "bg-amber-500/20 text-amber-400 border-white/10",
    cyan: "bg-cyan-500/20 text-cyan-400 border-white/10"
  };

  return (
    <div className={`flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md transition-all hover:bg-white/10 hover:scale-[1.02]`} style={{ opacity }}>
      <div className={`${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} p-2.5 rounded-xl`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-0.5">{title}</h4>
        <p className="text-[9px] text-slate-400 font-medium leading-tight">{desc}</p>
      </div>
    </div>
  );
}
