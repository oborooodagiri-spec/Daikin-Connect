"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, ArrowLeft, Trash2, List, Upload, Download } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

interface Register {
  id: string;
  gateway_id: string;
  name: string;
  category: string;
  sub_category: string;
  register_address: number;
  register_type: "input" | "holding";
  data_type: "INT16" | "INT32" | "FLOAT32";
  scale_factor: number;
  unit: string;
  created_at: string;
}

export default function RegisterClient({ gatewayId }: { gatewayId: string }) {
  const [registers, setRegisters] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Chiller",
    sub_category: "",
    register_address: 0,
    register_type: "holding",
    data_type: "INT16",
    scale_factor: 1,
    unit: "",
  });

  const fetchRegisters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/modbus/registers?gateway_id=${gatewayId}`);
      if (res.ok) {
        const data = await res.json();
        setRegisters(data.registers || []);
      }
    } catch (error) {
      console.error("Failed to fetch registers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisters();
  }, [gatewayId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/modbus/registers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, gateway_id: gatewayId }),
      });
      if (res.ok) {
        setShowModal(false);
        fetchRegisters();
        setFormData({
          name: "",
          category: "Chiller",
          sub_category: "",
          register_address: 0,
          register_type: "holding",
          data_type: "INT16",
          scale_factor: 1,
          unit: "",
        });
      } else {
        const err = await res.json();
        alert(`Gagal menyimpan register: ${err.error || 'Terjadi kesalahan server'}`);
      }
    } catch (error) {
      console.error("Failed to add register:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus register ini?")) return;
    try {
      const res = await fetch(`/api/v1/modbus/registers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRegisters();
      }
    } catch (error) {
      console.error("Failed to delete register:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        alert("File Excel kosong atau format tidak sesuai.");
        return;
      }

      const payload = jsonData.map((row) => ({
        name: row["Nama"] || row["name"] || "Unknown",
        category: row["Kategori"] || row["category"] || "Chiller",
        sub_category: row["Sub Kategori"] || row["sub_category"] || "",
        register_address: parseInt(row["Address"] || row["register_address"] || 0),
        register_type: (row["Tipe"] || row["register_type"] || "holding").toString().toLowerCase(),
        data_type: (row["Data Type"] || row["data_type"] || "INT16").toString().toUpperCase(),
        scale_factor: parseFloat(row["Skala"] || row["scale_factor"] || 1),
        unit: row["Satuan"] || row["unit"] || "",
      }));

      const res = await fetch("/api/v1/modbus/registers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateway_id: gatewayId, registers: payload }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Berhasil import ${result.count} register!`);
        fetchRegisters();
      } else {
        const err = await res.json();
        alert(`Gagal import: ${err.error}`);
      }
    } catch (error: any) {
      console.error("Error reading excel:", error);
      alert(`Terjadi kesalahan saat membaca file: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Nama": "Chiller 1 Temp",
        "Kategori": "Chiller",
        "Sub Kategori": "Suhu",
        "Address": 100,
        "Tipe": "holding",
        "Data Type": "INT16",
        "Skala": 0.1,
        "Satuan": "°C",
      },
      {
        "Nama": "Chiller 1 Power",
        "Kategori": "Chiller",
        "Sub Kategori": "Listrik",
        "Address": 102,
        "Tipe": "input",
        "Data Type": "FLOAT32",
        "Skala": 1,
        "Satuan": "kW",
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Register.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/admin/modbus"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Gateway
        </Link>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 h-10 px-4 py-2"
          >
            <Download className="mr-2 h-4 w-4 text-gray-500" />
            Template Excel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 h-10 px-4 py-2"
          >
            {isUploading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import Excel
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Register
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Nama</th>
                <th scope="col" className="px-6 py-4 font-semibold">Kategori</th>
                <th scope="col" className="px-6 py-4 font-semibold">Address</th>
                <th scope="col" className="px-6 py-4 font-semibold">Tipe</th>
                <th scope="col" className="px-6 py-4 font-semibold">Data Type</th>
                <th scope="col" className="px-6 py-4 font-semibold">Skala</th>
                <th scope="col" className="px-6 py-4 font-semibold">Satuan</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : registers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <List className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-900 dark:text-white font-medium">Belum ada register</p>
                    <p className="text-sm mt-1">Tambahkan register pertama untuk gateway ini atau import dari Excel.</p>
                  </td>
                </tr>
              ) : (
                registers.map((reg) => (
                  <tr
                    key={reg.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {reg.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {reg.category}
                      </span>
                      {reg.sub_category && (
                        <span className="ml-2 text-xs text-gray-400">{reg.sub_category}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">{reg.register_address}</td>
                    <td className="px-6 py-4 capitalize">{reg.register_type}</td>
                    <td className="px-6 py-4">{reg.data_type}</td>
                    <td className="px-6 py-4">{reg.scale_factor}</td>
                    <td className="px-6 py-4">{reg.unit || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(reg.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Hapus"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Register */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tambah Register
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="add-register-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Register
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Chiller 1 Power"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Chiller">Chiller</option>
                      <option value="Pump">Pump</option>
                      <option value="Cooling Tower">Cooling Tower</option>
                      <option value="Sensor">Sensor</option>
                      <option value="Other">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sub Kategori
                    </label>
                    <input
                      type="text"
                      value={formData.sub_category}
                      onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Opsional"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Register Address
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.register_address}
                      onChange={(e) => setFormData({ ...formData, register_address: parseInt(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipe Register
                    </label>
                    <select
                      value={formData.register_type}
                      onChange={(e) => setFormData({ ...formData, register_type: e.target.value as "input" | "holding" })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="holding">Holding Register (4000x)</option>
                      <option value="input">Input Register (3000x)</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Type
                    </label>
                    <select
                      value={formData.data_type}
                      onChange={(e) => setFormData({ ...formData, data_type: e.target.value as "INT16" | "INT32" | "FLOAT32" })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INT16">INT16</option>
                      <option value="INT32">INT32</option>
                      <option value="FLOAT32">FLOAT32</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Faktor Skala
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formData.scale_factor}
                      onChange={(e) => setFormData({ ...formData, scale_factor: parseFloat(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="kW, °C, dll"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="add-register-form"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Simpan Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
