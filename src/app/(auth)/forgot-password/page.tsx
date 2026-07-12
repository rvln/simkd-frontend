"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { MdOutlineSecurity, MdArrowForward, MdArrowBack } from "react-icons/md";
import { FiAlertCircle, FiCheckCircle, FiMail } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.status === 422) {
        if (data.errors) {
          const msgs = Object.values(data.errors).flat().join(" ");
          setErrorMessage(msgs);
        } else {
          setErrorMessage(data.message || "Email tidak valid.");
        }
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.message || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      // Always show success (backend doesn't reveal if email exists)
      setIsSuccess(true);
    } catch {
      setErrorMessage(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          Lupa Kata Sandi?
        </h1>
        <p className="text-on-surface-variant leading-relaxed font-sans">
          Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk
          mengatur ulang kata sandi.
        </p>
      </header>

      {/* Success State */}
      {isSuccess ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-teal-50/80 rounded-xl px-5 py-5">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-teal-600 text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface font-sans text-sm mb-1">
                Email Terkirim
              </h3>
              <p className="text-sm text-on-surface-variant font-sans leading-relaxed">
                Jika email <strong className="text-on-surface">{email}</strong>{" "}
                terdaftar di sistem kami, Anda akan menerima tautan untuk mengatur
                ulang kata sandi. Silakan periksa inbox dan folder spam Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <FiMail className="text-on-surface-variant text-base" />
            <p className="text-sm text-on-surface-variant font-sans">
              Tidak menerima email?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setErrorMessage("");
                }}
                className="text-primary font-bold hover:underline"
              >
                Kirim ulang
              </button>
            </p>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-lg bg-primary hover:bg-primary-container text-white hover:text-on-primary-container transition-colors shadow-sm"
          >
            <MdArrowBack className="text-xl" />
            Kembali ke Halaman Masuk
          </Link>
        </div>
      ) : (
        <>
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-8 flex items-start gap-3 bg-red-50/80 rounded-xl px-5 py-4 animate-in fade-in duration-300">
              <FiAlertCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-red-600 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
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
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Link Reset
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
      )}
    </>
  );
}
