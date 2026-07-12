"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProfileForm from "@/components/profile/ProfileForm";

/* ═══════════════════════════════════════════════════════════════
   LAZY IMPORT — The ProfilPublik page is a heavy component with
   react-hook-form, tabs, history cards, etc. We import it as-is
   to reuse its full UI without duplication (AGENTS.md §6).
   ═══════════════════════════════════════════════════════════════ */
import ProfilPublikPage from "@/app/(profile)/profil-publik/page";

/**
 * /profil-saya — Consolidated Profile Page (Component Router)
 *
 * Fetches the authenticated user on mount. Based on the `role` property:
 * - PENGUNJUNG   → renders the full ProfilPublikPage (tabs, donation/visit history)
 * - PENGURUS_PANTI → renders ProfileForm with role label "PENGURUS PANTI"
 * - KEPALA_PANTI   → renders ProfileForm with role label "KEPALA PANTI"
 *
 * If not authenticated, redirects to /login with callbackUrl.
 */
export default function ProfilSayaPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  /* ── Not Authenticated → Redirect to Login (via useEffect to avoid React warnings) ── */
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push("/login?callbackUrl=%2Fprofil-saya");
    }
  }, [isLoading, isAuthenticated, user, router]);

  /* ── Loading State ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-20 h-20 rounded-full bg-teal-100/50" />
          <div className="w-48 h-4 rounded-lg bg-gray-200" />
          <div className="w-32 h-3 rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  /* ── Not Authenticated — show nothing while redirecting ── */
  if (!isAuthenticated || !user) {
    return null;
  }

  /* ── PENGUNJUNG → Full Public Profile (tabs, history, metrics) ── */
  if (user.role === "PENGUNJUNG") {
    return <ProfilPublikPage />;
  }

  /* ── PENGURUS_PANTI / KEPALA_PANTI → Shared ProfileForm ── */
  const roleLabel = user.role === "PENGURUS_PANTI" ? "PENGURUS PANTI" : "KEPALA PANTI";

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-28 pb-20 px-6">
      <ProfileForm
        roleLabel={roleLabel}
        defaultValues={{
          fullName: user.name,
          email: user.email,
          phone: user.phone || "",
        }}
      />
    </div>
  );
}
