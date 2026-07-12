"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiCalendar,
  FiX,
  FiChevronRight,
  FiAlertTriangle,
  FiRefreshCw,
  FiBox,
} from "react-icons/fi";
import { FaUserGraduate, FaBuilding, FaUsers } from "react-icons/fa6";
import { GlobalDomainDrawer } from "@/components/workspace/GlobalDomainDrawer";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVisit(raw: any) {
  const isCorporate = raw.user?.email?.includes("company");
  const isBEM =
    raw.user?.name?.toLowerCase().includes("bem") ||
    raw.user?.name?.toLowerCase().includes("univ");

  let badge = "KUNJUNGAN PERSONAL";
  let icon = <FaUsers className="text-2xl text-gray-500" />;
  let iconBg = "bg-gray-200/70";

  if (raw.visitor_type === "Lembaga/Instansi") {
    badge = "KUNJUNGAN LEMBAGA";
    icon = <FaBuilding className="text-2xl text-indigo-500" />;
    iconBg = "bg-indigo-100/70";
  } else if (isCorporate) {
    badge = "CORPORATE VISIT";
    icon = <FaBuilding className="text-2xl text-blue-500" />;
    iconBg = "bg-blue-100/70";
  } else if (isBEM) {
    badge = "KUNJUNGAN EDUKASI";
    icon = <FaUserGraduate className="text-2xl text-teal-500" />;
    iconBg = "bg-teal-100/70";
  }

  // Parse capacity date to local WITA — backend sends ISO UTC (e.g. "2026-05-11T16:00:00Z" = May 12 WITA)
  const dateObj = new Date(raw.capacity?.date || raw.created_at);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const localYear = dateObj.getFullYear();
  const localMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
  const localDay = String(dateObj.getDate()).padStart(2, "0");
  const localYMD = `${localYear}-${localMonth}-${localDay}`;

  const slotMap: Record<string, string> = {
    MORNING: "Sesi Pagi (08:00 - 10:00)",
    AFTERNOON: "Sesi Siang (11:00 - 14:00)",
    EVENING: "Sesi Sore (15:00 - 16:00)",
    NIGHT: "Sesi Malam (17:00 - 20:00)",
  };

  const sessionStr = raw.capacity?.slot
    ? slotMap[raw.capacity.slot] || raw.capacity.slot
    : "Sesi Tidak Diketahui";
  const isHoldingSlot = raw.status === "APPROVED" || (raw.status === "PENDING" && raw.is_rescheduled);
  const isAvailable = raw.capacity ? raw.capacity.booked <= (isHoldingSlot ? 1 : 0) : false;

  const displayApplicant = raw.visitor_type === "Lembaga/Instansi" && raw.visitor_name
    ? raw.visitor_name
    : (raw.user?.name ?? "Pengunjung");

  const hasDonation = !!raw.donation;
  const mappedItems = hasDonation && raw.donation.item_donations
    ? raw.donation.item_donations.map((item: any) => ({
        id: item.id,
        itemName_snapshot: item.itemName_snapshot,
        qty: item.qty,
        unit: item.inventory?.unit,
        photo_url: item.photo_url,
      }))
    : [];

  return {
    id: raw.id,
    name: displayApplicant,
    date: formattedDate,
    dateYMD: localYMD,
    session: sessionStr,
    timeRange: sessionStr,
    badge,
    icon,
    iconBg,
    applicant: displayApplicant,
    applicantRole: raw.user?.email ?? "Tidak ada email",
    details: "Tujuan kunjungan tercatat dalam sistem.",
    bringsDonation: hasDonation,
    item_donations: mappedItems,
    capacityAvailable: isAvailable,
    status: raw.status,
    is_expired: !!raw.is_expired,
    is_rescheduled: raw.is_rescheduled,
    admin_notes: raw.admin_notes,
    visitor_type: raw.visitor_type,
    visitor_name: raw.visitor_name,
    proposal_file_url: raw.proposal_file_url,
  };
}

