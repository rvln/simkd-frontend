"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiFileText,
  FiClock,
  FiUser,
  FiLoader,
} from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ──────────────────────────────────────────
   Calendar helpers
   ────────────────────────────────────────── */
const DAY_LABELS = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

interface CalendarDay {
  date: number;
  month: "prev" | "current" | "next";
  fullDate: Date;
}

function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const grid: CalendarDay[] = [];

  // fill prev-month tail
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    grid.push({
      date: d,
      month: "prev",
      fullDate: new Date(year, month - 1, d),
    });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({
      date: d,
      month: "current",
      fullDate: new Date(year, month, d),
    });
  }
  // next-month head (pad to 42 = 6 rows)
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    grid.push({
      date: d,
      month: "next",
      fullDate: new Date(year, month + 1, d),
    });
  }
  return grid;
}

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */
interface Capacity {
  id: string;
  date: string;
  slot: string;
  quota: number;
  booked: number;
  is_active: boolean;
}

interface UpcomingVisit {
  id: string;
  visitor_name: string;
  status: string;
  visit_date: string | null;
  slot: string | null;
  created_at: string;
}

const SLOT_MAP: Record<string, { label: string; time: string }> = {
  MORNING: { label: "SESI PAGI", time: "08:00 – 10:00" },
  AFTERNOON: { label: "SESI SIANG", time: "13:00 – 15:00" },
  EVENING: { label: "SESI SORE", time: "15:30 – 18:00" },
  NIGHT: { label: "SESI MALAM", time: "19:00 – 20:00" },
};

