"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdFormatQuote, MdAccountBalance, MdArrowBack } from "react-icons/md";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const quoteText =
    pathname === "/register"
      ? '"Membangun masa depan yang transparan bersama-sama."'
      : pathname === "/forgot-password" || pathname === "/reset-password"
        ? '"Keamanan adalah pondasi kepercayaan."'
        : '"Memberikan masa depan yang lebih baik..."';
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden bg-surface">
      {/* Left Column: Visual & Trust Section */}
      <section className="hidden md:block relative w-1/2 min-h-screen">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Anak-anak belajar bersama"
            className="w-full h-full object-cover"
            src="/example_img/kids-7.png"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
        </div>

        {/* Glassmorphism Card Overlay */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-ambient max-w-lg">
            <MdFormatQuote className="text-black/70 mb-4 text-4xl" />
            <p className="text-black/60 text-lg md:text-xl font-medium leading-relaxed italic mb-4 font-sans border-none shadow-sm">
              {quoteText}
            </p>
            <div className="flex items-center gap-3 mt-8">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <MdAccountBalance className="text-secondary text-xl" />
              </div>
              <div>
                <p className="text-sm font-bold text-black/80 font-public-sans">
                  Panti Asuhan Dr. J. Lucas
                </p>
                <p className="text-xs text-black/80 font-public-sans">
                  Keluarga untuk setiap anak
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Authentication Form Container */}
      <section className="w-full md:w-1/2 flex items-center justify-center pt-24 px-6 py-16 md:px-20 lg:px-32">
        <div className="w-full max-w-md">{children}</div>
      </section>

      {/* Footer Return Route Standard Header */}
      <div className="absolute top-4 left-4 md:top-8 md:right-8 md:left-auto z-20 pt-8 pl-2">
        <Link
          href="/"
          className="text-on-surface-variant hover:text-primary font-public-sans text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
        >
          <MdArrowBack className="text-lg font-light" />
          Kembali
        </Link>
      </div>
    </div>
  );
}
