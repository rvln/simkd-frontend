"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-[#022C22] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-16">
        {/* Main Columns */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-6 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Image
                  src="/assets/empanti-logo.svg"
                  alt="Empanti"
                  width={20}
                  height={20}
                />
              </div>
              <h3 className="font-sans font-black uppercase tracking-[0.05em] text-white">
                Panti Asuhan Dr. J. Lucas
              </h3>
            </div>
            <p className="font-sans text-sm text-[rgba(209,250,229,0.7)] leading-relaxed">
              Menciptakan transparansi menyeluruh dalam perawatan anak melalui
              arsitektur pelaporan yang jujur dan empati yang mendalam.
            </p>
          </div>

          {/* Navigation Sitemap */}
          <div className="flex flex-col gap-6">
            <h5 className="font-public-sans font-bold text-sm uppercase tracking-[0.2em] text-white">
              NAVIGASI
            </h5>
            <ul className="flex flex-col gap-4 font-sans text-sm text-[rgba(209,250,229,0.6)]">
              <li>
                <Link
                  href="/profil"
                  className="hover:text-white transition-colors"
                >
                  Visi dan Misi
                </Link>
              </li>
              <li>
                <Link
                  href="/jadwal-kunjungan"
                  className="hover:text-white transition-colors"
                >
                  Jadwal Kunjungan
                </Link>
              </li>
              <li>
                <Link
                  href="/donasi/barang"
                  className="hover:text-white transition-colors"
                >
                  Donasi Barang
                </Link>
              </li>
              <li>
                <Link
                  href="/donasi/finansial"
                  className="hover:text-white transition-colors"
                >
                  Donasi Online
                </Link>
              </li>
              <li>
                <Link
                  href="/profil"
                  className="hover:text-white transition-colors"
                >
                  Sejarah
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6 max-w-xs">
            <h5 className="font-public-sans font-bold text-sm uppercase tracking-[0.2em] text-white">
              KONTAK
            </h5>
            <div className="flex flex-col gap-4 font-sans text-sm text-[rgba(209,250,229,0.6)]">
              <div className="flex items-start gap-4">
                <Image
                  src="/assets/location-pin.svg"
                  alt="Location"
                  width={16}
                  height={20}
                  className="mt-1"
                />
                <p>
                  Jl. Karombasan Ling No. 2, Tikala Baru, Kec. Tikala, Kota
                  Manado, Sulawesi Utara.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Image
                  src="/assets/phone-icon.svg"
                  alt="Phone"
                  width={18}
                  height={18}
                />
                <p>0431-864749</p>
              </div>
              <div className="flex items-center gap-4">
                <Image
                  src="/assets/mail-icon.svg"
                  alt="Email"
                  width={20}
                  height={16}
                />
                <p>panti.asuhan.drlucas@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-6 w-full lg:max-w-xs">
            <h5 className="font-public-sans font-bold text-sm uppercase tracking-[0.2em] text-white">
              TETAP TERHUBUNG
            </h5>
            <p className="font-sans text-sm text-[rgba(209,250,229,0.6)]">
              Dapatkan update berkala mengenai perkembangan dan kebutuhan di
              Panti Asuhan Dr. J. Lucas.
            </p>
            <form className="flex w-full" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email Anda"
                className="flex-1 bg-[#064E3B] text-white placeholder:text-[#a9aeb8] font-sans text-sm px-4 py-3 rounded-l-lg outline-none focus:ring-2 focus:ring-[#34D399]"
              />
              <button
                type="submit"
                className="bg-[#85dbba] text-[#022C22] font-sans font-bold text-sm px-5 py-3 rounded-r-lg hover:bg-[#10B981] transition-colors"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(209,250,229,0.1)] flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-public-sans text-xs uppercase tracking-[0.1em] text-[rgba(209,250,229,0.4)]">
            &copy; 2026 Panti Asuhan Dr. J. Lucas. SELURUH HAK CIPTA DILINDUNGI.
          </span>
          <div className="flex items-center gap-8 font-public-sans text-xs uppercase tracking-[0.1em] text-[rgba(209,250,229,0.4)]">
            <Link
              href="/privasi"
              className="hover:text-white transition-colors"
            >
              KEBIJAKAN PRIVASI
            </Link>
            <Link
              href="/layanan"
              className="hover:text-white transition-colors"
            >
              KETENTUAN LAYANAN
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
