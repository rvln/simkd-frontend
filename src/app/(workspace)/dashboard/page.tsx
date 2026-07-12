"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { GlassContainer } from "@/components/ui/GlassContainer";
import {
  MdOutlineCalendarToday,
  MdOutlineInventory2,
  MdOutlineGroup,
  MdOutlineVolunteerActivism,
  MdOutlineChevronRight,
  MdOutlineTask,
  MdOutlineCheckCircle,
  MdErrorOutline,
} from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface OverviewMetrics {
  pending_visits: number;
  pending_donations: number;
  weekly_capacity_remaining: number;
  weekly_total_capacity: number;
}

interface AgendaItem {
  id: string;
  applicant: string;
  session: string;
  time: string;
}

interface ActivityLog {
  id: string;
  title: string;
  subtitle: string;
  time_diff: string;
  domain: string;
  updated_at: string;
}

interface LogisticsAudit {
  id: string;
  title: string;
  actor: string;
  time_formatted: string;
  status_badge: string;
  target_recipient: string | null;
}

interface OverviewResponse {
  metrics: OverviewMetrics;
  todays_agenda: AgendaItem[];
  activity_logs: ActivityLog[];
  logistics_audit: LogisticsAudit[];
}

const getSessionTime = (session: string) => {
  const mapping: Record<string, string> = {
    MORNING: "08:00",
    AFTERNOON: "13:00",
    EVENING: "15:30",
    NIGHT: "19:00",
  };
  return mapping[session] || "--:--";
};

const translateSession = (session: string) => {
  const mapping: Record<string, string> = {
    MORNING: "PAGI",
    AFTERNOON: "SIANG",
    EVENING: "SORE",
    NIGHT: "MALAM",
  };
  return mapping[session] || session;
};

const translateSubtitle = (subtitle: string) => {
  if (!subtitle) return subtitle;
  return subtitle
    .replace(/PENDING_DELIVERY/g, "MENUNGGU PENGIRIMAN")
    .replace(/PENDING/g, "MENUNGGU PERSETUJUAN")
    .replace(/NEEDS_RESCHEDULE/g, "PERLU DIUBAH JADWAL")
    .replace(/APPROVED/g, "DITERIMA")
    .replace(/REJECTED/g, "DITOLAK")
    .replace(/NO_SHOW/g, "TIDAK HADIR")
    .replace(/EXPIRED/g, "KEDALUWARSA")
    .replace(/SUCCESS/g, "BERHASIL")
    .replace(/COMPLETED/g, "BERHASIL")
    .replace(/DELIVERED/g, "TERKIRIM")
    .replace(/FAILED/g, "GAGAL")
    .replace(/CANCELLED/g, "DIBATALKAN");
};

