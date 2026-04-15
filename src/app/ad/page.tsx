"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  ShieldCheck, Activity, Zap, 
  RotateCcw, X, Volume2, VolumeX, Sparkles,
  Database, BarChart3, LayoutGrid,
  TrendingUp, Play, ArrowRight,
  Wind, Thermometer, Shield, Cpu,
  CloudLightning, Layers, Maximize, Globe,
  Crosshair, Radio, Search, Calendar,
  AlertTriangle, Filter, CheckCircle2,
  Settings, Clock
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- CINEMATIC IDENTITY TOKENS ---
const AGENCY_EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];
const OVERSHOOT_EASE: [number, number, number, number] = [0.175, 0.885, 0.32, 1.275];
const DAIKIN_BLUE = "#00a1e4";
const DAIKIN_DARK = "#040814";

const ASSETS = {
  BGM: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  SFX: {
    TRANSITION: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
    IMPACT: "https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3",
    SUCCESS: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"
  },
  SCREENSHOTS: {
     LOGIN: "/login_page_real.png",
     DASHBOARD: "/dashboard_real.png",
     CARDS: "/dashboard_cards.png"
  },
  SCRIPT: [
    { start: 0, text: "Struggling to track complex maintenance schedules?" },
    { start: 4, text: "Overwhelmed by managing hundreds of HVAC units at scale?" },
    { start: 8, text: "Dissatisfied with services that don't address your operational needs?" },
    { start: 13, text: "Introducing: Smart HVAC Management Systems." },
    { start: 18, text: "Developed by Daikin Applied Solutions Indonesia." },
    { start: 24, text: "Aggregate data into a single source of truth. Take control." },
    { start: 30, text: "Predict failures. Optimize performance. Reduce your footprint." },
    { start: 38, text: "Daikin Connect. Connectivity Without Limits." }
  ]
};

// --- MASKED TYPOGRAPHY COMPONENT ---
interface MaskedTextProps {
  text: string;
  className?: string;
  delay?: number;
  highlight?: string;
  italic?: boolean;
}

