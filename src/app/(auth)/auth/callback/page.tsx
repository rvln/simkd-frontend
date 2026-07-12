"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { MdLoop } from "react-icons/md";
import { fetcher } from "@/lib/fetcher"; // Import fetcher untuk ambil data profil

function AuthCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      // Extract token from URL fragment instead of query string
      const hash = window.location.hash;
      const match = hash.match(/#token=([^&]+)/);
      const token = match ? decodeURIComponent(match[1]) : null;

      if (token) {
        // Hapus token dari URL (meningkatkan keamanan, membersihkan fragment)
        window.history.replaceState(null, "", window.location.pathname);

        // 1. Simpan token ke localStorage
        localStorage.setItem("auth_token", token);

        // Beri event storage agar sistem tahu ada perubahan login
        window.dispatchEvent(new Event("storage"));

        try {
          // 2. Ambil data user di latar belakang untuk mengecek Role
          const response: any = await fetcher("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const user = response.data;

          // 3. Redirect Cerdas: PENGUNJUNG ke /profil, sisanya ke /dashboard
          if (user.role === "PENGUNJUNG") {
            router.push("/profil");
          } else {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Gagal mengambil profil saat callback:", error);
          // Jika gagal, default ke profil sebagai langkah aman
          router.push("/profil");
        }
      } else {
        // Jika tidak ada token, balik ke login
        router.push("/login?error=no_token");
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <MdLoop className="text-5xl text-primary animate-spin" />
      <p className="text-on-surface-variant font-medium font-sans">
        Menyelesaikan autentikasi...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <MdLoop className="text-5xl text-primary animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
