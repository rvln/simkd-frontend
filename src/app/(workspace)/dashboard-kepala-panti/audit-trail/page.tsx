"use client";

import React, { useState } from "react";
import { 
  MdBlock, 
  MdLocalShipping, 
  MdPerson, 
  MdOutlineAccessTime 
} from "react-icons/md";

// Tipe Data
type TabState = "penolakan" | "distribusi";

// Mock Data
const MOCK_REJECTED_LOG = [
  {
    date: "12 OKTOBER 2026",
    logs: [
      {
        id: 1,
        itemName: "Pakaian Bekas Dewasa (1 Karung)",
        reason: "Kondisi fisik tidak layak pakai, banyak yang sobek.",
        donationId: "TXN-DON-2026-8812",
        verifier: "Bapak Ahmad",
        time: "14:30 WITA"
      },
      {
        id: 2,
        itemName: "Makanan Kaleng (Sarden)",
        reason: "Mendekati masa kedaluwarsa (< 1 bulan).",
        donationId: "TXN-DON-2026-8809",
        verifier: "Ibu Siti",
        time: "10:15 WITA"
      }
    ]
  },
  {
    date: "10 OKTOBER 2026",
    logs: [
      {
        id: 3,
        itemName: "Buku Tulis Bekas",
        reason: "Halaman sudah banyak yang tercoret dan sobek.",
        donationId: "TXN-DON-2026-8790",
        verifier: "Bapak Ahmad",
        time: "16:45 WITA"
      }
    ]
  }
];

const MOCK_DISTRIBUTION_LOG = [
  {
    id: 1,
    itemName: "Beras Premium",
    qty: "50 kg",
    target: "Panti Asuhan Dr. J. Lucas (Dapur Utama)",
    notes: "Distribusi rutin bulanan untuk kebutuhan pangan.",
    time: "12 Okt 2026, 08:00 WITA"
  },
  {
    id: 2,
    itemName: "Sepatu Sekolah Anak",
    qty: "15 Pasang",
    target: "Panti Asuhan Dr. J. Lucas (Asrama Putra)",
    notes: "Pembagian sepatu baru untuk persiapan ujian.",
    time: "11 Okt 2026, 15:30 WITA"
  },
  {
    id: 3,
    itemName: "Susu Formula",
    qty: "10 Kaleng",
    target: "Panti Asuhan Dr. J. Lucas (Ruang Balita)",
    notes: "Distribusi tambahan khusus gizi balita.",
    time: "09 Okt 2026, 09:15 WITA"
  }
];

export default function AuditTrailPage() {
  const [activeTab, setActiveTab] = useState<TabState>("penolakan");

  const pageTitle = activeTab === "penolakan" ? "Log Penolakan Barang" : "Log Distribusi Logistik";
  const pageDescription = activeTab === "penolakan" 
    ? "Daftar riwayat barang donasi yang ditolak oleh verifikator karena tidak memenuhi standar kelayakan."
    : "Daftar riwayat distribusi logistik dari gudang penyimpanan menuju penerima akhir.";

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div className="flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-6 lg:p-10 pb-20 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          
          {/* Header & Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 transition-all duration-300">
                {pageTitle}
              </h1>
              <p className="text-gray-500 transition-all duration-300">
                {pageDescription}
              </p>
            </div>

            {/* Pill Toggle */}
            <div className="flex items-center bg-white/60 backdrop-blur-md p-1.5 rounded-full shadow-sm border-none w-fit">
              <button
                onClick={() => setActiveTab("penolakan")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-none ${
                  activeTab === "penolakan" 
                    ? "bg-[#0B648C] text-white shadow-md" 
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Log Penolakan
              </button>
              <button
                onClick={() => setActiveTab("distribusi")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-none ${
                  activeTab === "distribusi" 
                    ? "bg-[#0B648C] text-white shadow-md" 
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Log Distribusi
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="mt-8">
            
            {/* RENDER: TIMELINE PENOLAKAN */}
            {activeTab === "penolakan" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-10 pl-2">
                  {MOCK_REJECTED_LOG.map((group, gIdx) => (
                    <div key={gIdx} className="relative">
                      {/* Date Indicator with Line Hack */}
                      <div className="flex items-center gap-4 mb-6 relative">
                        {/* The dot */}
                        <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)] relative z-10" />
                        <h2 className="text-sm font-bold text-gray-500 tracking-widest uppercase">{group.date}</h2>
                      </div>
                      
                      {/* Vertical line connecting the dots (runs through items) */}
                      <div className="absolute top-3 left-[5px] w-[2px] h-[calc(100%+1.5rem)] bg-gradient-to-b from-red-100 to-transparent -z-10" />

                      <div className="space-y-4 pl-8">
                        {group.logs.map((log) => (
                          <div key={log.id} className="bg-white/70 backdrop-blur-md shadow-sm rounded-2xl p-6 border-none hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              
                              <div className="flex gap-4">
                                {/* Faded Red Cross Icon */}
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                  <MdBlock className="text-2xl text-red-400" />
                                </div>
                                
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">{log.itemName}</h3>
                                  <p className="text-sm text-red-600 font-medium mb-3">{log.reason}</p>
                                  
                                  <div className="flex flex-wrap items-center gap-4">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                                      {log.donationId}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                      <MdPerson className="text-gray-400 text-base" /> {log.verifier}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold md:pt-1">
                                <MdOutlineAccessTime className="text-base" /> {log.time}
                              </div>
                              
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RENDER: LIST DISTRIBUSI */}
            {activeTab === "distribusi" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  {MOCK_DISTRIBUTION_LOG.map((log) => (
                    <div key={log.id} className="bg-white/70 backdrop-blur-md shadow-sm rounded-2xl p-6 border-none hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        
                        {/* Bright Truck Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <MdLocalShipping className="text-3xl text-emerald-500" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{log.itemName}</h3>
                            <span className="text-xs font-bold text-gray-400 mt-1 md:mt-0">{log.time}</span>
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-x-8 gap-y-2 mt-2">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Jumlah (QTY)</p>
                              <p className="text-sm font-bold text-emerald-700">{log.qty}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Target Penerima</p>
                              <p className="text-sm font-bold text-gray-800">{log.target}</p>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              <span className="font-bold text-gray-400 uppercase tracking-wider mr-2">Keterangan:</span>
                              {log.notes}
                            </p>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
