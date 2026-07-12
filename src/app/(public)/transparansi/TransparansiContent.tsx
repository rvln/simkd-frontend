"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { GlassContainer } from "@/components/ui/GlassContainer";
import {
  FiUser,
  FiBox,
  FiTruck,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";
import {
  MdOutlineSchool,
  MdOutlineRestaurant,
  MdOutlineMedicalServices,
  MdOutlineCleaningServices,
  MdOutlineCategory,
  MdOutlineChecklistRtl,
} from "react-icons/md";
import {
  useTransparencyDonations,
  useTransparencyDistributions,
  useTransparencyNeeds,
  useTransparencyVisits,
  useTransparencyReports,
  type PaginationMeta,
  type TransparencyDonation,
  type TransparencyDistribution,
  type TransparencyNeed,
  type TransparencyVisit,
  type TransparencyReport,
} from "@/hooks/useTransparency";

/* ═══════════════════════════════════════════
   HELPER — Category Icon Mapper
   ═══════════════════════════════════════════ */
function getCategoryIcon(category: string) {
  switch (category) {
    case "MAKANAN":
      return <MdOutlineRestaurant className="text-2xl text-primary" />;
    case "PAKAIAN":
    case "PENDIDIKAN":
      return <MdOutlineSchool className="text-2xl text-primary" />;
    case "KESEHATAN":
      return <MdOutlineMedicalServices className="text-2xl text-primary" />;
    case "KEBERSIHAN":
      return <MdOutlineCleaningServices className="text-2xl text-primary" />;
    default:
      return <MdOutlineCategory className="text-2xl text-primary" />;
  }
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case "MENDESAK":
      return {
        badge: "bg-primary/10 text-primary border border-primary/20",
        bar: "bg-primary",
        label: "Prioritas Tinggi",
      };
    case "OPSIONAL":
      return {
        badge:
          "bg-surface-container-low text-on-surface-variant border border-outline-variant/15",
        bar: "bg-primary",
        label: "Opsional",
      };
    default:
      return {
        badge: "bg-tertiary/10 text-tertiary border border-tertiary/20",
        bar: "bg-tertiary",
        label: "Penting",
      };
  }
}

function getDonationIcon(type: string) {
  return type === "DANA" ? (
    <FiDollarSign className="text-primary" />
  ) : (
    <FiPackage className="text-primary" />
  );
}

function getStatusStyle(type: string) {
  return type === "DANA" ? "text-tertiary" : "text-primary";
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} Menit Lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} Jam Lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} Hari Lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: string | number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ═══════════════════════════════════════════
   Skeleton Components
   ═══════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <GlassContainer className="p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-surface-container-low" />
        <div className="w-24 h-5 rounded-full bg-surface-container-low" />
      </div>
      <div>
        <div className="h-4 w-3/4 rounded bg-surface-container-low mb-2" />
        <div className="h-3 w-full rounded bg-surface-container-low" />
      </div>
      <div className="mt-auto">
        <div className="h-2 w-full rounded-full bg-surface-container-low" />
      </div>
    </GlassContainer>
  );
}

function SkeletonLogRow() {
  return (
    <GlassContainer className="px-5 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-surface-container-low flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-1/2 rounded bg-surface-container-low mb-1" />
        <div className="h-3 w-3/4 rounded bg-surface-container-low" />
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="h-3 w-16 rounded bg-surface-container-low mb-1 ml-auto" />
        <div className="h-2 w-20 rounded bg-surface-container-low ml-auto" />
      </div>
    </GlassContainer>
  );
}

/* ═══════════════════════════════════════════
   Pagination Component
   ═══════════════════════════════════════════ */