function formatDate(dateStr: string): string {
  // Parse date-only strings (YYYY-MM-DD) manually to avoid UTC interpretation
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const dt = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
    );
    return dt.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  // Fallback for full ISO timestamps — use local timezone
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */
export default function JadwalKunjunganPage() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  /* ── API State ── */
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<UpcomingVisit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);

  /* ── Fetch capacities (same pattern as atur-jadwal) ── */
  useEffect(() => {
    fetch(`${API_BASE}/api/capacities`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setCapacities(json.data || []))
      .catch(() => setCapacities([]));
  }, []);

  /* ── Fetch upcoming visits ── */
  useEffect(() => {
    setIsLoadingVisits(true);
    fetch(`${API_BASE}/api/public/kunjungan/upcoming`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setUpcomingVisits(json.data || []))
      .catch(() => setUpcomingVisits([]))
      .finally(() => setIsLoadingVisits(false));
  }, []);

  const grid = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  /* ── Calendar event markers from capacities ── */
  const dateHasCapacity = useCallback(
    (date: Date): boolean => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return capacities.some((c) => {
        // Convert ISO timestamp to local WITA date string for accurate comparison
        const d = new Date(c.date);
        const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return localStr === dateStr && c.is_active;
      });
    },
    [capacities],
  );

  /* ── Filter only APPROVED visits for public display ── */
  const approvedVisits = useMemo(
    () => upcomingVisits.filter((v) => v.status === "APPROVED"),
    [upcomingVisits],
  );

  const dateHasVisit = useCallback(
    (date: Date): boolean => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return approvedVisits.some((v) => v.visit_date === dateStr);
    },
    [approvedVisits],
  );

  /* ── Custom UI Tooltip ── */
  const renderDateTooltip = useCallback(
    (date: Date, isSelected: boolean, colIndex: number) => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      
      const dayCapacities = capacities.filter((c) => {
        const d = new Date(c.date);
        const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return localStr === dateStr && c.is_active;
      });

      const dayVisits = approvedVisits.filter((v) => v.visit_date === dateStr);

      if (dayCapacities.length === 0 && dayVisits.length === 0) return null;

      const isLeftEdge = colIndex <= 1;
      const isRightEdge = colIndex >= 5;

      const posClass = isLeftEdge
        ? "left-0"
        : isRightEdge
          ? "right-0"
          : "left-1/2 -translate-x-1/2";

      const arrowClass = isLeftEdge
        ? "left-6"
        : isRightEdge
          ? "right-6"
          : "left-1/2 -translate-x-1/2";

      return (
        <div className={`absolute bottom-full ${posClass} mb-3 w-[240px] max-w-[85vw] p-3 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-200 z-[60] pointer-events-none text-left ${isSelected ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"}`}>
          {dayCapacities.length > 0 && (
            <div className="mb-3 last:mb-0">
              <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                Tersedia
              </p>
              <ul className="space-y-1.5">
                {dayCapacities.map((c, idx) => {
                  const slotInfo = SLOT_MAP[c.slot];
                  const label = slotInfo ? slotInfo.label : c.slot;
                  const remain = c.quota - c.booked;
                  return (
                    <li key={`cap-${idx}`} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded-md text-[10px] ${remain === 0 ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-700'}`}>{remain} pax</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {dayVisits.length > 0 && (
            <div className="mb-3 last:mb-0 pt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-md bg-blue-500"></span>
                Booking
              </p>
              <ul className="space-y-2">
                {dayVisits.map((v, idx) => {
                  const slotInfo = v.slot ? SLOT_MAP[v.slot] : null;
                  const label = slotInfo ? slotInfo.label : v.slot;
                  return (
                    <li key={`vis-${idx}`} className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-gray-800">{label}</span>
                      <span className="text-[10px] text-gray-500 truncate leading-tight">Oleh: {v.visitor_name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {/* Arrow */}
          <div className={`absolute top-full ${arrowClass} border-[6px] border-transparent border-t-white`} />
        </div>
      );
    },
    [capacities, approvedVisits]
  );

  return (
    <div className="bg-surface">
      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-low px-6 md:px-12 lg:px-20 pt-14 pb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.08] text-on-surface mb-6 italic">
            Agenda Kunjungan &amp; <br className="hidden sm:block" />
            Interaksi Sosial
          </h1>
          <p className="text-on-surface-variant font-sans text-base md:text-lg leading-relaxed max-w-xl">
            Pantau jadwal kegiatan secara real-time. Kami menjaga transparansi
            ruang dan waktu agar setiap kunjungan memberikan dampak maksimal
            tanpa mengganggu rutinitas belajar dan istirahat anak-anak.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — CALENDAR + KEGIATAN MENDATANG (SIDE BY SIDE)
      ═══════════════════════════════════════════ */}
      <section className="bg-surface px-6 md:px-12 lg:px-20 py-16 lg:py-24 pt-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
            {/* ── LEFT: Calendar ── */}
            <div className="lg:col-span-3">
              <GlassContainer className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-on-surface font-sans">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={goToPrev}
                      aria-label="Bulan sebelumnya"
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                      <FiChevronLeft className="text-lg" />
                    </button>
                    <button
                      onClick={goToNext}
                      aria-label="Bulan berikutnya"
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                      <FiChevronRight className="text-lg" />
                    </button>
                  </div>
                </div>

                {/* Day-of-week labels */}
                <div className="grid grid-cols-7 mb-2">
                  {DAY_LABELS.map((d) => (
                    <div
                      key={d}
                      className="text-center font-public-sans text-[11px] font-bold uppercase tracking-widest text-on-surface-variant py-2"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Date grid */}
                <div className="grid grid-cols-7">
                  {grid.map((cell, i) => {
                    const isOtherMonth = cell.month !== "current";
                    const isSelected =
                      !isOtherMonth && cell.date === selectedDay;
                    const hasCapacity =
                      !isOtherMonth && dateHasCapacity(cell.fullDate);
                    const hasVisit =
                      !isOtherMonth && dateHasVisit(cell.fullDate);
                    const hasEvent = hasCapacity || hasVisit;

                    return (
                      <div key={i} className="relative group flex justify-center">
                        <button
                          onClick={() => {
                            if (!isOtherMonth) setSelectedDay(cell.date);
                          }}
                          className={`
                          w-full flex flex-col items-center justify-center py-3 md:py-4 rounded-xl
                          transition-all duration-200 text-sm font-sans font-medium
                          ${
                            isOtherMonth
                              ? "text-on-surface-variant/30 cursor-default"
                              : isSelected && hasVisit
                                ? "ring-4 ring-primary/30 bg-primary text-white font-bold shadow-lg cursor-pointer"
                                : hasVisit
                                  ? "bg-primary text-white font-bold shadow-ambient cursor-pointer"
                                  : isSelected
                                    ? "ring-2 ring-primary bg-primary/10 text-primary font-bold cursor-pointer"
                                    : hasCapacity
                                      ? "bg-primary/5 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                                      : "text-on-surface hover:bg-surface-container-low cursor-pointer"
                          }
                        `}
                        >
                          {cell.date}
                          {hasCapacity && !hasVisit && (
                            <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                          )}
                        </button>
                        {!isOtherMonth && renderDateTooltip(cell.fullDate, isSelected, i % 7)}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-public-sans text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      Tersedia
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-primary" />
                    <span className="font-public-sans text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      Reservasi/Booking
                    </span>
                  </div>
                </div>
              </GlassContainer>
            </div>

            {/* ── RIGHT: Kegiatan Mendatang ── */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2">
                  Jadwal Terkini
                </span>
                <h2 className="text-2xl font-black tracking-tight text-on-surface">
                  Kegiatan Mendatang
                </h2>
                <span className="font-public-sans text-[11px] font-semibold text-on-surface-variant italic mt-1 block">
                  Sinkronisasi real-time dari sistem
                </span>
              </div>

              {isLoadingVisits ? (
                <div className="flex items-center justify-center py-16 text-on-surface-variant gap-3">
                  <FiLoader className="animate-spin text-xl" />
                  <span className="font-sans text-sm">
                    Memuat kegiatan mendatang...
                  </span>
                </div>
              ) : approvedVisits.length === 0 ? (
                <GlassContainer className="p-10 text-center">
                  <FiClock className="text-4xl text-on-surface-variant/40 mx-auto mb-3" />
                  <p className="text-sm text-on-surface-variant font-sans">
                    Belum ada kegiatan kunjungan yang terjadwal.
                  </p>
                </GlassContainer>
              ) : (
                <div
                  className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {approvedVisits.map((visit) => {
                    const slotInfo = visit.slot ? SLOT_MAP[visit.slot] : null;

                    return (
                      <GlassContainer
                        key={visit.id}
                        className="p-5 flex flex-col gap-3"
                      >
                        {/* Session badge */}
                        {slotInfo && (
                          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-public-sans text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-primary/20 self-start">
                            {slotInfo.label} ({slotInfo.time})
                          </span>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-primary text-sm flex-shrink-0" />
                          <h4 className="font-bold text-sm text-on-surface font-sans">
                            {visit.visit_date
                              ? formatDate(visit.visit_date)
                              : "Tanggal belum ditentukan"}
                          </h4>
                        </div>

                        {/* Visitor name */}
                        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-outline-variant/10">
                          <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                            <FiUser className="text-primary text-xs" />
                          </div>
                          <span className="font-public-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider truncate">
                            {visit.visitor_name}
                          </span>
                        </div>
                      </GlassContainer>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — CTA BANNER
      ═══════════════════════════════════════════ */}
      <section className="bg-surface px-6 md:px-12 lg:px-20 py-16 lg:py-24 pt-4 pb-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text + CTAs */}
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-snug text-on-surface mb-5">
              Rencanakan Momen Berharga Anda
            </h2>
            <p className="text-on-surface-variant font-sans text-base leading-relaxed max-w-md mb-8">
              Bawa kehangatan untuk anak-anak di Panti Asuhan Dr. J. Lucas. Untuk
              memastikan kenyamanan bersama, setiap kunjungan memerlukan akun
              terverifikasi dan persetujuan jadwal.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/jadwal-kunjungan/atur-jadwal"
                className="w-full sm:w-auto"
              >
                <PrimaryButton className="flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-bold tracking-wide w-full min-h-[44px]">
                  <FiCalendar className="text-base" />
                  Jadwalkan Kunjungan Sekarang
                </PrimaryButton>
              </Link>

              {/* <Link
                href="/panduan-kunjungan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-surface-container-lowest px-7 py-4 rounded-md font-public-sans text-sm font-bold text-on-surface hover:shadow-ambient transition-all border border-outline-variant/15 min-h-[44px]"
              >
                <FiFileText className="text-primary text-base" />
                Pelajari Panduan Kunjungan
              </Link> */}
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-ambient max-md:hidden">
            <Image
              src="/example_img/kids-8.png"
              alt="Kunjungan ke Panti Asuhan"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
