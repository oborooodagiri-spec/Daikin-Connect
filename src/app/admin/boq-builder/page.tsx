"use client";

import { useState, useEffect } from "react";
import { Plus, FolderOpen, Trash2, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { getBoqProjects, createBoqProject, deleteBoqProject } from "../../actions/boq";

export default function BoqBuilderPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ project_name: "", customer_name: "" });

  const loadProjects = async () => {
    setLoading(true);
    // Hardcode user ID for admin demo, you should get this from session
    const data = await getBoqProjects(1);
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBoqProject({
      project_name: formData.project_name,
      customer_name: formData.customer_name,
      created_by: 1, // hardcoded admin user id
    });
    setIsAddOpen(false);
    setFormData({ project_name: "", customer_name: "" });
    loadProjects();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this BoQ Project?")) {
      await deleteBoqProject(id);
      loadProjects();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EPL BoQ Builder</h1>
          <p className="text-gray-500 mt-1">Buat dan kelola Bill of Quantity untuk berbagai proyek</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Proyek BoQ Baru
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Memuat proyek...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Belum Ada Proyek</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Anda belum membuat dokumen Bill of Quantity (BoQ) apapun. Mulai dengan membuat proyek BoQ baru sekarang.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Buat Proyek BoQ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">{project.project_name}</h3>
              {project.customer_name && (
                <p className="text-sm text-gray-600 mb-4 font-medium">{project.customer_name}</p>
              )}
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(project.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <Link 
                  href={`/admin/boq-builder/${project.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Buka Editor &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Buat Proyek BoQ Baru</h2>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Proyek *</label>
                <input 
                  required 
                  type="text" 
                  autoFocus
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 rounded-lg outline-none transition-all" 
                  placeholder="Contoh: Instalasi VRV Gedung A" 
                  value={formData.project_name} 
                  onChange={e => setFormData({...formData, project_name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Customer (Opsional)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 rounded-lg outline-none transition-all" 
                  placeholder="Contoh: PT Maju Jaya" 
                  value={formData.customer_name} 
                  onChange={e => setFormData({...formData, customer_name: e.target.value})} 
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Buat Proyek</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