const translateTimeDiff = (timeDiff: string) => {
  if (!timeDiff) return timeDiff;
  return timeDiff
    .replace(/just now/i, "baru saja")
    .replace(/ago/i, "yang lalu")
    .replace(/seconds?/i, "detik")
    .replace(/minutes?/i, "menit")
    .replace(/hours?/i, "jam")
    .replace(/days?/i, "hari")
    .replace(/weeks?/i, "minggu")
    .replace(/months?/i, "bulan")
    .replace(/years?/i, "tahun")
    .replace(/from now/i, "dari sekarang");
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [data, setData] = useState<OverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch(`${API_BASE}/api/dashboard/overview`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error("Gagal memuat data dashboard.");
        const json = await res.json();
        setData(json);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div className="flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-6 lg:p-10 pb-20 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <header className="mb-10">
            <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-2 font-sans">
              Dasbor Operasional
            </h1>
            <p className="text-on-surface-variant font-public-sans text-lg">
              Selamat datang kembali{user ? `, ${user.name}` : ""}. Pantau
              aktivitas panti hari ini pada waktu nyata.
            </p>
          </header>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
              <MdErrorOutline className="text-2xl" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <DashboardSkeleton />
          ) : data ? (
            <>
              {/* Bento Grid Metric Cards */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Card 1 */}
                <GlassContainer className="p-8 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-300 shadow-ambient">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <MdOutlineCalendarToday className="text-2xl" />
                  </div>
                  <div>
                    <p className="font-public-sans text-sm font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
                      Menunggu Persetujuan
                    </p>
                    <h2 className="text-5xl font-black text-primary mb-2 font-sans">
                      {data.metrics.pending_visits}
                    </h2>
                    <p className="text-on-surface-variant text-sm font-sans font-light">
                      Pengajuan jadwal kunjungan baru.
                    </p>
                  </div>
                </GlassContainer>

                {/* Card 2: Signature Gradient */}
                <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl flex flex-col gap-4 text-white group hover:-translate-y-1 transition-transform duration-300 shadow-ambient border-none">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <MdOutlineInventory2 className="text-white text-2xl" />
                  </div>
                  <div>
                    <p className="font-public-sans text-sm font-semibold opacity-80 uppercase tracking-widest mb-1">
                      Menunggu Penerimaan
                    </p>
                    <h2 className="text-5xl font-black mb-2 font-sans text-white">
                      {data.metrics.pending_donations}
                    </h2>
                    <p className="opacity-90 text-sm font-sans font-light">
                      Resi donasi fisik yang tertunda.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <GlassContainer className="p-8 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-300 shadow-ambient">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                    <MdOutlineGroup className="text-2xl" />
                  </div>
                  <div>
                    <p className="font-public-sans text-sm font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
                      Kapasitas Kunjungan
                    </p>
                    <h2 className="text-2xl font-bold text-tertiary mb-2 font-sans">
                      Sisa {data.metrics.weekly_capacity_remaining} Slot Terbuka
                    </h2>
                    <p className="text-on-surface-variant text-sm font-sans font-light">
                      untuk kuota 7 hari ke depan.
                    </p>
                  </div>
                </GlassContainer>
              </section>

              {/* Asymmetrical Lower Section */}
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Agenda (60%) */}
                <section className="lg:w-[60%]">
                  <GlassContainer className="p-8 shadow-ambient flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-primary font-sans">
                        Agenda Kunjungan Hari Ini
                      </h3>
                      <span className="px-4 py-1.5 bg-surface-container rounded-full text-xs font-public-sans font-bold text-on-surface-variant uppercase tracking-widest">
                        {data.todays_agenda.length} Sesi Terjadwal
                      </span>
                    </div>

                    <div className="space-y-4 flex-1 max-h-[340px] overflow-y-auto pr-2">
                      {data.todays_agenda.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                          <MdOutlineCalendarToday className="text-4xl mb-3 text-gray-300" />
                          <p className="text-sm font-medium text-gray-500">
                            Tidak ada jadwal kunjungan hari ini.
                          </p>
                        </div>
                      ) : (
                        data.todays_agenda.map((agenda) => (
                          <div
                            key={agenda.id}
                            className="flex items-center gap-6 p-6 bg-surface-container-low rounded-xl group hover:bg-surface-variant transition-colors cursor-pointer border-none shadow-none"
                          >
                            <div className="flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg px-4 py-2 shadow-sm min-w-[80px]">
                              <span className="text-primary font-black text-xl font-sans">
                                {agenda.time && agenda.time !== "TBA"
                                  ? agenda.time.slice(0, 5)
                                  : getSessionTime(agenda.session)}
                              </span>
                              <span className="text-[10px] font-public-sans font-bold text-on-surface-variant uppercase">
                                {translateSession(agenda.session)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-on-surface text-lg font-sans">
                                {agenda.applicant}
                              </h4>
                              <p className="text-on-surface-variant font-public-sans text-sm flex items-center gap-1 mt-1">
                                <MdOutlineGroup className="text-sm" />
                                Kunjungan Tervalidasi
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </GlassContainer>
                </section>

                {/* Right: Log Aktivitas (40%) */}
                <section className="lg:w-[40%]">
                  <GlassContainer className="p-8 shadow-ambient flex flex-col h-full">
                    <h3 className="text-2xl font-bold text-primary mb-8 font-sans">
                      Log Aktivitas
                    </h3>

                    <div className="relative flex-1 max-h-[340px] overflow-y-auto pr-2">
                      {/* Timeline line */}
                      <div className="absolute left-3.5 top-0 bottom-0 w-[2px] bg-outline-variant/20"></div>

                      <div className="space-y-8 relative">
                        {data.activity_logs.length === 0 ? (
                          <p className="text-sm text-gray-500 pl-10">
                            Belum ada aktivitas baru.
                          </p>
                        ) : (
                          data.activity_logs.map((log, idx) => {
                            const isDonation = log.domain === "donasi";
                            return (
                              <div
                                key={`${log.id}-${idx}`}
                                className="flex gap-6 items-start relative"
                              >
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white ring-4 ring-surface-container-lowest z-10 flex-shrink-0 ${isDonation ? "bg-tertiary" : "bg-primary"}`}
                                >
                                  {isDonation ? (
                                    <MdOutlineVolunteerActivism className="text-[14px]" />
                                  ) : (
                                    <MdOutlineGroup className="text-[14px]" />
                                  )}
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="font-bold text-sm text-on-surface font-sans">
                                    {log.title}
                                  </p>
                                  <p
                                    className={`font-public-sans text-xs font-bold uppercase tracking-widest mt-1 ${isDonation ? "text-tertiary" : "text-primary"}`}
                                  >
                                    {translateSubtitle(log.subtitle)}
                                  </p>
                                  <span className="text-[10px] text-on-surface-variant uppercase font-public-sans mt-2 block">
                                    {translateTimeDiff(log.time_diff)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </GlassContainer>
                </section>
              </div>

              {/* ──────────────────────────────────────────
                  Audit Timeline Logistik
                  ────────────────────────────────────────── */}
              <section className="mt-8">
                <GlassContainer className="p-8 shadow-ambient flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <h3 className="text-xl font-bold text-primary mb-2 font-sans">
                      Jejak Audit Logistik
                    </h3>
                    <p className="text-sm text-on-surface-variant font-public-sans mb-6">
                      Lacak histori status dan pergerakan inventaris pada waktu
                      nyata. Memastikan transparansi dari penerimaan hingga
                      distribusi.
                    </p>
                  </div>

                  <div className="md:w-2/3 relative pl-6 max-h-[380px] overflow-y-auto pr-2">
                    {/* Vertical Line */}
                    <div className="absolute left-[35px] top-4 bottom-8 w-[2px] bg-gradient-to-b from-primary via-tertiary to-outline-variant/30"></div>

                    {data.logistics_audit.length === 0 ? (
                      <p className="text-sm text-gray-500 pl-10 py-5">
                        Belum ada catatan distribusi.
                      </p>
                    ) : (
                      data.logistics_audit.map((audit, index) => {
                        const colors = [
                          "bg-primary text-white",
                          "bg-tertiary text-white",
                          "bg-gray-200 text-gray-500",
                        ];
                        const textColors = [
                          "text-primary",
                          "text-tertiary",
                          "text-outline",
                        ];
                        const bgColors = [
                          "bg-primary/10",
                          "bg-tertiary/10",
                          "bg-surface-variant/50",
                        ];

                        const colorIdx = Math.min(index, 2);

                        return (
                          <div
                            key={audit.id}
                            className={`flex gap-6 items-start relative ${index !== data.logistics_audit.length - 1 ? "mb-8" : ""}`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ring-8 ring-surface-container-lowest z-10 flex-shrink-0 shadow-sm ${colors[colorIdx]}`}
                            >
                              {index === 0 ? (
                                <MdOutlineInventory2 className="text-lg" />
                              ) : index === 1 ? (
                                <MdOutlineTask className="text-lg" />
                              ) : (
                                <MdOutlineCheckCircle className="text-lg" />
                              )}
                            </div>
                            <div className="flex-1 pt-1.5 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                              <h4
                                className={`font-bold text-base font-sans ${index > 1 ? "text-on-surface-variant" : "text-on-surface"}`}
                              >
                                {audit.title}
                              </h4>
                              <p
                                className={`text-sm mt-1 flex items-center gap-2 ${index > 1 ? "text-on-surface-variant/60" : "text-on-surface-variant"}`}
                              >
                                <span
                                  className={`font-semibold ${textColors[colorIdx]}`}
                                >
                                  {audit.target_recipient
                                    ? `Target: ${audit.target_recipient}`
                                    : `Oleh: ${audit.actor}`}
                                </span>{" "}
                                &bull;{" "}
                                {format(
                                  new Date(audit.time_formatted),
                                  "dd MMM yyyy, HH:mm",
                                  { locale: id },
                                )}
                              </p>
                              <p
                                className={`font-public-sans text-[10px] font-bold uppercase tracking-widest mt-3 w-fit px-2 py-1 rounded ${textColors[colorIdx]} ${bgColors[colorIdx]}`}
                              >
                                {audit.status_badge}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </GlassContainer>
              </section>
            </>
          ) : null}

          {/* Decorative Trust Badge Bottom */}
          <div className="mt-16 flex justify-center opacity-60 pb-8">
            <div className="flex items-center gap-2 px-6 py-3 bg-secondary-container/50 rounded-full border border-secondary/10">
              <MdOutlineCheckCircle className="text-secondary text-2xl" />
              <span className="font-public-sans text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Sistem Kunjungan dan Donasi v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <GlassContainer
            key={i}
            className="p-8 flex flex-col gap-4 shadow-ambient h-[180px] animate-pulse"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200"></div>
            <div className="mt-2 space-y-3">
              <div className="w-32 h-3 bg-slate-200 rounded-full"></div>
              <div className="w-16 h-10 bg-slate-200 rounded-full"></div>
            </div>
          </GlassContainer>
        ))}
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        <section className="lg:w-[60%]">
          <GlassContainer className="p-8 shadow-ambient flex flex-col h-full min-h-[400px] animate-pulse">
            <div className="w-64 h-6 bg-slate-200 rounded-full mb-8"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          </GlassContainer>
        </section>

        <section className="lg:w-[40%]">
          <GlassContainer className="p-8 shadow-ambient flex flex-col h-full min-h-[400px] animate-pulse">
            <div className="w-40 h-6 bg-slate-200 rounded-full mb-8"></div>
            <div className="space-y-8 pl-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-48 h-4 bg-slate-200 rounded-full"></div>
                  <div className="w-32 h-3 bg-slate-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </GlassContainer>
        </section>
      </div>
    </>
  );
}
