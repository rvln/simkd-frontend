"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { FiCheckCircle, FiDownload, FiLoader, FiAlertCircle, FiClock, FiRefreshCw, FiCreditCard } from "react-icons/fi";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GlassContainer } from "@/components/ui/GlassContainer";

interface InvoiceData {
  id: string;
  tracking_code: string;
  amount: string;
  payment_type: string;
  payment_status: string;
  status_label: string;
  created_at: string;
  donorName: string;
  donorEmail: string | null;
  donorPhone: string | null;
  snap_token: string | null;
}

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/donations/${id}/invoice?_t=${Date.now()}`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Faktur tidak ditemukan.");
      }

      const result = await res.json();
      setData(result.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Auto-refresh every 5s while payment is still PENDING.
  // Stops automatically once status becomes SUCCESS/FAILED/EXPIRED.
  // This handles the case where the Midtrans webhook arrives after the page loads.
  useEffect(() => {
    if (!data) return;
    if (data.payment_status !== "PENDING") return;

    const interval = setInterval(() => {
      fetchInvoice(true); // silent = no full-page loader
    }, 5000);

    return () => clearInterval(interval);
  }, [data, fetchInvoice]);

  const handleDownload = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/public/donations/${id}/invoice/download`;
  };

  const handlePayNow = () => {
    if (data?.snap_token && typeof window.snap !== "undefined") {
      window.snap.pay(data.snap_token);
    } else {
      alert("Sistem pembayaran belum siap atau token tidak valid. Silakan muat ulang halaman.");
    }
  };

  /* Loading */
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4 text-on-surface-variant">
          <FiLoader className="w-8 h-8 animate-spin text-primary" />
          <p className="font-sans text-sm font-medium">Memuat data faktur...</p>
        </div>
      </div>
    );
  }

  /* Error */
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface px-6">
        <GlassContainer className="p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-5">
            <FiAlertCircle className="w-7 h-7 text-error" />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Faktur Tidak Ditemukan</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block w-full py-3 px-6 rounded-xl bg-primary text-white font-bold text-sm text-center hover:bg-primary/90 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </GlassContainer>
      </div>
    );
  }

  if (!data) return null;

  const isPending = data.payment_status === "PENDING";
  const isSuccess = data.payment_status === "SUCCESS";

  return (
    <div className="bg-surface min-h-screen py-16 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <GlassContainer className="p-0 overflow-hidden shadow-ambient border-none bg-surface-container-lowest">

          {/* Header */}
          <div className={`p-10 text-white text-center ${isSuccess ? "bg-gradient-to-br from-primary to-primary-container" : "bg-gradient-to-br from-tertiary/80 to-tertiary"}`}>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6">
              {isSuccess ? <FiCheckCircle className="w-8 h-8 text-white" /> : <FiClock className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {isSuccess ? "Terima Kasih!" : "Pembayaran Dibuat"}
            </h1>
            <p className="text-white/80 font-medium">
              {isSuccess
                ? "Donasi finansial Anda telah berhasil kami terima."
                : "Instruksi pembayaran telah dibuat. Selesaikan transfer untuk melengkapi donasi Anda."}
            </p>
          </div>

          {/* Status Badge */}
          <div className="px-10 pt-6 flex items-center justify-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${isSuccess ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              {isSuccess ? <FiCheckCircle className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
              {data.status_label}
            </span>
            {/* Auto-refresh indicator while pending */}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 text-on-surface-variant/60 text-xs">
                <FiRefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Memperbarui..." : "Memperbarui otomatis"}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/15 pb-6">
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  {isSuccess ? "Kode Resi Donasi" : "Order ID"}
                </span>
                <span className="font-mono text-lg text-on-surface font-semibold">{data.tracking_code}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <span className="block text-xs font-medium text-on-surface-variant mb-1">Tanggal Transaksi</span>
                <span className="block text-on-surface font-semibold">{new Date(data.created_at).toLocaleString("id-ID")}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-on-surface-variant mb-1">Metode Pembayaran</span>
                <span className="block text-on-surface font-semibold capitalize">{data.payment_type?.replace(/_/g, " ") || "Online Payment"}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-on-surface-variant mb-1">Nama Donatur</span>
                <span className="block text-on-surface font-semibold">{data.donorName}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-on-surface-variant mb-1">Kontak Donatur</span>
                <span className="block text-on-surface font-semibold">{data.donorEmail || data.donorPhone || "-"}</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-6 mt-8 flex items-center justify-between">
              <span className="font-bold text-on-surface-variant">Total Donasi</span>
              <span className="text-2xl font-black text-primary">Rp {parseInt(data.amount).toLocaleString("id-ID")}</span>
            </div>

            {/* Info banner for PENDING (Bank Transfer / VA) */}
            {isPending && (
              <div className="bg-warning/8 rounded-2xl p-5 flex gap-4 items-start">
                <FiClock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface text-sm mb-1">Selesaikan Pembayaran Anda</p>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Jika menggunakan Virtual Account atau Bank Transfer, silakan selesaikan transfer melalui aplikasi bank Anda. Halaman ini akan otomatis berubah setelah pembayaran dikonfirmasi.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-10 pt-0 flex flex-col gap-3">
            {isSuccess && (
              <PrimaryButton
                className="w-full py-4 text-base font-bold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all"
                onClick={handleDownload}
              >
                <FiDownload className="text-xl" />
                Unduh PDF Bukti Transfer
              </PrimaryButton>
            )}
            {isPending && (
              <>
                <PrimaryButton
                  onClick={handlePayNow}
                  className="w-full py-4 text-base font-bold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  <FiCreditCard className="text-xl" />
                  Pilih Metode Pembayaran
                </PrimaryButton>
                <button
                  onClick={() => fetchInvoice(false)}
                  className="w-full py-3 px-6 rounded-xl bg-surface-container text-on-surface font-medium text-sm flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Cek Status Sekarang
                </button>
              </>
            )}
            <Link href="/" className="w-full py-3 px-6 rounded-xl text-on-surface-variant font-medium text-sm text-center hover:bg-surface-container transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </GlassContainer>
      </div>
      
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  );
}