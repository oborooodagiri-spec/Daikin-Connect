"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Page() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);

 async function onSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setTimeout(() => setLoading(false), 800);
 }

 return (
 <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35 }}
 className="w-full max-w-md"
 >
 <Card className="overflow-hidden">
 <CardHeader>
 <CardTitle>Daikin-Connect</CardTitle>
 <p className="mt-1 text-sm text-slate-600">Login ke dashboard</p>
 </CardHeader>

 <CardContent>
 <form onSubmit={onSubmit} className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-slate-700">
 Email
 </label>
 <Input
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="nama@contoh.com"
 type="email"
 autoComplete="email"
 required
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium text-slate-700">
 Password
 </label>
 <Input
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 type="password"
 autoComplete="current-password"
 required
 />
 </div>

 <Button type="submit" disabled={loading}>
 {loading ? "Memproses..." : "Masuk"}
 </Button>

 <button
 type="button"
 className="w-full text-sm text-slate-600 hover:text-slate-900"
 onClick={() => alert("TODO: Forgot password")}
 >
 Lupa password?
 </button>
 </form>
 </CardContent>
 </Card>

 <p className="mt-6 text-center text-xs text-slate-500">
 © {new Date().getFullYear()} Daikin-Connect
 </p>
 </motion.div>
 </main>
 );
}
