"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import Link from "next/link";
import {
  MdOutlineChildCare,
  MdMenuBook,
  MdHome,
  MdCalendarMonth,
  MdVerifiedUser,
  MdArrowForward,
  MdFavoriteBorder,
} from "react-icons/md";

// ── Published VisitReport for Dokumentasi Kegiatan ──────────────────────────
interface PublishedReport {
  id: string;
  title: string; // admin_title OR first-6-words fallback (derived by backend)
  content: string;
  visitor_name: string; // PII-masked
  image_path: string[] | null;
  visit_date: string | null;
}

const API_BASE_PUBLIC =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_BASE =
  process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

// ── Jejak Kebaikan: Thank-you message pools ─────────────────────────────────
const THANK_YOU_DANA = [
  "Setiap rupiah yang Anda berikan adalah pelita bagi masa depan anak-anak kami.",
  "Kebaikan hati Anda mengalir menjadi senyum dan harapan di panti kami.",
  "Kontribusi Anda membuktikan bahwa kemanusiaan tidak pernah pudar.",
  "Terima kasih telah menjadi bagian dari perjalanan kami menuju masa depan cerah.",
  "Donasi Anda adalah bukti nyata bahwa kepedulian ada di mana-mana.",
];

const THANK_YOU_BARANG = [
  "Sumbangan barang Anda langsung dirasakan oleh anak-anak yang membutuhkan.",
  "Setiap barang yang Anda kirimkan membawa kehangatan nyata ke kehidupan mereka.",
  "Bantuan Anda membuat panti kami semakin lengkap dalam melayani anak-anak.",
  "Kepedulian Anda berbentuk nyata dan terasa hangat di sini.",
  "Terima kasih telah berbagi dalam kebaikan yang sederhana namun bermakna.",
];

