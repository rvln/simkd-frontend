"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  MdArrowBack,
  MdLocalShipping,
  MdCheckCircle,
  MdInventory2,
  MdChat,
  MdContentCopy,
  MdInfoOutline,
  MdExpandMore,
  MdExpandLess,
  MdTimer,
  MdPeopleAlt,
  MdCalendarMonth,
} from "react-icons/md";
import { FiInfo } from "react-icons/fi";

export default function LacakDonasiPage({
  params,
}: {
  params: Promise<{ resi: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailSent = searchParams.get("emailSent") === "true";
  const resolvedParams = use(params);
  const resi = resolvedParams.resi;

  const [copied, setCopied] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [donationData, setDonationData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/donasi-barang/${resi}`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error("Resi tidak ditemukan");
        }
        const result = await response.json();
        setDonationData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonation();
  }, [resi]);

  const status: string = donationData?.status || "PENDING_DELIVERY";

  // Relational Lifecycle Binding: donations created via a visit should NOT
  // show courier/logistics UI — the visitor brings the items in person.
  const isVisitBound: boolean = !!donationData?.visit_id;

  const slideshowImages = useMemo<string[]>(() => {
    if (!donationData?.item_donations) return [];
    const photos = donationData.item_donations
      .filter((item: any) => item.photo_url)
      .map((item: any) => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${item.photo_url}`);
    return photos;
  }, [donationData]);

  useEffect(() => {
    if (slideshowImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  // ── Expiry Countdown Timer — only for standalone public donations ──
  useEffect(() => {
    // Visit-bound donations have session-bounded TTLs, not courier deadlines.
    // The expiry countdown is irrelevant and misleading for in-person handovers.
    if (
      isVisitBound ||
      !donationData?.expires_at ||
      status !== "PENDING_DELIVERY"
    ) {
      setCountdown(null);
      setIsExpired(false);
      return;
    }

    const tick = () => {
      const expiresAt = new Date(donationData.expires_at).getTime();
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
        setCountdown(null);
        return;
      }

      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${hours} jam ${minutes} menit`);
    };

    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [isVisitBound, donationData?.expires_at, status]);

  const handleCopyResi = () => {
    navigator.clipboard.writeText(resi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      label: "Menunggu Pengiriman",
      status:
        status === "PENDING_DELIVERY" || status === "SUCCESS"
          ? "active"
          : "pending",
      icon: <MdLocalShipping />,
    },
    {
      label: "Tervalidasi & Diterima",
      status: status === "SUCCESS" ? "active" : "pending",
      icon: <MdCheckCircle />,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-on-surface-variant font-bold tracking-widest uppercase text-sm">
          Memuat Data...
        </span>
      </div>
    );
  }

  if (error) {
    if (error === "Resi tidak ditemukan") {
      return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-sm border-none max-w-lg w-full flex flex-col items-center">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8">
              <MdInfoOutline className="text-5xl" />
            </div>
            <h1 className="text-8xl font-black text-gray-200 tracking-tighter mb-2 font-sans">
              404
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-sans tracking-tight">
              Resi Tidak Ditemukan
            </h2>
            <p className="text-gray-500 mb-8 font-sans leading-relaxed">
              Maaf, kode resi{" "}
              <span className="font-bold text-teal-700">{resi}</span> tidak
              ditemukan dalam sistem kami. Pastikan kode yang Anda masukkan
              sudah benar.
            </p>
            <PrimaryButton
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 py-4 shadow-md"
            >
              <MdArrowBack className="text-xl" />
              Kembali
            </PrimaryButton>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <MdInfoOutline className="text-6xl text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-on-surface mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-on-surface-variant max-w-md mb-8">{error}</p>
        <PrimaryButton
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-8 py-3 shadow-sm"
        >
          <MdArrowBack className="text-xl" />
          Kembali
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 min-h-screen">
        {/* ── Success Banner for Email Sent ── */}
        {emailSent && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <MdCheckCircle className="text-emerald-500 mt-0.5 text-xl shrink-0" />
            <div>
              <h3 className="text-emerald-900 font-bold mb-1">Berhasil!</h3>
              <p className="text-sm text-emerald-800">
                Bukti pengajuan donasi beserta ID Pelacakan telah dikirim ke email Anda.
              </p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 group transition-colors"
          >
            <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter italic">
              Status Resi: {resi}
            </h1>
            {isVisitBound && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0">
                <MdPeopleAlt className="text-sm" />
                Barang Bawaan Kunjungan
              </span>
            )}
          </div>
        </div>

        {/* ── Delivery Timeline Stepper — hidden for visit-bound donations ── */}
        {!isVisitBound && (
          <div className="mb-20">
            <div className="relative flex items-center justify-between max-w-5xl mx-auto">
              {/* Background Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-surface-container-high z-0" />
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-500 z-0 transition-all duration-1000 ${status === "SUCCESS" ? "w-full" : "w-0"}`}
              />

              {steps.map((step, idx) => {
                const isActive = step.status === "active";
                const isPending = step.status === "pending";

                return (
                  <div
                    key={idx}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`
                      w-14 h-14 rounded-full flex items-center justify-center ring-[10px] ring-surface transition-all duration-500
                      ${isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110" : ""}
                      ${isPending ? "bg-surface-container-highest text-on-surface-variant" : ""}
                    `}
                    >
                      <span className="text-xl">{step.icon}</span>
                    </div>
                    <span
                      className={`mt-5 font-public-sans text-[11px] font-black uppercase tracking-[0.2em] text-center ${isActive ? "text-emerald-600" : "text-on-surface-variant"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Visit-Bound Context Banner — replaces timeline for in-person donations ── */}
        {isVisitBound && (
          <div className="max-w-5xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 rounded-2xl bg-blue-50 flex items-start gap-4">
              <MdCalendarMonth className="text-blue-500 mt-1 shrink-0 text-2xl" />
              <div>
                <h3 className="text-blue-900 font-bold mb-2">
                  Informasi: Barang Bawaan Kunjungan
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Daftar barang ini adalah rincian bawaan untuk jadwal kunjungan
                  Anda. Penerimaan barang akan divalidasi langsung oleh pengurus
                  saat Anda tiba di panti. Silakan pantau status persetujuan
                  kunjungan Anda melalui tautan yang dikirimkan ke email.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Expiry Warning Banner — standalone public donations only ── */}
        {!isVisitBound &&
          status === "PENDING_DELIVERY" &&
          donationData?.expires_at && (
            <div className="max-w-5xl mx-auto mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
              {isExpired ? (
                <div className="p-6 rounded-2xl bg-red-50 flex items-start gap-4">
                  <MdTimer className="text-red-500 mt-1 shrink-0 text-xl" />
                  <div>
                    <h3 className="text-red-900 font-bold mb-2">
                      Resi Telah Kedaluwarsa
                    </h3>
                    <p className="text-sm text-red-800 leading-relaxed">
                      Batas waktu 30 jam untuk penyerahan barang telah berakhir.
                      Reservasi kapasitas gudang telah dibatalkan secara
                      otomatis. Silakan ajukan donasi baru jika Anda masih ingin
                      menyumbangkan barang.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50 flex items-start gap-4">
                  <MdTimer className="text-amber-500 mt-1 shrink-0 text-xl" />
                  <div>
                    <h3 className="text-amber-900 font-bold mb-2">
                      Batas Waktu Penyerahan
                    </h3>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Resi donasi ini akan kedaluwarsa pada{" "}
                      <span className="font-bold">
                        {new Date(donationData.expires_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                      . Silakan serahkan barang ke panti sebelum batas waktu.
                    </p>
                    {countdown && (
                      <p className="mt-2 text-xs font-bold text-amber-700 tracking-wider uppercase">
                        Sisa waktu: {countdown}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* ── Transparency & Handover Banner ── */}
        {status === "SUCCESS" && (
          <div className="max-w-5xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
              <FiInfo className="text-emerald-500 mt-1 shrink-0 text-xl" />
              <div>
                <h3 className="text-emerald-900 font-bold mb-2">
                  Amanah Telah Disalurkan
                </h3>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  Barang donasi Anda telah divalidasi dan secara resmi tercatat
                  dalam inventaris Panti Asuhan. Seluruh barang kini sepenuhnya
                  dikelola oleh pihak panti untuk memenuhi kebutuhan harian
                  anak-anak. Terima kasih atas kepedulian Anda.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Layout Grid (1 or 2 Columns) ── */}
        <div className={`grid grid-cols-1 ${slideshowImages.length > 0 ? "lg:grid-cols-2 gap-12 lg:gap-20" : "max-w-3xl mx-auto"} items-stretch`}>
          {/* LEFT COLUMN: Dokumentasi Donatur */}
          {slideshowImages.length > 0 && (
            <div className="relative group flex flex-col">
            <div className="aspect-square w-full relative rounded-2xl overflow-hidden bg-surface-container-low shadow-sm transition-all duration-700">
              {/* Slideshow Images */}
              {slideshowImages.map((src, index) => {
                const isActive = index === currentImageIndex;
                return (
                  <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Dokumentasi Barang ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://placehold.co/1200x1200/f7f3ef/4c92c9?text=Dokumentasi+Barang")
                      }
                    />
                  </div>
                );
              })}

              {/* Gradient Overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-20 pointer-events-none" />

              {/* Top-Left Label (Glassmorphism) */}
              <div className="absolute top-4 left-4 z-30">
                <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border-none shadow-sm">
                  <span className="block font-public-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                    Dokumentasi Donatur
                  </span>
                </div>
              </div>

              {/* Bottom Dots Indicator */}
              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-2">
                {slideshowImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === currentImageIndex
                        ? "w-8 bg-white shadow-sm"
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            </div>
          )}

          {/* RIGHT COLUMN: Rincian & Aksi */}
          <div className="flex flex-col">
            <span className="block font-public-sans text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant mb-6">
              Rincian Barang
            </span>

            <GlassContainer className="p-6 md:p-8 border-none shadow-ambient bg-surface-container-lowest flex-1 relative overflow-hidden flex flex-col">
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-surface-container-high [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-on-surface-variant/30 transition-all space-y-2">
                  {donationData?.item_donations?.map((item: any) => {
                    const isExpanded = expandedItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="border-b border-gray-100 last:border-none pb-4 mb-4 last:mb-0 last:pb-0"
                      >
                        {/* Header */}
                        <button
                          onClick={() =>
                            setExpandedItemId(isExpanded ? null : item.id)
                          }
                          className="w-full flex items-center justify-between text-left group"
                        >
                          <div className="flex flex-col pr-4">
                            <span className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm md:text-base">
                              {item.item_name || item.itemName_snapshot}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs md:text-sm font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                              {item.qty} {item.unit || "Pcs"}
                            </span>
                            {isExpanded ? (
                              <MdExpandLess className="text-xl text-primary" />
                            ) : (
                              <MdExpandMore className="text-xl text-on-surface-variant group-hover:text-primary transition-colors" />
                            )}
                          </div>
                        </button>

                        {/* Body (Expanded Content) */}
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100 mt-5"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-5">
                              <div className="space-y-1">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                                  Status Barang
                                </span>
                                <p className="font-bold text-on-surface text-xs md:text-sm">
                                  {status === "SUCCESS"
                                    ? "Diterima"
                                    : "Menunggu Check-in"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 pointer-events-none" />
            </GlassContainer>

            {/* Info Box: context-aware — courier note for public, visit note for visit-bound */}
            {isVisitBound ? (
              <div className="mt-8 p-6 rounded-2xl bg-blue-50 flex items-start gap-4">
                <MdPeopleAlt className="text-blue-500 mt-1 shrink-0 text-lg" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">
                    Catatan Kunjungan
                  </span>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Barang ini akan diterima dan divalidasi secara langsung oleh
                    pengurus saat Anda tiba di panti sesuai jadwal kunjungan
                    yang disetujui. Tidak diperlukan pengiriman via kurir.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-6 rounded-2xl bg-surface-container-low flex items-start gap-4">
                <MdInfoOutline className="text-primary mt-1 shrink-0 text-lg" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                    Catatan Pengiriman
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Paket saat ini sedang dalam tahap pengiriman ke logistik.
                    Harap pastikan nomor resi terlihat jelas pada kemasan luar.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-auto pt-12 flex flex-col md:flex-row items-center justify-end gap-6">
              <Link
                href="/kontak"
                className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-container transition-colors tracking-widest uppercase"
              >
                <MdChat className="text-lg" />
                <span>Hubungi Petugas</span>
              </Link>
              <PrimaryButton
                onClick={handleCopyResi}
                className="flex items-center gap-3 px-8 py-4 rounded-xl shadow-ambient hover:shadow-lg transition-all w-full md:w-auto justify-center"
              >
                <MdContentCopy
                  className={`text-lg ${copied ? "text-tertiary" : ""}`}
                />
                <span>{copied ? "Tersalin" : "Salin Nomor Resi"}</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
