"use client";

import React, { useState } from "react";
import {
  FiDownload,
  FiEye,
  FiCalendar,
  FiFilter,
  FiFileText,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { GlassContainer } from "@/components/ui/GlassContainer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ReportType = "all" | "donation" | "visit" | "distribution";

interface DanaStats {
  total: number;
  total_success_amount: number;
  count_by_status: Record<string, number>;
}

interface BarangStats {
  total: number;
  count_by_status: Record<string, number>;
}

interface VisitStats {
  total: number;
  count_by_status: Record<string, number>;
}

interface DistributionRecord {
  item_name: string;
  unit: string;
  qty: number;
  target_recipient: string;
  notes: string;
  distributed_by: string;
  distributed_at: string;
}

interface DistributionStats {
  total: number;
  records: DistributionRecord[];
}

interface ReportData {
  period: { start: string; end: string };
  generated_at: string;
  donations: { dana: DanaStats; barang: BarangStats } | null;
  visits: VisitStats | null;
  distributions: DistributionStats | null;
}

const STATUS_LABELS_DANA: Record<string, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Menunggu",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
};

const STATUS_LABELS_BARANG: Record<string, string> = {
  SUCCESS: "Diterima / Check-in",
  PENDING_DELIVERY: "Menunggu Pengiriman",
  REJECTED: "Ditolak",
};

const STATUS_LABELS_VISIT: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  NEEDS_RESCHEDULE: "Perlu Jadwal Ulang",
  COMPLETED: "Berhasil",
  NO_SHOW: "Tidak Hadir",
};

const BADGE_COLORS: Record<string, string> = {
  SUCCESS: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  APPROVED: "bg-teal-100 text-teal-800",
  PENDING: "bg-amber-100 text-amber-800",
  PENDING_DELIVERY: "bg-amber-100 text-amber-800",
  NEEDS_RESCHEDULE: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-600",
  NO_SHOW: "bg-red-100 text-red-800",
};

