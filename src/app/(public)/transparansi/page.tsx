import React, { Suspense } from "react";
import { GlassContainer } from "@/components/ui/GlassContainer";
import type { Metadata } from "next";
import TransparansiContent from "./TransparansiContent";

export const metadata: Metadata = {
  title: "Portal Transparansi | Panti Asuhan Dr. J. Lucas",
  description:
    "Jejak kebaikan real-time. Pantau secara langsung bagaimana setiap donasi dan kunjungan membawa dampak nyata di Panti Asuhan Dr. J. Lucas.",
};

/* ═══════════════════════════════════════════
   Full-Page Skeleton Fallback for Suspense
   ═══════════════════════════════════════════ */
function TransparansiSkeleton() {
  return (
    <>
      {/* Skeleton: Kebutuhan */}
      <section className="bg-surface-container-low px- md:px-12 lg:px-20 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="h-3 w-32 rounded bg-surface-container-lowest mb-3 animate-pulse" />
            <div className="h-7 w-72 rounded bg-surface-container-lowest animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassContainer
                key={i}
                className="p-6 flex flex-col gap-5 animate-pulse"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* Skeleton: Donasi */}
      <section className="bg-surface px-6 md:px-12 lg:px-20 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20">
          <div>
            <div className="h-3 w-28 rounded bg-surface-container-low mb-3 animate-pulse" />
            <div className="h-7 w-80 rounded bg-surface-container-low mb-5 animate-pulse" />
            <div className="h-16 w-full max-w-md rounded bg-surface-container-low animate-pulse" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <GlassContainer
                key={i}
                className="px-5 py-4 flex items-center gap-4 animate-pulse"
              >
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
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════
   PAGE — Server Component (SEO Metadata)
   ══════════════════════════════════════════ */
export default function TransparansiPage() {
  return (
    <div className="bg-surface">
      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO (Static, Server-Rendered)
      ═══════════════════════════════════════════ */}
      <section className="bg-surface px-6 md:px-12 lg:px-20 pt-18 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.08] text-on-surface mb-6 italic">
            Jejak Kebaikan Real-Time
          </h1>
          <p className="text-on-surface-variant font-sans text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Komitmen mutlak kami pada keterbukaan arsitektural. Pantau secara
            langsung bagaimana setiap donasi dan kunjungan membawa dampak nyata.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DYNAMIC SECTIONS — Client Component in Suspense
          Wrapping useSearchParams() in Suspense is REQUIRED
          by Next.js App Router to prevent static render de-opt.
      ═══════════════════════════════════════════ */}
      <Suspense fallback={<TransparansiSkeleton />}>
        <TransparansiContent />
      </Suspense>
    </div>
  );
}
