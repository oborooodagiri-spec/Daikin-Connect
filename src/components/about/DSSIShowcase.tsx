"use client";
import { motion } from "framer-motion";
import { Satellite, Globe, Wifi, Activity, Battery, Bell, Users, FileText, MapPin, BarChart3, Brain } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const rmsFeatures = [
  { icon: Wifi, text: "Real-time Data Monitoring" },
  { icon: Activity, text: "4G LTE IoT Connection" },
  { icon: Battery, text: "Energy Performance Tracking" },
  { icon: Bell, text: "Unit Health & Alarm System" },
  { icon: BarChart3, text: "Data Insights & Trending" },
];

const connectFeatures = [
  { icon: MapPin, text: "Real-time Unit Tracking" },
  { icon: FileText, text: "Digital Report Generation" },
  { icon: Users, text: "Field Attendance System" },
  { icon: Globe, text: "Client Portal Access" },
  { icon: Brain, text: "Predictive Analytics & AI" },
];

export default function DSSIShowcase() {
  return (
    <motion.div
      className="w-full max-w-6xl mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {/* DSSI Logo & Description */}
      <motion.div variants={itemVariants} className="text-center mb-10 lg:mb-16">
        <motion.img
          src="/dssi_logo.png"
          alt="DSSI - DASI Service & Solutions Indonesia"
          className="h-16 lg:h-24 mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <p className="text-xs lg:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          <span className="font-bold text-white">DASI Service & Solutions Indonesia (DSSI)</span> adalah unit operasional di bawah divisi Service
          Daikin Applied Solutions Indonesia (DASI), dioperasikan oleh tim{" "}
          <span className="font-bold text-cyan-400">Expanded Product Line (EPL)</span>.
          DSSI menghadirkan dua inovasi digital utama:
        </p>
      </motion.div>

      {/* Two Cards */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* RMS Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 p-6 lg:p-8"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Satellite className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-black text-white">RMS</h3>
                <p className="text-[10px] lg:text-xs text-cyan-400 font-bold">Remote Monitoring Service</p>
              </div>
            </div>
            <p className="text-[11px] lg:text-xs text-slate-400 leading-relaxed mb-4">
              Sistem pemantauan unit HVAC secara real-time melalui koneksi 4G LTE IoT.
              Memungkinkan monitoring performa, konsumsi energi, dan status alarm dari jarak jauh.
            </p>
            <div className="space-y-2">
              {rmsFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] lg:text-[11px] text-slate-300 font-medium">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* DSSI Connect Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 p-6 lg:p-8"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-[#0073ea] to-blue-600 flex items-center justify-center">
                <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-black text-white">DSSI Connect</h3>
                <p className="text-[10px] lg:text-xs text-blue-400 font-bold">Digital Operations Platform</p>
              </div>
            </div>
            <p className="text-[11px] lg:text-xs text-slate-400 leading-relaxed mb-4">
              Platform digital yang menghubungkan seluruh ekosistem pelayanan DASI — dari
              teknisi lapangan, supervisor, hingga manajemen dan klien dalam satu sistem terpadu.
            </p>
            <div className="space-y-2">
              {connectFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] lg:text-[11px] text-slate-300 font-medium">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Integration Line */}
      <motion.div
        variants={itemVariants}
        className="hidden lg:flex items-center justify-center gap-4 mt-8"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrated Ecosystem</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </motion.div>
    </motion.div>
  );
}