function getRandomMessage(type: string): string {
  const pool = type === "DANA" ? THANK_YOU_DANA : THANK_YOU_BARANG;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface JejakDonatur {
  masked_name: string;
  type: string;
  amount: number | null;
  updated_at: string;
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Baru saja" : `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function formatRpShort(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(0)} jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  return `Rp ${amount}`;
}

export default function LandingPage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState("");

  // ── Dokumentasi Kegiatan: fetch 3 latest published VisitReports ──────────
  const [docReports, setDocReports] = useState<PublishedReport[]>([]);
  const [docLoading, setDocLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(
          `${API_BASE_PUBLIC}/api/public/transparansi/laporan?per_page=3`,
        );
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        setDocReports(json.data ?? []);
      } catch {
        // Silently fail — section will show placeholder cards
      } finally {
        setDocLoading(false);
      }
    };
    fetchReports();
  }, []);

  // ── Jejak Kebaikan: fetch 3 latest donors ────────────────────────────────
  const [donatur, setDonatur] = useState<JejakDonatur[]>([]);
  const [donaturLoading, setDonaturLoading] = useState(true);
  // Messages randomized once when data arrives
  const [donaturMessages, setDonaturMessages] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_PUBLIC}/api/public/jejak-kebaikan`)
      .then((r) => r.json())
      .then((json) => {
        const data: JejakDonatur[] = json.data ?? [];
        setDonatur(data);
        setDonaturMessages(data.map((d) => getRandomMessage(d.type)));
      })
      .catch(() => {})
      .finally(() => setDonaturLoading(false));
  }, []);

  const handleTrack = () => {
    if (trackingCode.trim()) {
      router.push(`/donasi/lacak-donasi/${trackingCode.trim()}`);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 md:pt-32 space-y-16 md:space-y-32 pb-16 md:pb-32 bg-[#F9FAFB]">
        {/* Hero Section — Full Bleed Background Overlay */}
        <section className="relative min-h-[400px] md:min-h-[650px] flex items-center overflow-hidden rounded-b-2xl md:rounded-b-3xl mx-3 md:mx-8">
          {/* Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 w-full h-full object-cover"
            alt="Anak-anak bermain bersama"
            src="/example_img/kids-7.png"
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/70 via-teal-950/90 to-teal-950" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 md:px-16 py-16 md:py-24">
            <div className="max-w-2xl space-y-5 md:space-y-7">
              <span className="inline-block px-3 md:px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 font-public-sans text-[10px] md:text-xs font-bold uppercase tracking-widest">
                BERBAGI KEBAIKAN
              </span>
              <h1 className="text-3xl md:text-7xl font-black tracking-tighter text-white leading-[1] md:leading-[0.92] font-sans">
                <span className="text-teal-300 text-[2.25rem] md:text-[5.5rem] tracking-tight block">
                  Pelita Kebaikan
                </span>
                untuk Langkah Kecil Mereka.
              </h1>
              <p className="text-sm md:text-lg text-white/80 max-w-lg leading-relaxed font-normal font-sans">
                Membangun ekosistem terbuka dengan pelaporan transparan demi
                memastikan setiap anak terlindungi dan dihargai.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 pt-2 font-sans">
                <PrimaryButton
                  className="shadow-lg py-4 sm:py-3 w-full sm:w-auto text-center justify-center min-h-[44px] !bg-primary !text-white hover:!bg-primary/80"
                  onClick={() => router.push("/donasi/barang")}
                >
                  Donasi Sekarang
                </PrimaryButton>
                <Link
                  href="/profil"
                  className="flex items-center justify-center gap-2 font-semibold text-white/90 hover:text-white transition-colors py-3 min-h-[44px]"
                >
                  Jelajahi Misi Kami <MdArrowForward className="text-xl" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Current Needs Section */}
        <section className="max-w-screen-2xl mx-auto px-5 md:px-12 space-y-8 md:space-y-12">
          <div className="space-y-3 md:space-y-4 text-center md:text-left">
            <h2 className="text-xl md:text-4xl font-black font-sans tracking-tighter text-gray-900">
              Transparansi Kebutuhan{" "}
              <span className="text-teal-700">Panti Asuhan.</span>
            </h2>
            <p className="text-sm md:text-lg text-gray-500 font-normal italic font-sans">
              Bawa Harapan dalam Keseharian Mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col justify-between space-y-6 md:space-y-10 group hover:bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <MdOutlineChildCare className="text-3xl" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg md:text-lg font-bold font-sans tracking-tight text-gray-900">
                    Nutrisi &amp; Kesejahteraan
                  </h3>
                  <p className="text-gray-500 leading-relaxed font-sans">
                    Memberikan makanan bergizi dan perawatan khusus yang
                    membangun fondasi bagi masa depan yang sehat dan ceria.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col justify-between space-y-6 md:space-y-10 group hover:bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <MdMenuBook className="text-3xl" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg md:text-lg font-bold font-sans tracking-tight text-gray-900">
                    Perjalanan Pendidikan
                  </h3>
                  <p className="text-gray-500 leading-relaxed font-sans">
                    Menyediakan peralatan, teknologi, dan bimbingan yang
                    dibutuhkan setiap anak untuk membuka potensi unik dan
                    bermimpi.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col justify-between space-y-6 md:space-y-10 group hover:bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <MdHome className="text-3xl" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg md:text-lg font-bold font-sans tracking-tight text-gray-900">
                    Kenyamanan Harian
                  </h3>
                  <p className="text-gray-500 leading-relaxed font-sans">
                    Mengubah ruang menjadi rumah yang hangat dan aman dengan
                    barang-barang esensial yang memberikan rasa memiliki.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tracker & Scheduler */}
        <section className="max-w-screen-2xl mx-auto px-5 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 h-full">
            {/* Jadwal Kunjungan Action Card */}
            <div className="bg-[#0B648C] text-white rounded-2xl md:rounded-3xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[280px] md:min-h-[350px] shadow-md border-none">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <MdCalendarMonth className="text-3xl md:text-4xl" />
                  <h2 className="text-lg md:text-3xl font-black font-sans leading-tight tracking-tight">
                    Jadwalkan Kunjungan
                  </h2>
                </div>
                <p className="text-white/90 text-sm md:text-lg leading-relaxed max-w-sm font-sans">
                  Jadwalkan kunjungan untuk melihat langsung kegiatan kami. Kami
                  percaya transparansi adalah kunci kepercayaan.
                </p>
                <div className="pt-4">
                  <Link
                    href="/jadwal-kunjungan"
                    className="w-full md:w-auto bg-white text-[#0B648C] px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors font-sans shadow-sm cursor-pointer border-none inline-flex text-sm md:text-base min-h-[44px]"
                  >
                    Mulai Penjadwalan <MdArrowForward className="text-xl" />
                  </Link>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Lacak Resi Action Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-8 md:p-12 flex flex-col justify-between min-h-[280px] md:min-h-[350px] shadow-sm border-none">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-lg md:text-3xl font-bold font-sans tracking-tight text-gray-900">
                      Lacak Resi Donasi
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 font-sans">
                      Lihat dampak nyata dari kontribusi Anda secara langsung.
                    </p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-2xl shadow-sm border-none">
                    <MdVerifiedUser className="text-teal-700 text-3xl" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <InputField
                        label="IDENTIFIKASI TRANSAKSI"
                        placeholder="TXN-DON-2026-XXXX"
                        id="tracking-input"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                      />
                    </div>
                    <PrimaryButton
                      className="w-full sm:w-auto py-3 min-h-[44px]"
                      onClick={handleTrack}
                    >
                      Lacak
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dokumentasi Kegiatan — Dynamic from Published VisitReports */}
        <section className="max-w-screen-2xl mx-auto px-5 md:px-12 space-y-8 md:space-y-12">
          <div className="space-y-2">
            <h2 className="text-lg md:text-3xl font-bold font-sans tracking-tighter text-gray-900">
              Dokumentasi Kegiatan
            </h2>
            <p className="text-gray-500 font-sans text-sm md:text-lg">
              Momen bahagia dan edukatif bersama anak-anak panti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-auto md:h-[500px]">
            {/* Kiri: Card Lanskap Panjang — Report[0] */}
            {docLoading ? (
              <div className="md:col-span-2 relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm min-h-[220px] md:min-h-[300px] bg-slate-200 animate-pulse" />
            ) : docReports[0] ? (
              <div className="md:col-span-2 relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group min-h-[220px] md:min-h-[300px]">
                {/* Background */}
                {docReports[0].image_path?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${STORAGE_BASE}/${docReports[0].image_path[0]}`}
                    alt={docReports[0].title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent z-10" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-5 md:p-8 z-20">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold rounded-full uppercase tracking-widest mb-2 md:mb-3 inline-block">
                    {docReports[0].visitor_name}
                  </span>
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
                    {docReports[0].title}
                  </h3>
                  <p className="text-white/80 line-clamp-2 max-w-md text-sm md:text-base">
                    {docReports[0].content}
                  </p>
                  {docReports[0].visit_date && (
                    <p className="text-white/50 text-xs mt-2 font-sans">
                      {new Date(docReports[0].visit_date).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Fallback jika tidak ada data */
              <div className="md:col-span-2 relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group min-h-[220px] md:min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 p-5 md:p-8 z-20">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold rounded-full uppercase tracking-widest mb-2 md:mb-3 inline-block">
                    Panti Asuhan Dr. J. Lucas
                  </span>
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
                    Dokumentasi Kegiatan Bersama
                  </h3>
                </div>
              </div>
            )}

            {/* Kanan: Kumpulan Card Kecil — Report[1] & Report[2] */}
            <div className="grid grid-cols-2 md:flex md:flex-col gap-4 md:gap-6">
              {/* Card Kecil Atas — Report[1] */}
              {docLoading ? (
                <div className="flex-1 min-h-[160px] md:min-h-0 rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
              ) : docReports[1] ? (
                <div className="flex-1 min-h-[160px] md:min-h-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm relative group">
                  {docReports[1].image_path?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${STORAGE_BASE}/${docReports[1].image_path[0]}`}
                      alt={docReports[1].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 z-20">
                    <h4 className="text-white font-bold text-sm md:text-base line-clamp-2">
                      {docReports[1].title}
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-[160px] md:min-h-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 z-20">
                    <h4 className="text-white font-bold text-sm md:text-base">
                      Kunjungan Bersama
                    </h4>
                  </div>
                </div>
              )}

              {/* Card Kecil Bawah — Report[2] */}
              {docLoading ? (
                <div className="flex-1 min-h-[160px] md:min-h-0 rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
              ) : docReports[2] ? (
                <div className="flex-1 min-h-[160px] md:min-h-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm relative group">
                  {docReports[2].image_path?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${STORAGE_BASE}/${docReports[2].image_path[0]}`}
                      alt={docReports[2].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 z-20">
                    <h4 className="text-white font-bold text-sm md:text-base line-clamp-2">
                      {docReports[2].title}
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-[160px] md:min-h-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 z-20">
                    <h4 className="text-white font-bold text-sm md:text-base">
                      Kegiatan Panti
                    </h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* New Section: Jejak Kebaikan Real-Time */}
        <section className="max-w-screen-2xl mx-auto px-5 md:px-12 space-y-8 md:space-y-12">
          <div className="space-y-2 text-center">
            <h2 className="text-lg md:text-3xl font-bold font-sans tracking-tighter text-gray-900">
              Jejak Kebaikan
            </h2>
            <p className="text-gray-500 font-sans text-sm md:text-lg">
              Pesan dan dukungan mengalir secara real-time dari donatur kami.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 max-w-4xl mx-auto">
            {donaturLoading ? (
              // Skeleton placeholders
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm flex items-start gap-3 md:gap-4 animate-pulse"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-teal-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                  </div>
                </div>
              ))
            ) : donatur.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl p-6 shadow-sm text-center text-gray-400 text-sm">
                Belum ada donatur yang tercatat. Jadilah yang pertama!
              </div>
            ) : (
              donatur.map((d, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border-none flex items-start gap-3 md:gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold flex-shrink-0 text-sm md:text-base">
                    {d.masked_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                      <h4 className="font-bold text-gray-900">
                        {d.masked_name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                          d.type === "DANA"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {d.type === "DANA" ? "Donasi Dana" : "Donasi Barang"}
                      </span>
                      {d.type === "DANA" && d.amount !== null && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                          {formatRpShort(d.amount)}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {formatTimeAgo(d.updated_at)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed italic">
                      &ldquo;{donaturMessages[i] ?? ""}&rdquo;
                    </p>
                  </div>
                  {/* <div className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors cursor-pointer pt-1">
                    <MdFavoriteBorder className="text-2xl" />
                  </div> */}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
