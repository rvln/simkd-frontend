"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MdOutlineSecurity, MdArrowForward } from "react-icons/md";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil tujuan dari URL (misal: /jadwal-kunjungan/atur-jadwal)
  const callbackUrl = searchParams.get("callbackUrl");

  // Form input state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // API integration state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Track whether user needs email verification (HTTP 403)
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setShowVerificationBanner(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 403) {
        // Email not verified — show the verification banner
        setShowVerificationBanner(true);
        setErrorMessage(data.message || "Email belum diverifikasi.");
        return;
      }

      if (res.status === 422) {
        // Validation error (invalid credentials)
        if (data.errors) {
          const msgs = Object.values(data.errors).flat().join(" ");
          setErrorMessage(msgs);
        } else {
          setErrorMessage(data.message || "Email atau kata sandi tidak valid.");
        }
        return;
      }

      if (!res.ok) {
        setErrorMessage(
          data.message || "Terjadi kesalahan. Silakan coba lagi.",
        );
        return;
      }

      // Success — extract and store token
      const token = data.data?.token;
      if (!token) {
        setErrorMessage("Respons server tidak valid. Token tidak ditemukan.");
        return;
      }

      localStorage.setItem("auth_token", token);
      // LOGIKA PENGALIHAN CERDAS
      if (callbackUrl) {
        // Jika URL membawa niat awal, kembalikan ke sana
        router.push(decodeURIComponent(callbackUrl));
      } else {
        // Jika login biasa, arahkan ke beranda atau dasbor default
        router.push("/");
      }
    } catch {
      setErrorMessage(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage("Masukkan alamat email terlebih dahulu.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resend-verification`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setErrorMessage("");
        setShowVerificationBanner(true);
        alert(
          "Email verifikasi telah dikirim ulang. Silakan periksa inbox Anda.",
        );
      } else {
        setErrorMessage(data.message || "Gagal mengirim ulang verifikasi.");
      }
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server.");
    }
  };

  return (
    <>
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 mb-6">
          <MdOutlineSecurity className="text-3xl text-primary" />
          <span className="text-base font-black tracking-tight text-primary uppercase font-sans">
            Panti Asuhan Dr. J. Lucas
          </span>
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2 font-sans">
          Selamat Datang
        </h1>
        <p className="text-on-surface-variant leading-relaxed font-sans">
          Silakan masuk untuk melanjutkan akses dan bergabung terlibat bersama
          panti.
        </p>
      </header>

      {/* Verification Banner — shown when API returns HTTP 403 */}
      {showVerificationBanner && (
        <div className="mb-8 p-4 bg-red-50 rounded-lg flex items-center justify-between animate-in fade-in duration-300">
          <span className="text-sm font-semibold text-red-700">
            Email Anda belum diverifikasi
          </span>
          <button
            type="button"
            onClick={handleResendVerification}
            className="text-xs font-bold text-red-700 hover:text-red-800 underline tracking-wider uppercase"
          >
            Kirim Ulang Verifikasi
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && !showVerificationBanner && (
        <div className="mb-8 flex items-start gap-3 bg-red-50/80 rounded-xl px-5 py-4 animate-in fade-in duration-300">
          <FiAlertCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-600 leading-relaxed">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-[11px] font-public-sans font-bold text-on-surface-variant uppercase tracking-widest"
            >
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-b-2 focus:border-primary px-0 text-on-surface transition-colors outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-[11px] font-public-sans font-bold text-on-surface-variant uppercase tracking-widest"
              >
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-primary hover:text-on-primary-fixed-variant transition-colors font-public-sans uppercase tracking-widest"
              >
                Lupa Sandi?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-b-2 focus:border-primary px-0 pr-10 text-on-surface transition-colors outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
              >
                {showPassword ? (
                  <FiEyeOff className="text-lg" />
                ) : (
                  <FiEye className="text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <input
            className="rounded border-gray-300 text-primary focus:ring-primary-container h-4 w-4 bg-transparent cursor-pointer"
            id="remember"
            type="checkbox"
          />
          <label
            className="text-sm text-on-surface-variant font-sans cursor-pointer"
            htmlFor="remember"
          >
            Ingat saya di perangkat ini
          </label>
        </div>

        <div className="space-y-4 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 text-lg transition-colors shadow-sm ${
              isLoading
                ? "bg-surface-dim text-on-surface-variant cursor-not-allowed"
                : "bg-primary hover:bg-primary-container text-white hover:text-on-primary-container"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Memproses...
              </>
            ) : (
              <>
                Masuk Ke Akun
                <MdArrowForward className="text-xl" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-4 text-outline-variant font-medium font-sans">
                atau
              </span>
            </div>
          </div>

          {/* Secondary Button / SSO */}
          <button
            onClick={() =>
              (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`)
            }
            className="w-full py-4 bg-surface-container-lowest text-on-surface font-semibold rounded-xl border border-outline-variant/20 shadow-sm hover:bg-surface-container-highest transition-all duration-200 flex items-center justify-center gap-3 font-sans cursor-pointer"
            type="button"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </form>

      {/* Toggle Links & Footer */}
      <div className="mt-12 text-center flex flex-col gap-8">
        <p className="text-on-surface-variant font-sans text-sm">
          Belum memiliki akun?{" "}
          <Link
            className="text-primary font-bold hover:underline ml-1"
            href="/register"
          >
            Daftar sekarang
          </Link>
        </p>

        <div className="flex items-center justify-center gap-6 font-public-sans text-xs uppercase tracking-widest text-on-surface-variant/60">
          <Link
            href="/privasi"
            className="hover:text-primary transition-colors"
          >
            Kebijakan Privasi
          </Link>
          <span>&bull;</span>
          <Link
            href="/ketentuan"
            className="hover:text-primary transition-colors"
          >
            Ketentuan Layanan
          </Link>
        </div>
      </div>
    </>
  );
}
