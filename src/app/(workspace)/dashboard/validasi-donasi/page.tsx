"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronRight,
  FiBox,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import { FaMoneyBillWave, FaClock } from "react-icons/fa";
import { GlobalDomainDrawer } from "@/components/workspace/GlobalDomainDrawer";
import { ValidasiData } from "@/components/workspace/drawer-contents/ValidasiContent";
import { useAuth } from "@/hooks/useAuth";

// ─── API constant ─────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ENDPOINT = `${API_BASE}/api/validasi-donasi`;

type DonationType = "BARANG" | "DANA";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center p-5 rounded-2xl bg-slate-50/70 animate-pulse gap-5">
      <div className="w-14 h-14 rounded-xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-3 bg-slate-200 rounded-full" />
        <div className="w-48 h-4 bg-slate-200 rounded-full" />
        <div className="w-36 h-3 bg-slate-100 rounded-full" />
      </div>
      <div className="w-24 h-6 bg-slate-200 rounded-full" />
    </div>
  );
}

// ─── Map raw API Donation → ValidasiData ─────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDonation(raw: any): ValidasiData {
  const itemsArray = raw.item_donations ?? raw.itemDonations ?? [];
  const firstItem = itemsArray[0];
  const isBarang = raw.type === "BARANG";

  let displayName = isBarang ? "Donasi Barang" : "Donasi Dana";
  if (isBarang && itemsArray.length > 0) {
    displayName = itemsArray[0].itemName_snapshot;
    if (itemsArray.length > 1) {
      displayName += ` + ${itemsArray.length - 1} Barang Lainnya`;
    }
  } else if (!isBarang && firstItem) {
    displayName = firstItem.itemName_snapshot ?? "Donasi Dana";
  }

  const mappedItems = itemsArray.map((item: any) => ({
    id: item.id,
    itemName_snapshot: item.itemName_snapshot,
    qty: item.qty,
    inventory_id: item.inventory_id,
    unit: item.inventory?.unit,
    photo_url: item.photo_url,
  }));

  return {
    id: raw.id,
    resi: raw.tracking_code ?? raw.id,
    name: displayName,
    type: raw.type as DonationType,
    donor: raw.donorName,
    timeInfo: new Date(raw.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    statusBadge: "MENUNGGU KEDATANGAN",
    category: firstItem?.inventory?.category ?? undefined,
    condition: "Baru", // Not stored in DB — physical check
    quantity: firstItem
      ? `${firstItem.qty} ${firstItem.inventory?.unit ?? ""}`.trim()
      : undefined,
    amount: raw.amount
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(raw.amount)
      : undefined,
    imageUrl: undefined, // No image URL in current schema
    item_donations: mappedItems,
    status: raw.status,
    expires_at: raw.expires_at ?? undefined,
    visit_id: raw.visit_id ?? undefined,
    payment_channel: raw.payment_channel,
    payment_proof: raw.payment_proof,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ValidasiDonasiPage() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const [items, setItems] = useState<ValidasiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DonationType>("BARANG");
  const [selectedDonation, setSelectedDonation] = useState<ValidasiData | null>(
    null,
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING_DELIVERY");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append("status", filterStatus);
      if (debouncedSearch) queryParams.append("search", debouncedSearch);
      if (filterDate) queryParams.append("date", filterDate);

      const res = await fetch(`${ENDPOINT}?${queryParams.toString()}`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();
      const raw: ValidasiData[] = (
        Array.isArray(json) ? json : (json.data ?? [])
      ).map(mapDonation);
      setItems(raw);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Gagal memuat data.");
      setItems(MOCK_FALLBACK);
    } finally {
      setIsLoading(false);
    }
  }, [token, filterStatus, debouncedSearch, filterDate]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelect = (item: ValidasiData) => {
    setSelectedDonation(item);
    setIsPanelOpen(true);
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedDonation(null), 500);
  };

  const handleSuccess = () => {
    fetchItems(); // Re-fetch list — removes processed item
  };

  const handleTabSwitch = (tab: DonationType) => {
    setActiveTab(tab);
    // Reset filter to each tab's default so backend receives a valid status value
    setFilterStatus(tab === "BARANG" ? "PENDING_DELIVERY" : "PENDING_MANUAL");
    handleClose();
  };

  const currentData = items.filter((donation) => {
    if (donation.type !== activeTab) return false;

    // 1. Calculate the dynamic expiry state
    const isExpired =
      donation.status === "PENDING_DELIVERY" &&
      !!donation.expires_at &&
      new Date(donation.expires_at) < new Date();

    // 2. Evaluate against the selected Dropdown Filter
    if (filterStatus === "ALL") return true;

    if (activeTab === "BARANG") {
      if (filterStatus === "EXPIRED") return isExpired;
      if (isExpired) return false;
      if (filterStatus === "PENDING_DELIVERY") return donation.status === "PENDING_DELIVERY";
      if (filterStatus === "SUCCESS") return donation.status === "SUCCESS";
      if (filterStatus === "REJECTED") return donation.status === "REJECTED";
    } else {
      // For DANA, do not display MIDTRANS PENDING in this admin view
      if (donation.status === "PENDING" && donation.payment_channel === "MIDTRANS") {
        return false;
      }
      if (filterStatus === "PENDING_MANUAL") return donation.status === "PENDING" && donation.payment_channel === "MANUAL";
      if (filterStatus === "SUCCESS") return donation.status === "SUCCESS";
      if (filterStatus === "REJECTED") return donation.status === "REJECTED";
      if (filterStatus === "EXPIRED_FAILED") return ["EXPIRED", "FAILED", "CANCELLED"].includes(donation.status);

      // Fallback if switching tabs before state updates
      if (filterStatus === "PENDING_DELIVERY") return donation.status === "PENDING" && donation.payment_channel === "MANUAL";
    }

    return true;
  });

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-8 overflow-y-auto ${
          isPanelOpen ? "pr-[470px]" : ""
        }`}
      >
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Validasi &amp; Check-in Barang
            </h1>
            <p className="text-gray-500 text-lg">
              Cocokkan kedatangan fisik barang atau pantau riwayat donasi
              finansial.
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              onClick={() => handleTabSwitch("BARANG")}
              className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "BARANG"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Validasi Donasi Barang
            </button>
            <button
              onClick={() => handleTabSwitch("DANA")}
              className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "DANA"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Riwayat Transaksi Dana
            </button>
          </div>

          {/* Filters */}
          <div className="bg-teal-50/30 backdrop-blur-md rounded-2xl p-4 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Nomor Resi, Nama Donatur, atau Nama Barang..."
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm border-none"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-6 py-3 bg-white rounded-xl text-gray-600 shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors border-none outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-6 py-3 pr-8 bg-teal-100/50 rounded-xl text-teal-700 text-sm font-medium border-none outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none cursor-pointer"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230f766e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                  backgroundPosition: "right 0.75rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1em 1em",
                }}
              >
                {activeTab === "BARANG" ? (
                  <>
                    <option value="PENDING_DELIVERY">Menunggu Kedatangan</option>
                    <option value="SUCCESS">Telah Divalidasi</option>
                    <option value="REJECTED">Ditolak</option>
                    <option value="EXPIRED">Kedaluwarsa</option>
                    <option value="ALL">Semua Status</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING_MANUAL">Menunggu Validasi</option>
                    <option value="SUCCESS">Telah Divalidasi</option>
                    <option value="REJECTED">Ditolak</option>
                    <option value="EXPIRED_FAILED">Kedaluwarsa/Gagal</option>
                    <option value="ALL">Semua Status</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Error Banner */}
          {fetchError && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
              <FiAlertTriangle className="text-lg flex-shrink-0" />
              <span className="flex-1">
                {fetchError} — Menampilkan data sementara.
              </span>
              <button
                onClick={fetchItems}
                className="flex items-center gap-1.5 text-amber-700 font-bold hover:text-amber-900"
              >
                <FiRefreshCw className="text-base" /> Coba lagi
              </button>
            </div>
          )}

          {/* List */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FiBox className="text-5xl mb-4" />
                <p className="text-base font-medium">
                  {activeTab === "BARANG"
                    ? "Tidak ada donasi barang yang menunggu validasi."
                    : "Tidak ada transaksi dana yang perlu ditampilkan."}
                </p>
              </div>
            ) : (
              currentData.map((item) => {
                const isSelected = selectedDonation?.id === item.id;
                const isBarang = item.type === "BARANG";
                const isExpired =
                  item.status === "PENDING_DELIVERY" &&
                  !!item.expires_at &&
                  new Date(item.expires_at) < new Date();

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`group flex flex-col sm:flex-row sm:items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "bg-white ring-2 ring-teal-600 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                        : "bg-slate-50/70 backdrop-blur-md border-none hover:bg-white hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex w-full sm:w-auto items-center mb-4 sm:mb-0">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 transition-colors flex-shrink-0 ${
                          isSelected
                            ? "bg-blue-100 text-blue-600"
                            : isExpired
                              ? "bg-red-50 text-red-400"
                              : isBarang
                                ? "bg-teal-50 text-teal-600"
                                : "bg-green-50 text-green-600"
                        }`}
                      >
                        {isBarang ? (
                          <FiBox className="text-2xl" />
                        ) : (
                          <FaMoneyBillWave className="text-2xl" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-[10px] font-bold tracking-wider text-teal-600 uppercase mb-1">
                          RESI: {item.resi}
                        </p>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center flex-wrap gap-2">
                          {item.name}
                          {!isBarang && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] uppercase rounded-md tracking-wider">
                              DANA
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600">
                              👤
                            </span>
                            {item.donor}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-gray-400 text-xs" />
                            {item.timeInfo}
                          </span>
                        </div>
                      </div>
                      <FiChevronRight
                        className={`sm:hidden ml-auto text-xl transition-transform duration-300 ${
                          isSelected
                            ? "text-teal-600 translate-x-1"
                            : "text-gray-300 group-hover:text-teal-400 group-hover:translate-x-1"
                        }`}
                      />
                    </div>

                    <div className="flex flex-col sm:items-end justify-center gap-2 w-full sm:w-auto sm:ml-auto">
                      <span
                        className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase w-fit ${
                          item.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : item.status === "REJECTED" || item.status === "FAILED" || item.status === "CANCELLED" || item.status === "EXPIRED" || isExpired
                              ? "bg-red-100 text-red-700"
                              : item.status === "PENDING" && item.payment_channel === "MIDTRANS"
                                ? "bg-amber-100 text-amber-700"
                                : item.status === "PENDING" && item.payment_channel === "MANUAL"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-200/60 text-gray-600"
                        }`}
                      >
                        {(() => {
                          if (item.status === "SUCCESS") return "TELAH DIVALIDASI";
                          if (item.status === "REJECTED") return "DITOLAK";
                          if (item.status === "FAILED" || item.status === "CANCELLED" || isExpired || item.status === "EXPIRED") return "KEDALUWARSA/GAGAL";
                          if (item.status === "PENDING" && item.payment_channel === "MIDTRANS") return "MENUNGGU PEMBAYARAN";
                          if (item.status === "PENDING" && item.payment_channel === "MANUAL") return "MENUNGGU VALIDASI";
                          return "MENUNGGU KEDATANGAN";
                        })()}
                      </span>
                      <FiChevronRight
                        className={`hidden sm:block text-xl transition-transform duration-300 ${
                          isSelected
                            ? "text-teal-600 translate-x-1"
                            : "text-gray-300 group-hover:text-teal-400 group-hover:translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* GlobalDomainDrawer */}
      {selectedDonation && (
        <GlobalDomainDrawer
          domain="VALIDASI"
          isOpen={isPanelOpen}
          onClose={handleClose}
          data={selectedDonation}
          token={token}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// ─── Mock fallback (used when API is unreachable) ─────────────────────────────
const MOCK_FALLBACK: ValidasiData[] = [
  {
    id: "mock-1",
    resi: "TXN-DON-2026-8842",
    name: "Sepatu Sekolah Anak + 1 Barang Lainnya",
    type: "BARANG",
    donor: "Budi Santoso",
    timeInfo: "28 Apr 2026",
    statusBadge: "MENUNGGU KEDATANGAN",
    category: "PAKAIAN",
    condition: "Baru",
    quantity: "2 Pasang",
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop",
    item_donations: [
      {
        id: "mock-item-1",
        itemName_snapshot: "Sepatu Sekolah Anak",
        qty: 2,
        inventory_id: "inv-mock-1",
        unit: "Pasang",
      },
      {
        id: "mock-item-2",
        itemName_snapshot: "Buku Tulis",
        qty: 10,
        inventory_id: "inv-mock-2",
        unit: "Pcs",
      },
    ],
    status: "PENDING_DELIVERY",
  },
  {
    id: "mock-2",
    resi: "TXN-DON-2026-8843",
    name: "Donasi Operasional Panti",
    type: "DANA",
    donor: "Siti Aminah",
    timeInfo: "28 Apr 2026",
    statusBadge: "TERKONFIRMASI SISTEM",
    amount: "Rp 5.000.000",
    status: "SUCCESS",
  },
];
