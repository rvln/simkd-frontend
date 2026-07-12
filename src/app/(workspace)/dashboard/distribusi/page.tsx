"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiFilter, FiAlertCircle, FiRefreshCw, FiBox, FiCalendar, FiUser, FiChevronDown, FiPlus } from "react-icons/fi";
import { GlobalDomainDrawer } from "@/components/workspace/GlobalDomainDrawer";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function DistribusiPage() {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [distributions, setDistributions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchDistributions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE}/api/distribusi`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (!res.ok) throw new Error("Gagal memuat riwayat distribusi");
      const json = await res.json();
      const data = Array.isArray(json) ? json : json.data ?? [];
      setDistributions(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  const filteredDistributions = distributions.filter((item) => {
    const matchesTarget = filterTarget === "" || item.target_recipient === filterTarget;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      item.inventory?.itemName?.toLowerCase().includes(searchLower) ||
      item.target_recipient?.toLowerCase().includes(searchLower) ||
      item.inventory?.category?.toLowerCase().includes(searchLower);

    const matchesDate = filterDate === "" || (item.distributed_at && item.distributed_at.startsWith(filterDate));

    return matchesTarget && matchesSearch && matchesDate;
  });

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-[#F9FAFB]">
      <div className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-8 overflow-y-auto ${isPanelOpen ? 'pr-[450px]' : ''}`}>
        <div className="max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Riwayat Distribusi</h1>
            <p className="text-gray-500 text-lg">Catat dan pantau pengeluaran barang untuk transparansi alokasi publik.</p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative w-full lg:flex-1 lg:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input 
                type="text" 
                placeholder="Cari Riwayat..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B648C]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow border-none"
              />
            </div>
            
            <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none z-10">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  value={filterTarget}
                  onChange={(e) => setFilterTarget(e.target.value)}
                  className="w-full appearance-none pl-9 md:pl-11 pr-8 py-3.5 bg-white rounded-xl text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors border-none focus:ring-2 focus:ring-[#0B648C]/20 outline-none cursor-pointer truncate"
                >
                  <option value="">Semua Target</option>
                  <option value="Unit Satu">Unit Satu</option>
                  <option value="Unit Dua">Unit Dua</option>
                  <option value="Unit Tiga">Unit Tiga</option>
                  <option value="Unit Empat">Unit Empat</option>
                  <option value="Unit Lima">Unit Lima</option>
                  <option value="Unit Enam">Unit Enam</option>
                  <option value="Unit Tujuh">Unit Tujuh</option>
                  <option value="Fasilitas Umum">Fasilitas Umum</option>
                  <option value="Eksternal / Lainnya">Eksternal / Lainnya</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <FiChevronDown className="text-gray-400" />
                </div>
              </div>

              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none z-10">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-9 md:pl-11 pr-3 py-3.5 bg-white rounded-xl text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors border-none focus:ring-2 focus:ring-[#0B648C]/20 outline-none cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={() => setIsPanelOpen(true)}
              className="hidden lg:flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0B648C] text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(11,100,140,0.3)] hover:bg-[#095273] transition-all hover:-translate-y-0.5 lg:ml-auto whitespace-nowrap"
            >
              <FiPlus className="text-lg" /> Distribusi Baru
            </button>
          </div>

          {/* Error Banner */}
          {fetchError && (
            <div className="mb-8 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">
              <FiAlertCircle className="text-lg flex-shrink-0" />
              <span className="flex-1">{fetchError}</span>
              <button onClick={fetchDistributions} className="flex items-center gap-1.5 text-red-700 font-bold hover:text-red-900">
                <FiRefreshCw className="text-base" /> Coba lagi
              </button>
            </div>
          )}

          {/* Grid of UI Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white h-48 rounded-2xl animate-pulse shadow-sm"></div>
              ))}
            </div>
          ) : filteredDistributions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
              <FiBox className="text-5xl text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                {distributions.length === 0 
                  ? "Belum ada riwayat distribusi yang dicatat." 
                  : "Tidak ada riwayat distribusi yang cocok dengan pencarian/filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredDistributions.map((item: any) => (
                <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col group cursor-pointer hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#E6F4F1] text-[#0B648C] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                      {item.inventory?.category ?? "Umum"}
                    </div>
                  </div>
                  
                  <h3 className="text-[17px] font-bold text-gray-900 leading-tight mb-2 group-hover:text-[#0B648C] transition-colors line-clamp-2">
                    {item.inventory?.itemName ?? "Unknown Item"}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex flex-col justify-end">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FiBox className="text-gray-400 flex-shrink-0" />
                        <span className="font-bold text-gray-900 truncate" title={`${item.qty} ${item.inventory?.unit ?? "Pcs"}`}>{item.qty} {item.inventory?.unit ?? "Pcs"}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FiUser className="text-gray-400 flex-shrink-0" />
                        <span className="truncate" title={item.target_recipient}>{item.target_recipient}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-gray-100">
                      <FiCalendar className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{item.distributed_at ? new Date(item.distributed_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <GlobalDomainDrawer
        domain="DISTRIBUSI"
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        token={token}
        onSuccess={() => {
          setIsPanelOpen(false);
          fetchDistributions();
        }}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="bg-[#E6F4F1] text-[#0B648C] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest w-fit mb-2">
                    {selectedItem.inventory?.category ?? "Umum"}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedItem.inventory?.itemName ?? "Unknown Item"}</h2>
                </div>
              </div>

              <div className="space-y-4 my-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jumlah Didistribusikan</p>
                  <p className="text-gray-900 font-medium">{selectedItem.qty} {selectedItem.inventory?.unit ?? "Pcs"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Penerima / Target</p>
                  <p className="text-gray-900 font-medium">{selectedItem.target_recipient}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Distribusi</p>
                  <p className="text-gray-900 font-medium">
                    {selectedItem.distributed_at ? new Date(selectedItem.distributed_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Didistribusikan Oleh</p>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <FiUser className="text-gray-400" />
                    {selectedItem.distributed_by ?? "Sistem/Admin"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan / Keterangan Audit</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-gray-700 text-sm italic">{selectedItem.notes || "Tidak ada catatan spesifik."}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors border-none"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) - Mobile Only */}
      {!isPanelOpen && (
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-[90] flex items-center justify-center w-14 h-14 bg-[#0B648C] text-white rounded-full shadow-[0_8px_24px_rgba(11,100,140,0.4)] hover:shadow-[0_12px_32px_rgba(11,100,140,0.5)] active:scale-95 transition-all"
          title="Distribusi Baru"
        >
          <FiPlus className="text-2xl" />
        </button>
      )}
    </div>
  );
}