function Pagination({
  meta,
  paramKey,
  onPageChange,
}: {
  meta: PaginationMeta;
  paramKey: string;
  onPageChange: (key: string, page: number) => void;
}) {
  if (meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        disabled={meta.current_page <= 1}
        onClick={() => onPageChange(paramKey, meta.current_page - 1)}
        className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Halaman sebelumnya"
      >
        <FiChevronLeft className="text-lg" />
      </button>
      <span className="font-public-sans text-xs font-semibold text-on-surface-variant">
        {meta.current_page} / {meta.last_page}
      </span>
      <button
        disabled={meta.current_page >= meta.last_page}
        onClick={() => onPageChange(paramKey, meta.current_page + 1)}
        className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Halaman berikutnya"
      >
        <FiChevronRight className="text-lg" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Filter Chip Component
   ═══════════════════════════════════════════ */
function FilterChips({
  options,
  activeValue,
  paramKey,
  onSelect,
}: {
  options: { label: string; value: string }[];
  activeValue: string;
  paramKey: string;
  onSelect: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() =>
            onSelect(paramKey, opt.value === activeValue ? "" : opt.value)
          }
          className={`font-public-sans text-[11px] font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 ${
            opt.value === activeValue
              ? "bg-primary text-white shadow-sm"
              : "bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Horizontal Carousel with Gradient Masking
   Only activates when children count exceeds threshold (default 3).
   ═══════════════════════════════════════════ */
function HorizontalScroller({
  children,
  threshold = 3,
}: {
  children: React.ReactNode;
  threshold?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const count = React.Children.count(children);
  const shouldScroll = count > threshold;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, children]);

  if (!shouldScroll) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
    );
  }

  // Build CSS mask-image based on scroll position
  const maskLeft = canScrollLeft
    ? "transparent, black 64px"
    : "black, black 0px";
  const maskRight = canScrollRight
    ? "black calc(100% - 64px), transparent"
    : "black 100%, black 100%";
  const maskImage = `linear-gradient(to right, ${maskLeft}, ${maskRight})`;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitMaskImage: maskImage,
          maskImage,
          scrollbarWidth: "none",
        }}
      >
        {React.Children.map(children, (child) => (
          <div className="min-w-[300px] max-w-[340px] flex-shrink-0 snap-start">
            {child}
          </div>
        ))}
      </div>
      {/* Scroll hint arrows */}
      {canScrollLeft && (
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 rounded-full bg-surface/90 shadow-md flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors border-none"
          aria-label="Scroll kiri"
        >
          <FiChevronLeft />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })
          }
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 rounded-full bg-surface/90 shadow-md flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors border-none"
          aria-label="Scroll kanan"
        >
          <FiChevronRight />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Vertical Scroll Fade Effect
   Constrains height and applies bottom gradient fade when items > threshold.
   ═══════════════════════════════════════════ */
function VerticalScrollFade({
  children,
  threshold = 4,
  maxHeight = "420px",
}: {
  children: React.ReactNode;
  threshold?: number;
  maxHeight?: string;
}) {
  const count = React.Children.count(children);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const checkBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
  }, []);

  useEffect(() => {
    checkBottom();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkBottom, { passive: true });
    return () => el.removeEventListener("scroll", checkBottom);
  }, [checkBottom, children]);

  if (count <= threshold) {
    return <div className="space-y-4">{children}</div>;
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="space-y-4 overflow-y-auto pr-1"
        style={{
          maxHeight,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.12) transparent",
        }}
      >
        {children}
      </div>
      {/* Bottom gradient fade overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--color-surface, #fff))",
          opacity: isAtBottom ? 0 : 1,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN CLIENT COMPONENT
   ═══════════════════════════════════════════ */
export default function TransparansiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* ── Read URL query params ── */
  const donationPage = Number(searchParams.get("don_page") || "1");
  const donationType = searchParams.get("don_type") || "";
  const distPage = Number(searchParams.get("dist_page") || "1");
  const distCategory = searchParams.get("dist_cat") || "";
  const visitPage = Number(searchParams.get("visit_page") || "1");
  const needCategory = searchParams.get("need_cat") || "";
  const reportPage = Number(searchParams.get("report_page") || "1");

  /* ── SWR hooks ── */
  const { needs, isLoading: needsLoading } = useTransparencyNeeds(
    needCategory || undefined,
  );
  const {
    donations,
    meta: donMeta,
    isLoading: donLoading,
  } = useTransparencyDonations(donationPage, donationType || undefined);
  const {
    distributions,
    meta: distMeta,
    isLoading: distLoading,
  } = useTransparencyDistributions(distPage, distCategory || undefined);
  const {
    visits,
    meta: visitMeta,
    isLoading: visitLoading,
  } = useTransparencyVisits(visitPage);
  const {
    reports,
    meta: reportMeta,
    isLoading: reportLoading,
  } = useTransparencyReports(reportPage);

  /* ── URL param setter (shareable) ── */
  const setParam = useCallback(
    (key: string, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === 0) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      // Reset page when filter changes (non-page params)
      if (!key.endsWith("_page")) {
        const pageKey = key
          .replace(/_type|_cat/, "_page")
          .replace(/need_cat/, "");
        if (pageKey && params.has(pageKey)) params.delete(pageKey);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const handlePageChange = useCallback(
    (key: string, page: number) => setParam(key, page),
    [setParam],
  );

  /* ── Filter chip configs ── */
  const donationFilterOptions = [
    { label: "Semua", value: "" },
    { label: "Dana", value: "DANA" },
    { label: "Barang", value: "BARANG" },
  ];

  const categoryFilterOptions = [
    { label: "Semua", value: "" },
    { label: "Makanan", value: "MAKANAN" },
    { label: "Pakaian", value: "PAKAIAN" },
    { label: "Pendidikan", value: "PENDIDIKAN" },
    { label: "Kesehatan", value: "KESEHATAN" },
    { label: "Kebersihan", value: "KEBERSIHAN" },
  ];

  /* ── Filtered needs (only show items where target > 0) ── */
  const filteredNeeds = needs.filter((n: TransparencyNeed) => n.target_qty > 0);

  return (
    <>
      {/* ═══════════════════════════════════════════
          SECTION 2 — KEBUTUHAN OPERASIONAL
      ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-low px-6 md:px-12 lg:px-20 pt-8 pb-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2">
                Kebutuhan Operasional
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
                Transparansi Kebutuhan Panti
              </h2>
            </div>
            <span className="font-public-sans text-[11px] font-semibold text-on-surface-variant italic">
              Data diperbarui real-time via API
            </span>
          </div>

          <div className="mb-8">
            <FilterChips
              options={categoryFilterOptions}
              activeValue={needCategory}
              paramKey="need_cat"
              onSelect={setParam}
            />
          </div>

          {needsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredNeeds.length === 0 ? (
            <GlassContainer className="p-8 text-center">
              <MdOutlineChecklistRtl className="text-4xl text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant font-sans">
                Tidak ada data kebutuhan untuk filter ini.
              </p>
            </GlassContainer>
          ) : (
            <HorizontalScroller threshold={3}>
              {filteredNeeds.map((item: TransparencyNeed) => {
                const style = getPriorityStyle(item.priority);
                const pct =
                  item.target_qty > 0
                    ? Math.round((item.stock / item.target_qty) * 100)
                    : 0;
                const isFulfilled = pct >= 100;
                return (
                  <GlassContainer
                    key={item.id}
                    className="p-6 flex flex-col gap-5 h-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                        {getCategoryIcon(item.category)}
                      </div>
                      <span
                        className={`inline-flex items-center font-public-sans text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          isFulfilled
                            ? "bg-tertiary/10 text-tertiary border border-tertiary/20"
                            : style.badge
                        }`}
                      >
                        {isFulfilled ? "Tercapai" : style.label}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-on-surface font-sans mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
                        {item.description || "Kebutuhan operasional panti."}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs font-public-sans font-semibold mb-2">
                        <span className="text-on-surface">
                          {item.stock} / {item.target_qty} {item.unit}
                        </span>
                        <span className="text-on-surface-variant">
                          {Math.min(pct, 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isFulfilled ? "bg-tertiary" : style.bar}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </GlassContainer>
                );
              })}
            </HorizontalScroller>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — LOG TRANSPARANSI DONASI
      ═══════════════════════════════════════════ */}
      <section className="bg-surface px-6 md:px-12 lg:px-20 pt-8 pb-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20">
          <div>
            <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2">
              Arus Dana &amp; Barang
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-5">
              Log Transparansi Donasi Terkini
            </h2>
            <p className="text-on-surface-variant font-sans text-sm leading-relaxed max-w-md mb-8">
              Sistem kami secara otomatis memvalidasi setiap bantuan yang masuk
              baik melalui transfer digital maupun serah terima barang di gudang
              logistik.
            </p>

            <div className="bg-surface-container-low rounded-xl p-5 border-l-4 border-primary/40 max-w-md mb-8">
              <p className="text-sm text-on-surface-variant leading-relaxed font-sans italic">
                Kami menjaga privasi donatur dengan sistem masking nama otomatis
                pada tampilan publik sesuai dengan kebijakan etis panti.
              </p>
            </div>

            <FilterChips
              options={donationFilterOptions}
              activeValue={donationType}
              paramKey="don_type"
              onSelect={setParam}
            />
          </div>

          <div>
            {donLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonLogRow key={i} />
                ))}
              </div>
            ) : donations.length === 0 ? (
              <GlassContainer className="p-8 text-center">
                <FiUser className="text-3xl text-on-surface-variant/40 mx-auto mb-3" />
                <p className="text-sm text-on-surface-variant font-sans">
                  Belum ada data donasi untuk filter ini.
                </p>
              </GlassContainer>
            ) : (
              <VerticalScrollFade threshold={4} maxHeight="420px">
                {donations.map((log: TransparencyDonation) => (
                  <GlassContainer
                    key={log.id}
                    className="px-5 py-4 flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center">
                      {getDonationIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-on-surface font-sans truncate">
                        {log.masked_name}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-sans truncate">
                        {log.type === "DANA"
                          ? `Donasi Dana — ${formatCurrency(log.amount || 0)}`
                          : `Donasi Barang (${log.items?.map((i) => i.name).join(", ") || "Barang"})`}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="block text-xs font-sans font-semibold text-on-surface">
                        {formatRelativeTime(log.updated_at)}
                      </span>
                      <span
                        className={`font-public-sans text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(log.type)}`}
                      >
                        TERVALIDASI SISTEM
                      </span>
                    </div>
                  </GlassContainer>
                ))}
              </VerticalScrollFade>
            )}
            {donMeta && (
              <Pagination
                meta={donMeta}
                paramKey="don_page"
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — DISTRIBUSI BANTUAN
      ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-low px-6 md:px-12 lg:px-20 pt-8 pb-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2">
                Distribusi &amp; Penyaluran
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
                Jejak Distribusi Bantuan
              </h2>
            </div>
            <FilterChips
              options={categoryFilterOptions}
              activeValue={distCategory}
              paramKey="dist_cat"
              onSelect={setParam}
            />
          </div>

          {distLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <GlassContainer key={i} className="p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-low" />
                    <div className="h-4 w-1/2 rounded bg-surface-container-low" />
                  </div>
                  <div className="h-3 w-3/4 rounded bg-surface-container-low mb-2" />
                  <div className="h-3 w-1/2 rounded bg-surface-container-low" />
                </GlassContainer>
              ))}
            </div>
          ) : distributions.length === 0 ? (
            <GlassContainer className="p-8 text-center">
              <FiTruck className="text-3xl text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant font-sans">
                Belum ada data distribusi untuk filter ini.
              </p>
            </GlassContainer>
          ) : (
            <HorizontalScroller threshold={3}>
              {distributions.map((dist: TransparencyDistribution) => (
                <GlassContainer key={dist.id} className="p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                      <FiBox className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-on-surface font-sans truncate">
                        {dist.item_name}
                      </h4>
                      <span className="font-public-sans text-[9px] font-bold uppercase tracking-widest text-tertiary">
                        TERDISTRIBUSI
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant font-sans mb-1">
                    <span className="font-semibold text-on-surface">
                      {dist.qty} {dist.unit}
                    </span>{" "}
                    — {dist.target_recipient}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-sans">
                    <FiCalendar className="text-primary text-[11px]" />
                    {formatDate(dist.distributed_at)}
                  </div>
                </GlassContainer>
              ))}
            </HorizontalScroller>
          )}
          {distMeta && (
            <Pagination
              meta={distMeta}
              paramKey="dist_page"
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — KUNJUNGAN TERKINI
      ═══════════════════════════════════════════ */}
      <section className="bg-surface px-6 md:px-12 lg:px-20 pt-8 pb-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2">
              Interaksi Sosial
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Agenda &amp; Kunjungan Terkini
            </h2>
          </div>

          {visitLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <GlassContainer key={i} className="p-5 animate-pulse">
                  <div className="h-4 w-2/3 rounded bg-surface-container-low mb-3" />
                  <div className="h-3 w-full rounded bg-surface-container-low mb-2" />
                  <div className="h-3 w-1/2 rounded bg-surface-container-low" />
                </GlassContainer>
              ))}
            </div>
          ) : visits.length === 0 ? (
            <GlassContainer className="p-8 text-center">
              <FiCalendar className="text-3xl text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant font-sans">
                Belum ada data kunjungan.
              </p>
            </GlassContainer>
          ) : (
            <HorizontalScroller threshold={3}>
              {visits.map((visit: TransparencyVisit) => {
                const isCompleted = visit.status === "COMPLETED";
                const slotMap: Record<string, string> = {
                  MORNING: "Pagi (08:00–10:00)",
                  AFTERNOON: "Siang (12:00–15:00)",
                  EVENING: "Sore (15:00–18:00)",
                  NIGHT: "Malam (18:00–20:00)",
                };
                return (
                  <GlassContainer key={visit.id} className="p-5 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
                          <FiUser className="text-primary text-sm" />
                        </div>
                        <h4 className="font-bold text-sm text-on-surface font-sans">
                          {visit.visitor_name}
                        </h4>
                      </div>
                      <span
                        className={`font-public-sans text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? "bg-primary text-white"
                            : "bg-tertiary text-white"
                        }`}
                      >
                        {isCompleted ? "BERHASIL" : "TERJADWAL"}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-sans mb-2">
                      {slotMap[visit.slot] || visit.slot}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="text-primary text-sm" />
                      <span className="font-public-sans text-xs font-semibold text-primary">
                        {visit.visit_date ? formatDate(visit.visit_date) : "—"}
                      </span>
                    </div>
                  </GlassContainer>
                );
              })}
            </HorizontalScroller>
          )}
          {visitMeta && (
            <Pagination
              meta={visitMeta}
              paramKey="visit_page"
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — LAPORAN PENGUNJUNG (UGC)
      ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-low px-6 md:px-12 lg:px-20 pt-8 pb-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2">
              Jejak Pengalaman
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Cerita Dari Pengunjung Kami
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <GlassContainer key={i} className="p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low" />
                    <div className="h-4 w-24 rounded bg-surface-container-low" />
                  </div>
                  <div className="h-3 w-full rounded bg-surface-container-low mb-2" />
                  <div className="h-3 w-3/4 rounded bg-surface-container-low mb-2" />
                  <div className="h-3 w-1/2 rounded bg-surface-container-low" />
                </GlassContainer>
              ))
            ) : reports.length === 0 ? (
              <GlassContainer className="p-8 col-span-full text-center">
                <FiUser className="text-3xl text-on-surface-variant/40 mx-auto mb-3" />
                <p className="text-sm text-on-surface-variant font-sans">
                  Belum ada laporan pengunjung yang dipublikasikan.
                </p>
              </GlassContainer>
            ) : (
              reports.map((report: TransparencyReport) => (
                <GlassContainer key={report.id} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center">
                      <FiUser className="text-primary text-sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface font-sans">
                        {report.visitor_name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <FiCalendar className="text-[10px] text-primary" />
                        {report.visit_date
                          ? formatDate(report.visit_date)
                          : "—"}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-sans mb-4 line-clamp-4">
                    {report.content}
                  </p>
                  {report.image_path && report.image_path.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {report.image_path.slice(0, 3).map((path, idx) => (
                        <img
                          key={idx}
                          src={`${process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage"}/${path}`}
                          alt={`Foto ${idx + 1}`}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-surface-container-low"
                        />
                      ))}
                      {report.image_path.length > 3 && (
                        <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                          <span className="font-public-sans text-xs font-bold text-on-surface-variant">
                            +{report.image_path.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </GlassContainer>
              ))
            )}
          </div>
          {reportMeta && (
            <Pagination
              meta={reportMeta}
              paramKey="report_page"
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>
    </>
  );
}
