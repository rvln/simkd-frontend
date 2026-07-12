"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  MdPeople, 
  MdStorefront, 
  MdAccountBalanceWallet, 
  MdSecurity, 
  MdMoreVert,
  MdPersonAddAlt1,
  MdOutlineStore
} from "react-icons/md";
import { FiSave, FiSettings, FiCheckCircle } from "react-icons/fi";
import { AlertModal } from "@/components/ui/AlertModal";

// Mock Data untuk Daftar Staff
const MOCK_STAFF = [
  { id: 1, name: "Bapak Ahmad", role: "PENGURUS_PANTI", status: "Aktif", initials: "BA" },
  { id: 2, name: "Ibu Siti", role: "PENGURUS_PANTI", status: "Aktif", initials: "IS" },
];

interface ProfilInstitusiForm {
  namaPanti: string;
  whatsapp: string;
  alamat: string;
  rekeningBank: string;
  ewallet: string;
}

export default function PengaturanInstitusiPage() {
  // State untuk Manajemen Kapasitas
  const [capacity, setCapacity] = useState<number>(15);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleCapacitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(`Kapasitas kunjungan berhasil diperbarui menjadi ${capacity} orang/sesi.`);
    setShowAlert(true);
  };

  // Setup react-hook-form untuk Manajemen Profil & Rekening
  const { register, handleSubmit, formState: { errors } } = useForm<ProfilInstitusiForm>({
    defaultValues: {
      namaPanti: "Panti Asuhan Dr. J. Lucas",
      whatsapp: "081234567890",
      alamat: "Jl. Kasih Sayang No. 123, Lingkungan V, Kota Manado, Sulawesi Utara",
      rekeningBank: "BCA 1234567890 a.n Panti Asuhan Dr. J. Lucas",
      ewallet: "OVO / GoPay: 081234567890"
    }
  });

  const onProfilSubmit = (data: ProfilInstitusiForm) => {
    setAlertMessage("Profil Institusi dan Rekening berhasil disimpan.");
    setShowAlert(true);
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div className="flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-6 lg:p-10 pb-20 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          
          {/* Header Halaman */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Pengaturan Institusi</h1>
            <p className="text-gray-500">Kelola informasi dasar panti, rekening donasi, kapasitas kunjungan, dan akses pengurus.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kolom Kiri: Kapasitas & Profil (Span 2) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* FORM INDEPENDEN 1: Manajemen Kapasitas Kunjungan */}
              <div className="bg-white/60 backdrop-blur-xl shadow-sm rounded-3xl p-8 border-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <MdPeople className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Kapasitas Kunjungan</h2>
                    <p className="text-xs text-gray-500">Batas maksimal tamu per sesi kunjungan</p>
                  </div>
                </div>

                <form onSubmit={handleCapacitySubmit} className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Kuota (Orang)</label>
                    <input 
                      type="number"
                      min="1"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/80 border-none rounded-xl text-sm text-gray-900 font-bold focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                    />
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-bold text-sm rounded-xl shadow-sm hover:bg-purple-700 transition-colors border-none">
                    Simpan Kapasitas
                  </button>
                </form>
              </div>

              {/* FORM INDEPENDEN 2: Profil Institusi & Rekening */}
              <div className="bg-white/60 backdrop-blur-xl shadow-sm rounded-3xl p-8 border-none">
                <form onSubmit={handleSubmit(onProfilSubmit)}>
                  
                  {/* Seksi Profil */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                      <MdStorefront className="text-xl" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Profil Publik Panti</h2>
                      <p className="text-xs text-gray-500">Informasi yang tampil di halaman landing page</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Nama Panti</label>
                      <input 
                        {...register("namaPanti", { required: "Nama Panti wajib diisi" })}
                        className="w-full px-4 py-3 bg-white/80 border-none rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
                      />
                      {errors.namaPanti && <p className="text-red-500 text-xs mt-1">{errors.namaPanti.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">WhatsApp Sistem</label>
                      <input 
                        {...register("whatsapp", { required: "WhatsApp wajib diisi" })}
                        className="w-full px-4 py-3 bg-white/80 border-none rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
                      />
                      {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Alamat Lengkap</label>
                    <textarea 
                      {...register("alamat", { required: "Alamat wajib diisi" })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/80 border-none rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-teal-500/20 shadow-sm resize-none"
                    ></textarea>
                    {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat.message}</p>}
                  </div>

                  {/* Garis Batas Halus */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8"></div>

                  {/* Seksi Rekening */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <MdAccountBalanceWallet className="text-xl" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Informasi Rekening Donasi</h2>
                      <p className="text-xs text-gray-500">Digunakan donatur untuk Transfer Bank & E-Wallet</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Rekening Bank</label>
                      <input 
                        {...register("rekeningBank", { required: "Rekening Bank wajib diisi" })}
                        className="w-full px-4 py-3 bg-white/80 border-none rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                        placeholder="Contoh: BCA 123456 a.n Panti"
                      />
                      {errors.rekeningBank && <p className="text-red-500 text-xs mt-1">{errors.rekeningBank.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">E-Wallet</label>
                      <input 
                        {...register("ewallet", { required: "E-Wallet wajib diisi" })}
                        className="w-full px-4 py-3 bg-white/80 border-none rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                        placeholder="Contoh: GoPay 08123456"
                      />
                      {errors.ewallet && <p className="text-red-500 text-xs mt-1">{errors.ewallet.message}</p>}
                    </div>
                  </div>

                  {/* Tombol Simpan Profil */}
                  <div className="flex justify-end">
                    <button type="submit" className="px-8 py-3 bg-teal-700 text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_rgba(15,118,110,0.3)] hover:-translate-y-0.5 transition-all border-none">
                      Simpan Profil
                    </button>
                  </div>

                </form>
              </div>

            </div>

            {/* Kolom Kanan: Otorisasi Pengurus */}
            <div>
              <div className="bg-white/60 backdrop-blur-xl shadow-sm rounded-3xl p-6 border-none flex flex-col h-full">
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <MdSecurity className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Akses Pengurus</h2>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Staf dengan Akses Dashboard</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {MOCK_STAFF.map((staff) => (
                    <div key={staff.id} className="bg-white/80 p-4 rounded-2xl shadow-sm border-none flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {staff.initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{staff.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest">{staff.role}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">{staff.status}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 border-none bg-transparent">
                        <MdMoreVert className="text-xl" />
                      </button>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 flex items-center justify-center gap-2 bg-transparent border-2 border-dashed border-gray-300 text-gray-500 font-bold text-sm rounded-xl hover:border-teal-500 hover:text-teal-600 transition-colors">
                  <MdPersonAddAlt1 className="text-lg" />
                  Tambah Pengurus
                </button>
                
              </div>
            </div>

          </div>

        </div>
      </div>
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
    </div>
  );
}
