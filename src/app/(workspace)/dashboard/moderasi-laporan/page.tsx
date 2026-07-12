"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiFileText,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiAlertTriangle,
  FiCalendar,
} from "react-icons/fi";
import { AlertModal } from "@/components/ui/AlertModal";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_BASE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

interface ReportItem {
  id: string;
  visitor: string;
  content: string;
  image_path: string[] | null;
  status: string;
  admin_notes: string | null;
  admin_title: string | null;
  visit_date: string | null;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 animate-pulse shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-200 rounded-full" />
      </div>
      <div className="h-3 w-full bg-slate-100 rounded mb-2" />
      <div className="h-3 w-3/4 bg-slate-100 rounded mb-4" />
      <div className="h-32 w-full bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: "bg-amber-100", text: "text-amber-700", label: "MENUNGGU" },
    PUBLISHED: { bg: "bg-green-100", text: "text-green-700", label: "DIPUBLIKASI" },
    REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "DITOLAK" },
  };
  const c = config[status] ?? config.PENDING;
  return (
    <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ─── Moderation Modal ─────────────────────────────────────────────────────────
function ModerationModal({
  report,
  action,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  report: ReportItem;
  action: "PUBLISHED" | "REJECTED";
  onClose: () => void;
  onConfirm: (notes: string, title: string) => void;
  isSubmitting: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const isApprove = action === "PUBLISHED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isApprove ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          >
            {isApprove ? <FiCheck className="text-2xl" /> : <FiX className="text-2xl" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isApprove ? "Publikasi Laporan" : "Tolak Laporan"}
            </h3>
            <p className="text-sm text-gray-500">
              Dari: {report.visitor}
            </p>
          </div>
        </div>

        <div className="mb-6 bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
            {report.content}
          </p>
        </div>

        {/* Admin Title — only shown when publishing */}
        {isApprove && (
          <div className="mb-4">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Judul Dokumentasi
              <span className="ml-1 font-normal normal-case tracking-normal text-gray-400">(opsional — ditampilkan di halaman utama)</span>
            </label>
            <input
              type="text"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis: Kelas Menggambar Bersama Relawan"
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm border border-gray-100 text-sm"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
            Catatan Admin {!isApprove && "(Wajib)"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isApprove
                ? "Catatan opsional untuk referensi internal..."
                : "Alasan penolakan (akan dicatat untuk audit trail)..."
            }
            rows={3}
            className="w-full px-4 py-3 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm border border-gray-100 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(notes, title)}
            disabled={isSubmitting || (!isApprove && !notes.trim())}
            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isApprove ? (
              "Publikasi"
            ) : (
              "Tolak"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ModerasiLaporanPage() {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);

  const [modalReport, setModalReport] = useState<ReportItem | null>(null);
  const [modalAction, setModalAction] = useState<"PUBLISHED" | "REJECTED">("PUBLISHED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", String(page));
      params.append("per_page", "12");

      const res = await fetch(`${API_BASE}/api/admin/visit-reports?${params.toString()}`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();
      setReports(json.data ?? []);
      setMeta(json.meta ?? null);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Gagal memuat data.");
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter, page]);

  useEffect(() => {
    if (token) fetchReports();
  }, [fetchReports, token]);

  // ── Moderate ───────────────────────────────────────────────────────────────
  const handleModerate = async (notes: string, adminTitle: string) => {
    if (!modalReport) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/visit-reports/${modalReport.id}/moderate`, {
        method: "PATCH",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          status: modalAction,
          admin_notes: notes || null,
          admin_title: adminTitle.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? `Error ${res.status}`);
      }

      setModalReport(null);
      fetchReports();
    } catch (err: unknown) {
      setAlertMessage(err instanceof Error ? err.message : "Gagal memoderasi laporan.");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (report: ReportItem, action: "PUBLISHED" | "REJECTED") => {
    setModalReport(report);
    setModalAction(action);
  };

  const filterTabs = [
    { label: "Menunggu", value: "PENDING" },
    { label: "Dipublikasi", value: "PUBLISHED" },
    { label: "Ditolak", value: "REJECTED" },
    { label: "Semua", value: "" },
  ];

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Moderasi Laporan Kunjungan
        </h1>
        <p className="text-gray-500 text-lg">
          Tinjau dan moderasi laporan pengunjung sebelum dipublikasikan ke halaman transparansi.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-white/60 backdrop-blur-md p-1.5 rounded-full shadow-sm w-fit mb-8">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-none ${
              statusFilter === tab.value
                ? "bg-teal-700 text-white shadow-md"
                : "bg-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
          <FiAlertTriangle className="text-lg flex-shrink-0" />
          <span className="flex-1">{fetchError}</span>
          <button
            onClick={fetchReports}
            className="flex items-center gap-1.5 text-amber-700 font-bold hover:text-amber-900"
          >
            <FiRefreshCw className="text-base" /> Coba lagi
          </button>
        </div>
      )}

      {/* Report Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : reports.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <FiFileText className="text-5xl mb-4" />
            <p className="text-base font-medium">
              Tidak ada laporan untuk status ini.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                    <FiFileText className="text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {report.visitor}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FiCalendar className="text-[10px]" />
                      {report.visit_date
                        ? new Date(report.visit_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>

              {/* Content */}
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {report.content}
              </p>

              {/* Images */}
              {report.image_path && report.image_path.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {report.image_path.map((path, idx) => (
                    <img
                      key={idx}
                      src={`${STORAGE_BASE}/${path}`}
                      alt={`Foto laporan ${idx + 1}`}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                    />
                  ))}
                </div>
              )}

              {/* Admin Title badge — shown if set */}
              {report.admin_title && (
                <div className="bg-teal-50 rounded-xl px-4 py-2 mb-4 flex items-center gap-2">
                  <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">Judul</span>
                  <span className="text-xs text-teal-800 font-semibold">{report.admin_title}</span>
                </div>
              )}

              {/* Admin Notes */}
              {report.admin_notes && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Catatan Admin
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {report.admin_notes}
                  </p>
                </div>
              )}

              {/* Actions — only for PENDING reports */}
              {report.status === "PENDING" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => openModal(report, "PUBLISHED")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors"
                  >
                    <FiCheck className="text-sm" /> Publikasi
                  </button>
                  <button
                    onClick={() => openModal(report, "REJECTED")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <FiX className="text-sm" /> Tolak
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            disabled={meta.current_page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2.5 rounded-xl bg-white text-gray-500 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          <span className="text-xs font-bold text-gray-500 tracking-wider">
            {meta.current_page} / {meta.last_page}
          </span>
          <button
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="p-2.5 rounded-xl bg-white text-gray-500 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <FiChevronRight className="text-lg" />
          </button>
        </div>
      )}

      {/* Moderation Modal */}
      {modalReport && (
        <ModerationModal
          report={modalReport}
          action={modalAction}
          onClose={() => setModalReport(null)}
          onConfirm={handleModerate}
          isSubmitting={isSubmitting}
        />
      )}
        </div>
      </div>
    </div>
  );
}
