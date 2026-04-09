"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Paperclip, Image as ImageIcon, 
  MoreVertical, Smile, User as UserIcon, 
  Clock, ShieldCheck, Info, MessageSquare,
  ArrowDownCircle, MoreHorizontal
} from "lucide-react";
import { getThreadMessages, postChatMessage } from "@/app/actions/threads";

interface Message {
  id: string;
  userId: number;
  userName: string;
  userRole: string;
  message: string;
  attachments: string[];
  isSystem: boolean;
  systemType?: string;
  createdAt: string;
}

interface ThreadModalProps {
  schedule: any;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: number; role: string };
}

export default function ThreadModal({ schedule, isOpen, onClose, currentUser }: ThreadModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && schedule) {
      loadMessages();
      // Start polling
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const res = await getThreadMessages(schedule.id.toString()) as any;
    if (res.success) {
      setMessages(res.data);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "threads");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPhotos([...photos, data.url]);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() && photos.length === 0) return;

    const tempInput = input;
    const tempPhotos = photos;
    setInput("");
    setPhotos([]);

    startTransition(async () => {
      const res = await postChatMessage(schedule.id.toString(), tempInput, tempPhotos);
      if (res.success) {
        loadMessages();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 50 }}
        className="bg-white border border-slate-200 shadow-2xl relative z-10 w-full max-w-4xl h-full md:h-[90vh] md:rounded-[2.5rem] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#00a1e4] rounded-2xl">
              <MessageSquare size={24}/>
            </div>
            <div>
              <h3 className="text-lg font-black text-[#003366] tracking-tight">{schedule.title} Discussion</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={12}/> Unified Timeline • {messages.length} Records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all rounded-xl">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale">
              <div className="w-8 h-8 border-4 border-t-[#00a1e4] border-slate-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest font-mono">Loading Timeline...</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble 
                  key={msg.id} 
                  msg={msg} 
                  isOwn={msg.userId === currentUser.id} 
                />
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          {photos.length > 0 && (
            <div className="flex gap-2 mb-4">
              {photos.map((p, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                  <img src={p} className="w-full h-full object-cover" alt="attachment" />
                  <button 
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-rose-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={16}/>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-4 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 shadow-inner">
             <label className="p-3 text-slate-400 hover:text-slate-700 cursor-pointer transition-all">
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading}/>
                {isUploading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <ImageIcon size={20}/>}
             </label>
             <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
               }}
               placeholder="Type a message or updates for this project..."
               className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 px-2 resize-none max-h-32 min-h-[44px] custom-scrollbar scrollbar-none"
             />
             <button 
               onClick={handleSend}
               disabled={(!input.trim() && photos.length === 0) || isUploading}
               className="p-3 bg-[#00a1e4] text-white rounded-2xl shadow-lg shadow-[#00a1e4]/20 hover:bg-[#003366] transition-all disabled:opacity-30"
             >
               <Send size={20}/>
             </button>
          </div>
          <p className="mt-3 text-[9px] font-bold text-center text-slate-300 uppercase tracking-widest uppercase">
            All messages are archived and mirrored to Project Hub.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function MessageBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  if (msg.isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="max-w-[80%] bg-white/60 backdrop-blur-sm border border-slate-200 px-6 py-4 rounded-[1.5rem] shadow-sm flex items-start gap-3">
          <div className="p-2 bg-slate-100 text-slate-400 rounded-xl">
             <Info size={16}/>
          </div>
          <div className="flex-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-[#00a1e4] mb-1">{msg.systemType || "SYSTEM LOG"}</p>
             <div className="text-xs font-bold text-slate-500 whitespace-pre-wrap leading-relaxed">{msg.message}</div>
             <p className="text-[8px] font-bold text-slate-300 mt-2 uppercase tracking-tight">{new Date(msg.createdAt).toLocaleString('en-GB', { hour12: false })}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-[10px] font-black text-[#003366] uppercase tracking-tight">{msg.userName}</span>
            <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded uppercase tracking-widest">{msg.userRole}</span>
          </div>
        )}
        
        <div className={`p-4 rounded-3xl shadow-sm relative ${
          isOwn ? 'bg-[#003366] text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
        }`}>
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          
          {msg.attachments.length > 0 && (
            <div className={`grid ${msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-3`}>
              {msg.attachments.map((url, i) => (
                <img 
                  key={i} src={url} 
                  className="w-full max-h-60 object-cover rounded-xl border border-white/10 shadow-inner" 
                  alt="attachment" 
                />
              ))}
            </div>
          )}

          <p className={`text-[8px] font-bold mt-2 uppercase tracking-tight ${isOwn ? 'text-white/40' : 'text-slate-300'}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
        </div>
      </div>
    </div>
  );
}
