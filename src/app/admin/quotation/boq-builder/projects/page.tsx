"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { getBoqProjects, createBoqProject, deleteBoqProject } from "@/app/actions/boq";
import { useRouter } from "next/navigation";

export default function BoqProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ project_name: "", customer_name: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    const data = await getBoqProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const newBoq = await createBoqProject({
      project_name: formData.project_name,
      customer_name: formData.customer_name,
    });
    setIsCreating(false);
    setIsAddOpen(false);
    setFormData({ project_name: "", customer_name: "" });
    // Go directly to editor
    if (newBoq && newBoq.id) {
      router.push(`/admin/quotation/boq-builder/${newBoq.id}`);
    } else {
      loadProjects();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this BoQ Project?")) {
      await deleteBoqProject(id);
      loadProjects();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <div className="mb-4">
        <Link href="/admin/quotation/boq-builder" className="text-gray-500 hover:text-gray-800 flex items-center font-medium transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Pricelist
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar BoQ</h1>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama proyek/customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#0073ea] outline-none transition-shadow pl-4"
            />
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#0073ea] hover:bg-[#0060c5] text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Proyek BoQ Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#0073ea]" />
          <p>Memuat histori proyek...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada proyek BoQ</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Mulai dengan membuat proyek Bill of Quantity baru. Anda bisa menyusun penawaran dengan mudah dan terstruktur.</p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#0073ea] hover:bg-[#0060c5] text-white px-6 py-2.5 rounded-lg font-medium inline-flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Buat Proyek Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col relative group">
              <button 
                onClick={(e) => { e.preventDefault(); handleDelete(project.id); }}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/80 rounded-full backdrop-blur z-10"
                title="Hapus Proyek"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <Link href={`/admin/quotation/boq-builder/${project.id}`} className="p-6 flex-1 flex flex-col cursor-pointer">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
                  <span className="font-bold text-xl">{project.project_name.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{project.project_name}</h3>
                
                {project.customer_name && (
                  <p className="text-sm font-medium text-gray-600 flex items-center mt-2 bg-gray-50 px-2.5 py-1 rounded-md w-fit">
                    <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    {project.customer_name}
                  </p>
                )}

                <div className="mt-auto pt-6 flex items-center text-xs text-gray-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  {new Date(project.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Proyek */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Proyek BoQ Baru</h2>
            <p className="text-sm text-gray-500 mb-6">Format standar (Preliminary, Supply, dsb) akan digenerate otomatis.</p>
            
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Proyek *</label>
                  <input
                    required
                    autoFocus
                    type="text"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#0073ea] outline-none transition-shadow"
                    placeholder="Masukkan nama proyek"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#0073ea] outline-none transition-shadow"
                    placeholder="Nama customer (Opsional)"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)} 
                  disabled={isCreating}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="px-6 py-2 bg-[#0073ea] hover:bg-[#0060c5] text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-70"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isCreating ? "Membuat..." : "Buat & Buka Editor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
