"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MdOutlineSecurity,
  MdArrowForward,
  MdInfoOutline,
} from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth"; // Injeksi Hook Autentikasi

export default function RegisterPage() {
  // 1. Deklarasi Entitas State dan Hook
  const { register, loading, errors } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "", // Penambahan parameter wajib
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2. Definisi Handler Mutasi Data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Definisi Handler Transmisi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
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
          Bergabung Bersama Kami
        </h1>
        <p className="text-on-surface-variant leading-relaxed font-sans">
          Buat akun untuk mulai menjadwalkan kunjungan Anda.
        </p>
      </header>

      {/* Tangkapan Error Global (Status 500) */}
      {errors?.general && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
          <MdInfoOutline className="text-red-500 mt-0.5 text-lg shrink-0" />
          <p className="text-sm text-red-500 font-sans leading-relaxed">
            {errors.general[0]}
          </p>
        </div>
      )}

      {/* Pengikatan Form ke Handler Transmisi */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* Name Input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="text-[11px] font-public-sans font-bold text-on-surface-variant uppercase tracking-widest"
            >
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name" // Identitas parameter wajib
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Cth: Tan Malaka"
              className={`w-full py-3 bg-transparent border-0 border-b ${errors?.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"} focus:ring-0 focus:border-b-2 px-0 text-on-surface transition-colors outline-none`}
              required
            />
            {errors?.name && (
              <span className="text-xs text-red-500 mt-1">
                {errors.name[0]}
              </span>
            )}
          </div>

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
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className={`w-full py-3 bg-transparent border-0 border-b ${errors?.email ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"} focus:ring-0 focus:border-b-2 px-0 text-on-surface transition-colors outline-none`}
              required
            />
            {errors?.email && (
              <span className="text-xs text-red-500 mt-1">
                {errors.email[0]}
              </span>
            )}
          </div>

          {/* Password Input */}
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
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full py-3 bg-transparent border-0 border-b ${errors?.password ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"} focus:ring-0 focus:border-b-2 px-0 pr-10 text-on-surface transition-colors outline-none`}
                required
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
            {errors?.password && (
              <span className="text-xs text-red-500 mt-1">
                {errors.password[0]}
              </span>
            )}
          </div>

          {/* Password Confirmation Input (Arsitektur Baru) */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password_confirmation"
              className="text-[11px] font-public-sans font-bold text-on-surface-variant uppercase tracking-widest"
            >
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-b-2 focus:border-primary px-0 pr-10 text-on-surface transition-colors outline-none"
                required
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

        {/* Info Box */}
        <div className="flex items-start gap-3 py-2">
          <MdInfoOutline className="text-primary mt-0.5 text-lg shrink-0" />
          <p className="text-sm text-on-surface-variant font-sans leading-relaxed opacity-80">
            Setelah mendaftar, kami akan mengirimkan tautan verifikasi ke email
            Anda. Akun Anda baru dapat digunakan setelah email diverifikasi.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Modifikasi State Loading pada Tombol */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-primary hover:bg-primary-container text-white hover:text-on-primary-container rounded-xl font-bold flex justify-center items-center gap-2 text-lg transition-colors shadow-sm ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Memvalidasi..." : "Daftar Akun"}
            {!loading && <MdArrowForward className="text-xl" />}
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
          Sudah memiliki akun?{" "}
          <Link
            className="text-primary font-bold hover:underline ml-1"
            href="/login"
          >
            Masuk di sini
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