const MaskedText: React.FC<MaskedTextProps> = ({ text, className = "", delay = 0, highlight, italic }) => {
  const words = text.split(" ");
  
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      }
    }
  };

  const childVars = {
    hidden: { y: "115%", filter: "blur(8px)", opacity: 0 },
    visible: { 
      y: 0, 
      filter: "blur(0px)", 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: OVERSHOOT_EASE 
      }
    }
  };

  return (
    <motion.div 
      variants={containerVars} 
      initial="hidden" 
      animate="visible" 
      className={`flex flex-wrap justify-center gap-x-[0.2em] overflow-visible ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden py-1 -my-1">
          <motion.span 
            variants={childVars} 
            className={`inline-block ${italic ? "italic" : ""} ${highlight && word.toLowerCase().includes(highlight.toLowerCase()) ? "text-[#00a1e4]" : ""}`}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
};

// --- NOISE GENERATOR UTILITY ---
const createNoise = () => {
  const p = new Uint8Array(512);
  const permutation = new Uint8Array(256).map(() => Math.floor(Math.random() * 256));
  for (let i = 0; i < 512; i++) p[i] = permutation[i & 255];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x); const v = fade(y); const w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
  };
};

// --- AMBIENT BACKGROUND ---
const EnhancedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noise = useMemo(() => createNoise(), []);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;
    let animationFrameId: number; let time = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize); resize();
    const draw = () => {
      time += 0.003; ctx.clearRect(0, 0, canvas.width, canvas.height);
      const step = 80; const rows = Math.ceil(canvas.height / step) + 1; const cols = Math.ceil(canvas.width / step) + 1;
      ctx.strokeStyle = "rgba(0, 161, 228, 0.15)"; ctx.lineWidth = 1;
      for (let i = 0; i < rows; i++) {
        ctx.beginPath();
        for (let j = 0; j < cols; j++) {
          const x = j * step; const y = i * step; const n = noise(j * 0.15, i * 0.15, time); const dx = n * 40; const dy = Math.sin(time + j * 0.2) * 15;
          if (j === 0) ctx.moveTo(x + dx, y + dy); else ctx.lineTo(x + dx, y + dy);
        }
        ctx.stroke();
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw(); return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animationFrameId); };
  }, [noise]);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

// --- NUMBER COUNTER ---
const Counter = ({ value, duration = 3 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{count.toLocaleString()}+</span>;
};

export default function CinematicAdPage() {
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sfxRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    sfxRef.current.transition = new Audio(ASSETS.SFX.TRANSITION);
    sfxRef.current.impact = new Audio(ASSETS.SFX.IMPACT);
    sfxRef.current.success = new Audio(ASSETS.SFX.SUCCESS);
  }, []);

  const playSFX = (type: keyof typeof ASSETS.SFX) => {
    const sfx = sfxRef.current[type.toLowerCase()];
    if (sfx && !isMuted) { sfx.currentTime = 0; sfx.play().catch(() => {}); }
  };

  useEffect(() => {
    if (elapsedTime >= 0) {
      const interval = setInterval(() => { setElapsedTime(prev => prev + 0.1); }, 100);
      return () => clearInterval(interval);
    }
  }, [elapsedTime >= 0]);

  useEffect(() => {
    const roundedTime = Math.round(elapsedTime * 10) / 10;
    if ([4, 8, 13, 18, 24, 30, 38].includes(roundedTime)) playSFX("TRANSITION");
    if ([13.5, 38.5].includes(roundedTime)) playSFX("SUCCESS");
  }, [elapsedTime]);

  const startExperience = async () => {
    setElapsedTime(0);
    if (audioRef.current) {
        audioRef.current.muted = isMuted;
        try { await audioRef.current.play(); } catch (err) { console.warn("Audio blocked.", err); }
    }
    playSFX("SUCCESS");
  };

  const skipIntro = () => router.push('/');

  return (
    <div className="fixed inset-0 bg-[#040814] text-white overflow-hidden font-sans selection:bg-[#00a1e4]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; cursor: crosshair; }
        .perspective-stage { perspective: 2000px; transform-style: preserve-3d; }
      `}</style>

      <EnhancedBackground />

      {/* Control Navigation */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all backdrop-blur-md">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button onClick={skipIntro} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-[#00a1e4]/20 hover:border-[#00a1e4]/50 transition-all backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          Skip <X size={14} />
        </button>
      </div>

      <audio ref={audioRef} src={ASSETS.BGM} loop muted={isMuted} />

      {/* --- START SCREEN --- */}
      <AnimatePresence>
        {elapsedTime === -1 && (
          <motion.div key="start-screen" exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }} className="absolute inset-0 z-[100] bg-[#040814] flex flex-col items-center justify-center p-12 overflow-hidden">
             <div className="relative z-10 text-center space-y-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-6 mb-4">
                  <img src="/daikin_logo.png" className="h-6 brightness-0 invert" alt="Daikin" />
                  <div className="w-[1px] h-6 bg-white/20"></div>
                  <img src="/logo_epl_connect_1.png" className="h-8 brightness-0 invert" alt="EPL Connect" />
                </motion.div>
                <div className="space-y-4">
                  <MaskedText text="THE FUTURE REVEALED" className="text-6xl md:text-8xl font-black italic text-white" highlight="FUTURE" />
                  <p className="text-[10px] font-black uppercase tracking-[1.5em] text-slate-500">Ultimate Product Showcase</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startExperience} className="group relative px-12 py-6 bg-white text-black rounded-full font-bold uppercase tracking-[0.2em] text-[10px] overflow-hidden">
                  <div className="absolute inset-0 bg-[#00a1e4] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10 group-hover:text-white flex items-center gap-3">Showcase Experience<Play size={12} fill="currentColor" /></span>
                </motion.button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CINEMATIC STAGE --- */}
      <div className="perspective-stage relative w-full h-full flex items-center justify-center">
        
        {/* SCENE 1: MAINTENANCE HOOK (0-4s) */}
        <Scene show={elapsedTime >= 0 && elapsedTime < 3.8}>
           <div className="text-center space-y-12 z-50">
              <MaskedText text="Struggling to track complex maintenance schedules?" className="text-4xl md:text-6xl font-black max-w-4xl" />
           </div>
           {/* Visual Element: Chaos */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <motion.div initial={{ scale: 1.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="grid grid-cols-4 gap-4">
                 {[...Array(12)].map((_, i) => (
                   <div key={i} className="w-32 h-40 bg-white/5 border border-white/10 rounded-2xl flex flex-col p-4 justify-between">
                     <Calendar className="text-red-500/50" />
                     <div className="w-full h-2 bg-red-500/10 rounded-full" />
                   </div>
                 ))}
              </motion.div>
           </div>
        </Scene>

        {/* SCENE 2: FLEET SCALE (4-8s) */}
        <Scene show={elapsedTime >= 4 && elapsedTime < 7.8}>
           <div className="text-center space-y-8 z-50">
              <MaskedText text="Overwhelmed by managing hundreds of units at scale?" className="text-4xl md:text-6xl font-black max-w-4xl" />
              <motion.div className="text-[120px] md:text-[200px] font-black text-[#00a1e4] tabular-nums italic tracking-tighter">
                 <Counter value={952} />
              </motion.div>
           </div>
        </Scene>

        {/* SCENE 3: THE GAP (8-13s) */}
        <Scene show={elapsedTime >= 8 && elapsedTime < 12.8}>
           <div className="w-full max-w-5xl flex flex-col items-center gap-16 z-50">
              <MaskedText text="Frustrated with conventional services that don't address your operational needs?" className="text-3xl md:text-5xl font-black text-center max-w-4xl" />
           </div>
        </Scene>

        {/* SCENE 4: PRODUCT REVEAL - LOGIN FOCUS (13-20s) */}
        <Scene show={elapsedTime >= 13 && elapsedTime < 19.8}>
           <div className="relative w-full h-full flex items-center justify-center p-20">
              {/* The Real UI Backdrop */}
              <motion.div 
                initial={{ scale: 2.5, opacity: 0, rotateX: 20, z: -500 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0, z: 0 }}
                transition={{ duration: 2.5, ease: AGENCY_EASE }}
                className="relative w-full max-w-6xl aspect-video rounded-[3rem] overflow-hidden shadow-4xl border border-white/10"
              >
                 <img src={ASSETS.SCREENSHOTS.LOGIN} className="w-full h-full object-cover" alt="Login Page" />
                 {/* Spotlight on Authenticate Button area */}
                 <motion.div 
                   animate={{ opacity: [0, 0.4, 0] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00a1e4] blur-[150px]"
                 />
              </motion.div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                 <MaskedText text="Introducing: Daikin Connect Hub." className="text-7xl font-black italic shadow-text" delay={1} />
              </div>
           </div>
        </Scene>

        {/* SCENE 5: AUTHORITY REVEAL (20-24s) */}
        <Scene show={elapsedTime >= 20 && elapsedTime < 23.8}>
           <div className="text-center space-y-12 z-50">
              <MaskedText text="Developed by Daikin Applied Solutions Indonesia." className="text-4xl md:text-6xl font-black" highlight="Daikin" />
              <div className="flex gap-12 justify-center opacity-40">
                <img src="/daikin_logo.png" className="h-10 brightness-0 invert" alt="Daikin" />
                <img src="/logo_epl_connect_1.png" className="h-12 brightness-0 invert" alt="EPL" />
              </div>
           </div>
        </Scene>

        {/* SCENE 6: UI DIVE - DASHBOARD OVERVIEW (24-34s) */}
        <Scene show={elapsedTime >= 24 && elapsedTime < 33.8}>
           <div className="w-full h-full p-20 relative flex items-center justify-center">
              {/* Dynamic Camera Pan on Dashboard */}
              <motion.div 
                 initial={{ opacity: 0, x: -100, rotateY: -15, scale: 0.9 }}
                 animate={{ opacity: 1, x: 0, rotateY: -5, scale: 1 }}
                 transition={{ duration: 3, ease: AGENCY_EASE }}
                 className="relative w-full max-w-7xl h-full rounded-[4rem] overflow-hidden border border-white/10 shadow-5xl shadow-[#00a1e4]/10"
              >
                 <motion.img 
                    src={ASSETS.SCREENSHOTS.DASHBOARD} 
                    animate={{ y: ["0%", "-40%"] }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    className="w-full object-cover" 
                    alt="Dashboard" 
                 />
                 {/* Focus HUD - Efficiency */}
                 <motion.div 
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 2 }}
                   className="absolute top-[20%] left-[60%] p-8 bg-[#040814]/80 backdrop-blur-3xl border border-[#00a1e4]/50 rounded-3xl shadow-glow"
                 >
                    <p className="text-[10px] font-black uppercase text-[#00a1e4]">Optimization Engine</p>
                    <p className="text-4xl font-black italic">+24% KPI GAIN</p>
                 </motion.div>
              </motion.div>

              <div className="absolute top-20 left-40 z-50">
                 <MaskedText text="Master Your Ecosystem." className="text-7xl font-black" highlight="Ecosystem" />
              </div>
           </div>
        </Scene>

        {/* SCENE 7: COMPONENT DRILL-DOWN (34-39s) */}
        <Scene show={elapsedTime >= 34 && elapsedTime < 38.8}>
           <div className="w-full max-w-7xl grid grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <MaskedText text="Neural Performance Diagnostics." className="text-6xl font-black justify-start leading-tight" highlight="Neural" />
                 <p className="text-slate-400 text-xl font-medium">Predict failures before shutdown. Real-time fleet intelligence at your fingertips.</p>
              </div>
              
              <div className="relative perspective-stage h-[500px] flex items-center justify-center">
                 {/* Floating Cluster of Cards */}
                 <motion.div 
                    initial={{ rotateX: 30, rotateY: -20, opacity: 0, scale: 0.5 }}
                    animate={{ rotateX: 10, rotateY: -5, opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: OVERSHOOT_EASE }}
                    className="relative w-full h-full"
                 >
                    <img src={ASSETS.SCREENSHOTS.CARDS} className="w-full h-full object-contain filter drop-shadow-[0_50px_100px_rgba(0,161,228,0.3)]" alt="Cards Cluster" />
                    
                    {/* Pulsing indicator on a specific metric */}
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-[30%] left-[30%] w-6 h-6 bg-[#00a1e4] rounded-full blur-[4px]"
                    />
                 </motion.div>
              </div>
           </div>
        </Scene>

        {/* OUTRO (39s+) */}
        <Scene show={elapsedTime >= 39}>
           <div className="text-center space-y-16">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity }} className="space-y-10">
                 <div className="flex flex-col items-center gap-12">
                     <div className="flex items-center gap-10">
                        <img src="/daikin_logo.png" className="h-10 brightness-0 invert" alt="Daikin" />
                        <div className="w-[1px] h-10 bg-white/20"></div>
                        <img src="/logo_epl_connect_1.png" className="h-14 brightness-0 invert" alt="EPL" />
                     </div>
                     <MaskedText text="CONNECT" className="text-[120px] font-black italic tracking-tighter leading-none" />
                 </div>
                 <MaskedText text="Experience the Hub Command" className="text-slate-500 font-black uppercase tracking-[2em] text-[10px]" delay={1} />
              </motion.div>
              
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5, ease: OVERSHOOT_EASE }} onClick={skipIntro} className="group relative px-20 py-8 bg-[#00a1e4] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_30px_100px_rgba(0,161,228,0.5)] hover:scale-105 active:scale-95 transition-all">
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                 Launch The Future <ArrowRight size={18} className="inline ml-4 group-hover:translate-x-3 transition-transform duration-500" />
              </motion.button>
           </div>
        </Scene>

      </div>

      {/* Overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 z-[70] bg-white/5 overflow-hidden">
         <motion.div className="h-full bg-[#00a1e4]" animate={{ width: `${Math.min(100, (elapsedTime / 45) * 100)}%` }} />
      </div>
      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
    </div>
  );
}

function Scene({ show, children }: { show: boolean, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateX: 10, filter: "blur(40px)" }} 
          animate={{ opacity: 1, scale: 1, rotateX: 0, filter: "blur(0px)" }} 
          exit={{ opacity: 0, scale: 1.1, rotateX: -10, filter: "blur(40px)" }} 
          transition={{ duration: 1.8, ease: AGENCY_EASE }} 
          className="absolute inset-0 flex items-center justify-center p-12 z-40 transform-gpu"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