export default function ApprovalKunjunganPage() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const queryParams = new URLSearchParams();
      if (
        filterStatus &&
        filterStatus !== "EXPIRED" &&
        filterStatus !== "PENDING"
      ) {
        queryParams.append("status", filterStatus);
      } else {
        queryParams.append("status", "ALL");
      }
      if (filterDate) queryParams.append("date", filterDate);
      if (debouncedSearch) queryParams.append("search", debouncedSearch);

      const res = await fetch(
        `${API_BASE}/api/kunjungan/manage?${queryParams.toString()}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      if (!res.ok) throw new Error("Gagal memuat pengajuan kunjungan");
      const json = await res.json();
      const rawData = Array.isArray(json) ? json : (json.data ?? []);
      setVisits(rawData.map(mapVisit));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, filterStatus, filterDate, debouncedSearch]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (item: any) => {
    setSelectedVisit(item);
    setIsPanelOpen(true);
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedVisit(null), 300);
  };

  const handleSuccess = () => {
    fetchVisits();
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div
        className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-8 overflow-y-auto ${isPanelOpen ? "pr-[450px]" : ""}`}
      >
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Persetujuan Kunjungan
            </h1>
            <p className="text-gray-500 text-lg">
              Tinjau pengajuan jadwal untuk mencegah konflik dan memastikan
              kenyamanan anak-anak.
            </p>
          </div>

          <div className="bg-teal-50/30 backdrop-blur-md rounded-2xl p-4 mb-8 shadow-sm">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama lembaga atau institusi..."
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow border-none"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 bg-white rounded-xl text-gray-600 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-sm font-medium hover:bg-gray-50 transition-colors border-none outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 pr-8 bg-teal-100/50 rounded-xl text-teal-700 text-sm font-medium border-none outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none cursor-pointer"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230f766e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1em 1em",
                }}
              >
                <option value="PENDING">Menunggu</option>
                <option value="APPROVED">Disetujui</option>
                <option value="NEEDS_RESCHEDULE">Perlu Ubah Jadwal</option>
                <option value="REJECTED">Ditolak</option>
                <option value="EXPIRED">Kedaluwarsa</option>
                <option value="COMPLETED">Berhasil</option>
                <option value="NO_SHOW">Tidak Hadir</option>
                <option value="ALL">Semua</option>
              </select>
            </div>
          </div>

          {fetchError && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">
              <FiAlertTriangle className="text-lg flex-shrink-0" />
              <span className="flex-1">{fetchError}</span>
              <button
                onClick={fetchVisits}
                className="flex items-center gap-1.5 text-red-700 font-bold hover:text-red-900"
              >
                <FiRefreshCw className="text-base" /> Coba lagi
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center p-5 rounded-2xl bg-slate-50/70 animate-pulse gap-5"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-3 bg-slate-200 rounded-full" />
                    <div className="w-48 h-4 bg-slate-200 rounded-full" />
                  </div>
                </div>
              ))
            ) : visits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                <FiBox className="text-5xl mb-4 text-gray-300" />
                <p className="text-base font-medium text-gray-500">
                  Tidak ada pengajuan kunjungan yang perlu disetujui saat ini.
                </p>
              </div>
            ) : (
              visits.map((item) => {
                const isSelected = selectedVisit?.id === item.id;
                const isExpired = !!item.is_expired;

                // Array Filtering
                if (filterDate && item.dateYMD !== filterDate) return null;
                if (filterStatus === "EXPIRED" && !isExpired) return null;
                if (
                  filterStatus === "PENDING" &&
                  (item.status !== "PENDING" || isExpired)
                )
                  return null;
                if (
                  filterStatus !== "ALL" &&
                  filterStatus !== "EXPIRED" &&
                  filterStatus !== "PENDING" &&
                  item.status !== filterStatus
                )
                  return null;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`group flex flex-col sm:flex-row sm:items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "bg-white ring-2 ring-teal-600 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                        : "bg-slate-50 hover:bg-white hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isSelected ? "bg-blue-100 text-blue-600" : item.iconBg}`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p
                          className={`text-sm ${isSelected ? "text-teal-700 font-medium" : "text-gray-500"}`}
                        >
                          {item.date} | {item.session}
                        </p>
                      </div>
                      <FiChevronRight
                        className={`sm:hidden text-xl transition-transform duration-300 ml-auto ${isSelected ? "text-teal-600 translate-x-1" : "text-gray-300 group-hover:text-teal-400 group-hover:translate-x-1"}`}
                      />
                    </div>
                    <div className="flex flex-col sm:items-end justify-center gap-2 w-full sm:w-auto sm:ml-auto">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-gray-200/60 text-gray-600 text-[10px] font-bold tracking-wider rounded-full uppercase">
                          {item.badge}
                        </span>
                        <span
                          className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase ${
                            isExpired
                              ? "bg-gray-100 text-gray-700"
                              : item.status === "PENDING"
                                ? "bg-blue-100 text-blue-700"
                                : item.status === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : item.status === "RESCHEDULED" || item.status === "NEEDS_RESCHEDULE"
                                      ? "bg-orange-100 text-orange-700"
                                      : item.status === "NO_SHOW"
                                        ? "bg-gray-200 text-gray-800"
                                        : item.status === "COMPLETED"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isExpired
                            ? "KEDALUWARSA"
                            : item.status === "PENDING"
                              ? "MENUNGGU"
                              : item.status === "APPROVED"
                                ? "DISETUJUI"
                                : item.status === "REJECTED"
                                  ? "DITOLAK"
                                  : item.status === "RESCHEDULED" || item.status === "NEEDS_RESCHEDULE"
                                    ? "UBAH JADWAL"
                                    : item.status === "NO_SHOW"
                                      ? "TIDAK HADIR"
                                      : item.status === "COMPLETED"
                                        ? "BERHASIL"
                                        : item.status}
                        </span>
                      </div>
                      <FiChevronRight
                        className={`hidden sm:block text-xl transition-transform duration-300 ${isSelected ? "text-teal-600 translate-x-1" : "text-gray-300 group-hover:text-teal-400 group-hover:translate-x-1"}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedVisit && (
        <GlobalDomainDrawer
          domain="APPROVAL"
          isOpen={isPanelOpen}
          onClose={handleClose}
          data={selectedVisit}
          token={token}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