export default function LaporanPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [type, setType] = useState<ReportType>("all");
  const [previewData, setPreviewData] = useState<ReportData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const buildParams = (isExport = false) => {
    const p = new URLSearchParams();
    if (startDate) p.append("start_date", startDate);
    if (endDate) p.append("end_date", endDate);
    if (type !== "all") p.append("type", type);
    if (isExport) p.append("export", "1");
    return p.toString();
  };

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    };
  };

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    setErrorMsg(null);
    setPreviewData(null);
    try {
      const res = await fetch(`${API_BASE}/api/reports?${buildParams(false)}`, {
        headers: getHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Gagal memuat pratinjau laporan.");
      }
      const json = await res.json();
      setPreviewData(json.data);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExport = async () => {
    setIsLoadingExport(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/reports?${buildParams(true)}`, {
        headers: getHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message ?? "Gagal mengunduh laporan.",
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const month = startDate.slice(0, 7);
      
      const typeMap: Record<string, string> = {
        all: "semua-modul",
        donation: "donasi",
        visit: "kunjungan",
        distribution: "distribusi"
      };
      const typeStr = typeMap[type] || "semua-modul";
      a.download = `laporan-simdk-${typeStr}-${month}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : "Terjadi kesalahan saat mengunduh.",
      );
    } finally {
      setIsLoadingExport(false);
    }
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="flex-1 p-6 lg:p-10 pb-20 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full">
        {/* ── Header ── */}
        <header className="mb-10">
          <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-2 font-sans">
            Laporan Resmi
          </h1>
          <p className="text-on-surface-variant font-public-sans text-lg">
            Generate dan unduh laporan operasional dalam format PDF.
          </p>
        </header>

        {/* ── Filter Form ── */}
        <GlassContainer className="p-8 shadow-ambient mb-8">
          <h2 className="text-lg font-bold text-primary font-sans mb-6 flex items-center gap-2">
            <FiFilter className="text-xl" />
            Parameter Laporan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-public-sans">
                Tanggal Mulai
              </label>
              <div className="relative">
                <input
                  id="report-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-public-sans">
                Tanggal Akhir
              </label>
              <div className="relative">
                <input
                  id="report-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-public-sans">
                Modul Laporan
              </label>
              <select
                id="report-type"
                value={type}
                onChange={(e) => setType(e.target.value as ReportType)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">Semua Modul</option>
                <option value="donation">Donasi Saja</option>
                <option value="visit">Kunjungan Saja</option>
                <option value="distribution">Distribusi Saja</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              id="btn-preview-report"
              onClick={handlePreview}
              disabled={isLoadingPreview}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-sm font-sans hover:bg-surface-variant transition-colors disabled:opacity-50"
            >
              {isLoadingPreview ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiEye />
              )}
              Pratinjau Data
            </button>

            <button
              id="btn-export-pdf"
              onClick={handleExport}
              disabled={isLoadingExport}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm font-sans hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(13,148,136,0.3)]"
            >
              {isLoadingExport ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiDownload />
              )}
              Export PDF
            </button>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-800 text-sm font-sans">
              <FiAlertCircle className="text-lg flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </GlassContainer>

        {/* ── Preview Panel ── */}
        {previewData && (
          <div className="space-y-6">
            {/* Period Badge */}
            <div className="flex items-center gap-2 text-sm text-on-surface-variant font-public-sans">
              <FiCheckCircle className="text-emerald-500" />
              Data laporan untuk periode{" "}
              <strong>
                {previewData.period.start} – {previewData.period.end}
              </strong>
            </div>

            {/* Donasi Dana */}
            {previewData.donations && (
              <GlassContainer className="p-8 shadow-ambient">
                <h3 className="text-base font-bold text-primary font-sans mb-5 flex items-center gap-2">
                  <FiFileText />
                  Ringkasan Donasi Dana
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-public-sans">
                      Total Transaksi
                    </p>
                    <p className="text-3xl font-black text-primary font-sans">
                      {previewData.donations.dana.total}
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-public-sans">
                      Total Terkumpul
                    </p>
                    <p className="text-xl font-black text-emerald-600 font-sans">
                      {formatRupiah(
                        previewData.donations.dana.total_success_amount,
                      )}
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-public-sans">
                      Pengajuan Barang
                    </p>
                    <p className="text-3xl font-black text-primary font-sans">
                      {previewData.donations.barang.total}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(
                    previewData.donations.dana.count_by_status,
                  ).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between items-center py-2 border-b border-outline-variant/10"
                    >
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${BADGE_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {STATUS_LABELS_DANA[status] ?? status}
                      </span>
                      <span className="font-bold text-on-surface font-sans">
                        {count}
                      </span>
                    </div>
                  ))}
                  {Object.entries(
                    previewData.donations.barang.count_by_status,
                  ).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between items-center py-2 border-b border-outline-variant/10"
                    >
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${BADGE_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        Barang — {STATUS_LABELS_BARANG[status] ?? status}
                      </span>
                      <span className="font-bold text-on-surface font-sans">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassContainer>
            )}

            {/* Kunjungan */}
            {previewData.visits && (
              <GlassContainer className="p-8 shadow-ambient">
                <h3 className="text-base font-bold text-primary font-sans mb-5 flex items-center gap-2">
                  <FiFileText />
                  Ringkasan Kunjungan
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-public-sans">
                      Total
                    </p>
                    <p className="text-3xl font-black text-primary font-sans">
                      {previewData.visits.total}
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-public-sans">
                      Selesai
                    </p>
                    <p className="text-3xl font-black text-emerald-600 font-sans">
                      {previewData.visits.count_by_status["COMPLETED"] ?? 0}
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-public-sans">
                      Tidak Hadir
                    </p>
                    <p className="text-3xl font-black text-red-500 font-sans">
                      {previewData.visits.count_by_status["NO_SHOW"] ?? 0}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(previewData.visits.count_by_status).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center py-2 border-b border-outline-variant/10"
                      >
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${BADGE_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {STATUS_LABELS_VISIT[status] ?? status}
                        </span>
                        <span className="font-bold text-on-surface font-sans">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </GlassContainer>
            )}

            {/* Distribusi */}
            {previewData.distributions &&
              previewData.distributions.total > 0 && (
                <GlassContainer className="p-8 shadow-ambient">
                  <h3 className="text-base font-bold text-primary font-sans mb-5 flex items-center gap-2">
                    <FiFileText />
                    Riwayat Distribusi ({previewData.distributions.total}{" "}
                    catatan)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans">
                      <thead>
                        <tr className="border-b-2 border-primary/20">
                          <th className="text-left py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-public-sans">
                            Barang
                          </th>
                          <th className="text-center py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-public-sans">
                            Qty
                          </th>
                          <th className="text-left py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-public-sans">
                            Penerima
                          </th>
                          <th className="text-left py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-public-sans">
                            Oleh
                          </th>
                          <th className="text-left py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-public-sans">
                            Tanggal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.distributions.records.map((rec, i) => (
                          <tr
                            key={i}
                            className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                          >
                            <td className="py-3 px-2 font-semibold">
                              {rec.item_name}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {rec.qty} {rec.unit}
                            </td>
                            <td className="py-3 px-2">
                              {rec.target_recipient}
                            </td>
                            <td className="py-3 px-2 text-on-surface-variant">
                              {rec.distributed_by}
                            </td>
                            <td className="py-3 px-2 text-on-surface-variant text-xs">
                              {rec.distributed_at}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassContainer>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
