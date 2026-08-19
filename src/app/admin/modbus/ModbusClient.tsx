"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Server, Settings2, Trash2, Pencil, Download } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Gateway {
  id: string;
  name: string;
  description: string;
  ip_address: string;
  port: number;
  slave_id: number;
  poll_interval: number;
  api_key: string;
  status: string;
  created_at: string;
}

export default function ModbusClient() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    ip_address: "",
    port: 502,
    slave_id: 1,
    poll_interval: 60,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ip_address: "192.168.1.100",
    port: 502,
    slave_id: 1,
    poll_interval: 60,
  });

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/modbus/gateways");
      if (res.ok) {
        const data = await res.json();
        setGateways(data.gateways || []);
      }
    } catch (error) {
      console.error("Failed to fetch gateways:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("API Key tersalin!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/modbus/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchGateways();
        setFormData({
          name: "",
          description: "",
          ip_address: "192.168.1.100",
          port: 502,
          slave_id: 1,
          poll_interval: 60,
        });
      }
    } catch (error) {
      console.error("Failed to add gateway:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus gateway ini?")) return;
    try {
      const res = await fetch(`/api/v1/modbus/gateways/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchGateways();
      }
    } catch (error) {
      console.error("Failed to delete gateway:", error);
    }
  };

  const handleEdit = (gw: Gateway) => {
    setEditingGateway(gw);
    setEditFormData({
      name: gw.name,
      description: gw.description || "",
      ip_address: gw.ip_address,
      port: gw.port,
      slave_id: gw.slave_id,
      poll_interval: gw.poll_interval,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;
    try {
      const res = await fetch("/api/v1/modbus/gateways", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingGateway.id, ...editFormData }),
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingGateway(null);
        fetchGateways();
      }
    } catch (error) {
      console.error("Failed to update gateway:", error);
    }
  };

  const handleDownloadReport = async (gw: Gateway) => {
    try {
      // 1. Fetch Logs
      const res = await fetch(`/api/v1/modbus/logs?gateway_id=${gw.id}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      const logs = data.logs || [];

      if (logs.length === 0) {
        alert("Tidak ada data untuk gateway ini.");
        return;
      }

      // Group logs by hour
      // Log shape: { recorded_at, raw_value, scaled_value, register: { name, unit } }
      const hourlyData: Record<string, any[]> = {};
      logs.forEach((log: any) => {
        const date = new Date(log.recorded_at);
        // Format to YYYY-MM-DD HH:00
        const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        if (!hourlyData[hourKey]) hourlyData[hourKey] = [];
        hourlyData[hourKey].push(log);
      });

      const tableRows: any[][] = [];
      Object.keys(hourlyData).sort().forEach(hour => {
        // Just take the first reading of the hour for simplicity in this testing phase
        const logsInHour = hourlyData[hour];
        // We might have multiple registers, so let's list them
        logsInHour.forEach(log => {
           tableRows.push([
             hour,
             log.register?.name || "Unknown",
             log.scaled_value.toString(),
             log.register?.unit || "",
             "Normal"
           ]);
        });
      });

      // 2. Generate PDF
      const pdf = new jsPDF("p", "mm", "a4");
      
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("MODBUS DATA LOGGING REPORT", 14, 20);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Site: ${gw.name} (${gw.description})`, 14, 30);
      pdf.text(`IP Address: ${gw.ip_address}:${gw.port}`, 14, 35);
      pdf.text(`Generated at: ${new Date().toLocaleString('id-ID')}`, 14, 40);

      pdf.autoTable({
        startY: 50,
        head: [["Waktu (Hourly)", "Parameter", "Nilai", "Satuan", "Remarks"]],
        body: tableRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 115, 234] },
      });

      pdf.save(`Modbus_Report_${gw.name}_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal men-download laporan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Daftar Gateway Modbus
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Gateway
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : gateways.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Server className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Tidak ada gateway</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mulai dengan menambahkan gateway Modbus baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Server className="mr-2 h-5 w-5 text-blue-500" />
                      {gw.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {gw.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      gw.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {gw.status === "active" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">IP Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {gw.ip_address}:{gw.port}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Slave ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{gw.slave_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Interval Poll</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {gw.poll_interval} detik
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">API Key</p>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <code className="text-xs text-gray-800 dark:text-gray-200 truncate flex-1 font-mono">
                      {gw.api_key}
                    </code>
                    <button
                      onClick={() => handleCopy(gw.api_key)}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Salin API Key"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <button
                  onClick={() => handleDelete(gw.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </button>
                <button
                  onClick={() => handleEdit(gw)}
                  className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 text-sm font-medium flex items-center"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDownloadReport(gw)}
                  className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <Link
                  href={`/admin/modbus/${gw.id}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Settings2 className="mr-1.5 h-4 w-4" />
                  Kelola Register
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Gateway */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tambah Gateway Modbus
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Gateway
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Chiller Plant A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opsional"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slave ID
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.slave_id}
                    onChange={(e) => setFormData({ ...formData, slave_id: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interval (detik)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.poll_interval}
                    onChange={(e) => setFormData({ ...formData, poll_interval: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Simpan Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit Gateway */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Gateway
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingGateway(null); }}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Gateway
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.ip_address}
                    onChange={(e) => setEditFormData({ ...editFormData, ip_address: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.port}
                    onChange={(e) => setEditFormData({ ...editFormData, port: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slave ID
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.slave_id}
                    onChange={(e) => setEditFormData({ ...editFormData, slave_id: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interval (detik)
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.poll_interval}
                    onChange={(e) => setEditFormData({ ...editFormData, poll_interval: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingGateway(null); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
