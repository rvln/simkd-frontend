"use client";

import React, { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MdOutlineSecurity,
  MdArrowForward,
  MdArrowBack,
} from "react-icons/md";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract token and email from URL query params
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  // Form state
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Guard: if token or email is missing, show error
  if (!token || !email) {
    return (
      <>
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 mb-8">
            <MdOutlineSecurity className="text-3xl text-primary" />
            <span className="text-base font-black tracking-tight text-primary uppercase font-sans">
              Panti Asuhan Dr. J. Lucas
            </span>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2 font-sans">
            Link Tidak Valid
          </h1>
        </header>

        <div className="flex items-start gap-3 bg-red-50/80 rounded-xl px-5 py-4">
          <FiAlertCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-600 leading-relaxed">
            Link reset kata sandi tidak valid atau sudah kadaluarsa. Silakan
            minta link baru melalui halaman lupa kata sandi.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <Link
            href="/forgot-password"
            className="w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 text-lg bg-primary hover:bg-primary-container text-white hover:text-on-primary-container transition-colors shadow-sm"
          >
            Minta Link Baru
            <MdArrowForward className="text-xl" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary font-sans text-sm font-medium transition-colors py-2"
          >
            <MdArrowBack className="text-base" />
            Kembali ke halaman masuk
          </Link>
        </div>
      </>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            token,
            password,
            password_confirmation: passwordConfirmation,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 422) {
        if (data.errors) {
          const msgs = Object.values(data.errors).flat().join(" ");
          setErrorMessage(msgs);
        } else {
          setErrorMessage(
            data.message || "Data tidak valid. Periksa kembali input Anda."
          );
        }
        return;
      }

      if (!res.ok) {
        setErrorMessage(
          data.message || "Terjadi kesalahan. Silakan coba lagi."
        );
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <>
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 mb-8">
            <MdOutlineSecurity className="text-3xl text-primary" />
            <span className="text-base font-black tracking-tight text-primary uppercase font-sans">
              Panti Asuhan Dr. J. Lucas
            </span>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2 font-sans">
            Kata Sandi Berhasil Direset
          </h1>
        </header>

        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-teal-50/80 rounded-xl px-5 py-5">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-teal-600 text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface font-sans text-sm mb-1">
                Reset Berhasil
              </h3>
              <p className="text-sm text-on-surface-variant font-sans leading-relaxed">
                Kata sandi Anda telah berhasil diperbarui. Silakan masuk
                menggunakan kata sandi baru Anda.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 text-lg bg-primary hover:bg-primary-container text-white hover:text-on-primary-container transition-colors shadow-sm"
          >
            Masuk Ke Akun
            <MdArrowForward className="text-xl" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 mb-8">
          <MdOutlineSecurity className="text-3xl text-primary" />
          <span className="text-base font-black tracking-tight text-primary uppercase font-sans">
            Panti Asuhan Dr. J. Lucas
          </span>
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2 font-sans">
          Atur Ulang Kata Sandi
        </h1>
        <p className="text-on-surface-variant leading-relaxed font-sans">
          Masukkan kata sandi baru untuk akun{" "}
          <strong className="text-on-surface">{email}</strong>.
        </p>
      </header>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-8 flex items-start gap-3 bg-red-50/80 rounded-xl px-5 py-4 animate-in fade-in duration-300">
          <FiAlertCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-600 leading-relaxed">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* New Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-[11px] font-public-sans font-bold text-on-surface-variant uppercase tracking-widest"
            >
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password_confirmation"
              className="text-[11px] font-public-sans font-bold text-on-surface-variant uppercase tracking-widest"
            >
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                required
                minLength={8}
                className="w-full py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-b-2 focus:border-primary px-0 pr-10 text-on-surface transition-colors outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi sandi"
                    : "Tampilkan konfirmasi sandi"
                }
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="text-lg" />
                ) : (
                  <FiEye className="text-lg" />
                )}
              </button>
            </div>
          </div>
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
                Menyimpan...
              </>
            ) : (
              <>
                Simpan Kata Sandi Baru
                <MdArrowForward className="text-xl" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Back to Login */}
      <div className="mt-12 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-sans text-sm font-medium transition-colors"
        >
          <MdArrowBack className="text-base" />
          Kembali ke halaman masuk
        </Link>
      </div>
    </>
  );
}

/**
 * Reset Password Page — Server Component shell.
 * ResetPasswordForm uses useSearchParams() which REQUIRES a <Suspense> boundary.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-surface-container-low" />
          <div className="h-10 w-72 rounded bg-surface-container-low" />
          <div className="h-4 w-full max-w-md rounded bg-surface-container-low" />
          <div className="space-y-4 mt-8">
            <div className="h-12 w-full rounded bg-surface-container-low" />
            <div className="h-12 w-full rounded bg-surface-container-low" />
            <div className="h-14 w-full rounded-xl bg-surface-container-low" />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
