"use client";

import React, { useState } from "react";
import { FiImage, FiLoader, FiAlertCircle, FiLink } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import { MdTimer } from "react-icons/md";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export type DonationType = "BARANG" | "DANA";

export interface ItemDonationData {
  id: string;
  itemName_snapshot: string;
  qty: number;
  inventory_id: string;
  unit?: string;
  photo_url?: string;
}

export interface ValidasiData {
  id: string;
  resi: string;
  name: string;
  type: DonationType;
  donor: string;
  timeInfo: string;
  statusBadge: string;
  category?: string;
  condition?: string;
  quantity?: string;
  amount?: string;
  imageUrl?: string;
  item_donations?: ItemDonationData[];
  status: string;
  expires_at?: string;
  visit_id?: string;
  payment_channel?: string;
  payment_proof?: string | null;
}

interface ValidasiContentProps {
  data: ValidasiData;
  /** Token for authenticated API calls */
  token: string | null;
  /** Called on successful approve OR reject so parent can refresh its list */
  onSuccess: () => void;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * ValidasiContent — Detail + validation panel for a single PENDING_DELIVERY donation.
 *
 * Wires:
 *   "Validasi & Masukkan Inventaris" → POST /api/validasi-donasi/{id}/approve
 *   "Tolak Donasi"                   → POST /api/validasi-donasi/{id}/reject { reason }
 *
 * isSubmitting and rejection textarea state are local — they are transient UI state
 * that does not need to live in the parent.
 */
export function ValidasiContent({
  data,
  token,
  onSuccess,
  onClose,
}: ValidasiContentProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/validasi-donasi/${data.id}/approve`,
        {
          method: "POST",
          credentials: 'include',
          headers: authHeaders,
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setApiError("Mohon isi alasan penolakan terlebih dahulu!");
      return;
    }
    setIsSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/api/validasi-donasi/${data.id}/reject`, {
        method: "POST",
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ reason: rejectReason }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualApprove = async () => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/donations/${data.id}/approve`,
        {
          method: "PATCH",
          credentials: 'include',
          headers: authHeaders,
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualReject = async () => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/donations/${data.id}/reject`, {
        method: "PATCH",
        credentials: 'include',
        headers: authHeaders,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBarang = data.type === "BARANG";
  const isManualFinancial = !isBarang && data.payment_channel === "MANUAL";
  const isManualPending =
    data.status === "PENDING" && data.payment_channel === "MANUAL";

  const isExpired =
    data.status === "PENDING_DELIVERY" &&
    !!data.expires_at &&
    new Date(data.expires_at) < new Date();

  return (
    <>
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Inline API error */}
        {apiError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <FiAlertCircle className="text-lg flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Visit-Bound Context Notice */}
        {data.visit_id && (
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
            <FiLink className="text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-800 text-xs mb-0.5">
                📌 Donasi Terikat Kunjungan
              </p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Barang ini merupakan bawaan dari jadwal kunjungan. Kedatangan
                fisik barang mengikuti jadwal sesi kunjungan
                {data.expires_at && (
                  <>
                    {" "}
                    pada{" "}
                    <strong>
                      {format(new Date(data.expires_at), "eeee, dd MMMM yyyy", {
                        locale: idLocale,
                      })}
                    </strong>
                  </>
                )}
                .
              </p>
            </div>
          </div>
        )}

        {/* Photo Evidence Button (Hanya untuk Donasi Dana) */}
        {!isBarang && (
          data.payment_proof || data.imageUrl ? (
            <a
              href={
                data.payment_proof
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL ?? API_BASE}/storage/${data.payment_proof}`
                  : data.imageUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 border-none transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FiImage className="text-lg" /> Lihat Bukti Full
            </a>
          ) : (
            <div className="w-full py-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
              <FiImage className="text-3xl mb-2" />
              <span className="text-sm font-medium">Tidak ada foto</span>
            </div>
          )
        )}

        {/* Basic Info */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Nomor Resi
          </p>
          <p className="text-base font-bold text-gray-900 mb-4">{data.resi}</p>

          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Donatur
          </p>
          <p className="text-base font-bold text-gray-900 mb-4">{data.donor}</p>

          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Ringkasan Donasi
          </p>
          <p className="text-base font-bold text-gray-900">{data.name}</p>
          {data.category && (
            <p className="text-sm text-teal-700 font-medium mt-1">
              Kategori: {data.category}
            </p>
          )}
        </div>

        {/* Conditional block */}
        {isBarang ? (
          <>
            <div className="bg-slate-50 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Kondisi</span>
                <span className="text-sm font-bold text-green-600">
                  {data.condition}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-1">Daftar Barang:</div>
              <div className="flex flex-col gap-2">
                {data.item_donations && data.item_donations.length > 0 ? (
                  data.item_donations.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">
                          {item.itemName_snapshot}
                        </span>
                        <span className="text-sm font-bold text-teal-700">
                          {item.qty} {item.unit ?? ""}
                        </span>
                      </div>
                      {item.photo_url && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${item.photo_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline self-start bg-primary/5 px-2 py-1 rounded-lg"
                        >
                          <FiImage /> Lihat Foto Barang
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-sm font-semibold text-gray-800">
                      {data.name}
                    </span>
                    <span className="text-sm font-bold text-teal-700">
                      {data.quantity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isRejecting && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-bold text-red-500 tracking-wider uppercase mb-2">
                  Alasan Penolakan (Wajib Diisi)
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan (misal: barang rusak, tidak sesuai kebutuhan)..."
                  disabled={isSubmitting}
                  className="w-full bg-red-50/50 border border-red-100 shadow-inner rounded-xl p-4 text-sm text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all resize-none h-28 disabled:opacity-60"
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-800 font-medium">
                Nominal Transfer
              </span>
              <span className="text-lg font-bold text-green-700">
                {data.amount}
              </span>
            </div>
            {isManualFinancial && (
              <div className="flex justify-between items-center border-t border-green-200/50 pt-3">
                <span className="text-sm text-green-800 font-medium">
                  Metode
                </span>
                <span className="text-sm font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase">
                  MANUAL TRANSFER
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="p-6 flex flex-col gap-3 bg-white border-t border-gray-50/50 mt-auto">
        {/* Render for pending Item Donations OR pending Manual Financial Donations */}
        {data.status !== "PENDING_DELIVERY" && !isManualPending ? (
          (() => {
            const stateConfig: Record<
              string,
              { bg: string; icon: string; text: string; message: string }
            > = {
              SUCCESS: {
                bg: "bg-emerald-50 border-emerald-200",
                icon: "text-emerald-500",
                text: "text-emerald-700",
                message: "Donasi telah divalidasi",
              },
              REJECTED: {
                bg: "bg-red-50 border-red-200",
                icon: "text-red-500",
                text: "text-red-700",
                message: "Donasi ditolak",
              },
              FAILED: {
                bg: "bg-red-50 border-red-200",
                icon: "text-red-500",
                text: "text-red-700",
                message: "Transaksi gagal",
              },
              EXPIRED: {
                bg: "bg-slate-50 border-slate-200",
                icon: "text-slate-500",
                text: "text-slate-700",
                message: "Sesi kedaluwarsa",
              },
              PENDING: {
                bg: "bg-amber-50 border-amber-200",
                icon: "text-amber-500",
                text: "text-amber-700",
                message:
                  !isBarang && data.payment_channel === "MIDTRANS"
                    ? "Menunggu pembayaran"
                    : "Menunggu validasi",
              },
              CANCELLED: {
                bg: "bg-red-50 border-red-200",
                icon: "text-red-500",
                text: "text-red-700",
                message: "Transaksi dibatalkan",
              },
            };
            const config = stateConfig[data.status] || {
              bg: "bg-slate-50 border-slate-200",
              icon: "text-slate-500",
              text: "text-slate-700",
              message: `Status: ${data.status}`,
            };
            return (
              <div
                className={`w-full py-4 px-6 border rounded-xl flex items-center justify-center gap-3 ${config.bg}`}
              >
                <FiAlertCircle className={`text-xl ${config.icon}`} />
                <span className={`font-bold ${config.text}`}>
                  {config.message}
                </span>
              </div>
            );
          })()
        ) : isExpired ? (
          /* ── Expired TTL: Hide all action buttons, show warning ── */
          <div className="w-full py-5 px-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4">
            <MdTimer className="text-red-400 text-2xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 text-sm mb-1">
                Slot Donasi Kedaluwarsa
              </p>
              <p className="text-xs text-red-600 leading-relaxed">
                Barang tersebut telah melewati batas waktu serah terima dan slot
                donasi telah dibatalkan oleh sistem. Donatur perlu mengajukan
                resi donasi baru jika masih ingin menyumbangkan barang.
              </p>
            </div>
          </div>
        ) : isBarang ? (
          <>
            {!isRejecting && (
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-teal-700 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(15,118,110,0.2)] hover:shadow-[0_6px_24px_rgba(15,118,110,0.3)] hover:-translate-y-0.5 border-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting && !isRejecting ? (
                  <>
                    <FiLoader className="animate-spin" /> Memproses...
                  </>
                ) : (
                  "Validasi & Masukkan Inventaris"
                )}
              </button>
            )}

            <button
              onClick={() => {
                if (!isRejecting) {
                  setIsRejecting(true);
                  setApiError(null);
                } else {
                  handleReject();
                }
              }}
              disabled={isSubmitting}
              className={`w-full py-3.5 font-bold rounded-xl transition-all border-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isRejecting
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:-translate-y-0.5"
                  : "text-red-600 bg-transparent hover:bg-red-50"
              }`}
            >
              {isSubmitting && isRejecting ? (
                <>
                  <FiLoader className="animate-spin" /> Mencatat Log...
                </>
              ) : isRejecting ? (
                "Konfirmasi Tolak & Catat Log"
              ) : (
                "Tolak Donasi"
              )}
            </button>

            {isRejecting && (
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setRejectReason("");
                  setApiError(null);
                }}
                disabled={isSubmitting}
                className="w-full py-3 text-gray-500 font-bold bg-transparent hover:bg-gray-100 rounded-xl transition-colors border-none disabled:opacity-50"
              >
                Batal
              </button>
            )}
          </>
        ) : isManualPending ? (
          <>
            <div className="flex gap-3">
              <button
                onClick={handleManualApprove}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-teal-700 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(15,118,110,0.2)] hover:shadow-[0_6px_24px_rgba(15,118,110,0.3)] hover:-translate-y-0.5 border-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  "Setujui"
                )}
              </button>
              <button
                onClick={handleManualReject}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 border-none transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <FiLoader className="animate-spin" /> : "Tolak"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
