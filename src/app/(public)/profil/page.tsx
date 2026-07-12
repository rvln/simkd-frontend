import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  FiHome,
  FiBookOpen,
  FiHeart,
  FiShield,
  FiUsers,
  FiArrowRight,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";
import { FaQuoteLeft, FaChild, FaHandsHelping } from "react-icons/fa";
import { MdOutlineHealthAndSafety, MdOutlineGroups } from "react-icons/md";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Panti | Panti Asuhan Dr. J. Lucas",
  description:
    "Kenali sejarah, visi, misi, dan sistem pengasuhan berbasis keluarga di Panti Asuhan Dr. J. Lucas Manado. Dikelola oleh Kongregasi MSC sejak 1974.",
};

/* ───── Mission Pillar data ───── */
const missionPillars = [
  {
    icon: <FiHome className="text-2xl text-primary" />,
    text: "Menyediakan lingkungan pengasuhan yang aman, hangat, dan bermartabat.",
  },
  {
    icon: <FiBookOpen className="text-2xl text-primary" />,
    text: "Memberikan akses pendidikan berkualitas untuk kemandirian masa depan.",
  },
  {
    icon: <FiUsers className="text-2xl text-primary" />,
    text: "Menerapkan sistem pengasuhan berbasis keluarga (Unit-Unit Keluarga).",
  },
  {
    icon: <MdOutlineHealthAndSafety className="text-2xl text-primary" />,
    text: "Menjamin kesehatan fisik dan mental anak melalui pendampingan berkelanjutan dan gizi seimbang.",
  },
  {
    icon: <MdOutlineGroups className="text-2xl text-primary" />,
    text: "Mengintegrasikan anak-anak dengan kehidupan sosial kemasyarakatan.",
  },
];

/* ───── Family Unit data ───── */
const familyUnits = [
  {
    number: "IV",
    name: "Unit Keluarga IV",
    desc: "Fokus pada pendampingan anak usia dini dan pengajaran kognitif dasar.",
  },
  {
    number: "V",
    name: "Unit Keluarga V",
    desc: "Konsentrasi pada pendidikan tingkat menengah dan pengembangan bakat seni.",
  },
  {
    number: "VI",
    name: "Unit Keluarga VI",
    desc: "Mempersiapkan kemandirian bagi remaja akhir menuju jenjang pendidikan tinggi.",
  },
];

export default function ProfilPage() {
  return (
    <div className="bg-surface">
      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-surface px-6 md:px-12 lg:pb-12 lg:px-20 pt-20 pb-8 md:pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          {/* Left */}
          <div>
            <span className="inline-block font-public-sans text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-4">
              Tentang Kami
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-on-surface mb-6">
              Meneruskan <br />
              <span className="text-primary">Warisan Kasih.</span>
            </h1>
            <p className="text-on-surface-variant font-public-sans text-base md:text-lg leading-relaxed max-w-lg">
              Sejak 1974, Panti Asuhan Dr. J. Lucas telah tumbuh dari sebuah
              visi sederhana menjadi sebuah perlindungan yang kokoh bagi masa
              depan anak-anak di bawah bimbingan MSC.
            </p>
          </div>

          {/* Right — Impact Stat */}
          <GlassContainer className="px-8 py-6 text-center min-w-[160px]">
            <span className="block text-4xl md:text-5xl font-black text-primary tracking-tight">
              50+
            </span>
            <span className="font-public-sans text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant mt-1 block">
              Tahun Dedikasi
            </span>
          </GlassContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — AKAR PENGABDIAN (Origin Story)
      ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-low px-6 md:px-12 lg:px-20 lg:pt-12 pb-8 lg:pb-12 py-12 lg:py-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image placeholder */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-lowest shadow-ambient">
            <Image
              src="/example_img/panti.jpg"
              alt="Sejarah Panti Asuhan Dr. J. Lucas"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface mb-2">
              Akar Pengabdian
            </h2>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight text-primary mb-8">
              Dr. J. Lucas
            </h3>

            <div className="space-y-5 text-on-surface-variant text-base leading-[1.7] font-sans">
              <p>
                Didirikan pada tahun 1974 oleh Missionari Sacratissimi Cordis
                (MSC), lembaga ini lahir dari keprihatinan mendalam terhadap
                kesejahteraan anak-anak yatim piatu di wilayah ini.
              </p>
              <p>
                Nama Dr. J. Lucas diabadikan sebagai penghormatan atas semangat
                kemanusiaan yang beliau contohkan—sebuah komitmen untuk
                menyediakan tidak hanya tempat tinggal, tetapi juga
                &lsquo;rumah&rsquo; bagi pertumbuhan jiwa.
              </p>
            </div>

            {/* <Link
              href="/sejarah"
              className="inline-flex items-center gap-2 mt-8 font-public-sans font-bold text-sm text-primary hover:text-primary-container transition-colors group"
            >
              Pelajari Arsip Kami
              <FiArrowRight className="text-lg transition-transform group-hover:translate-x-1" />
            </Link> */}
          </div>
        </div>

        {/* Motto pill */}
        <div className="flex justify-center mt-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-full font-public-sans text-sm font-bold tracking-wide shadow-ambient">
            &ldquo;In Lumine Tuo Videbimus Lumen&rdquo;
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — VISI & MISI
      ═══════════════════════════════════════════ */}
      <section className="bg-surface lg:pt-12 lg:pb-12 px-6 md:px-12 lg:px-20 py-12 lg:py-28">
        <div className="max-w-5xl mx-auto text-center">
          {/* Section title */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-primary mb-2">
            Visi &amp; Misi
          </h2>
          <div className="w-12 h-1 rounded-full bg-primary mx-auto mb-12" />

          {/* Vision label */}
          <span className="inline-block font-public-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-6">
            Visi Kami
          </span>

          {/* Vision statement */}
          <blockquote className="text-2xl md:text-3xl lg:text-[2rem] font-black tracking-tight leading-snug text-on-surface max-w-3xl mx-auto mb-16">
            Membangun generasi mandiri yang berintegritas, penuh kasih, dan
            menjadi terang bagi sesama melalui pengasuhan berbasis kekeluargaan.
          </blockquote>

          {/* Mission pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10 text-left max-w-4xl mx-auto">
            {missionPillars.map((pillar, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                  {pillar.icon}
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — SISTEM PENGASUHAN BERBASIS KELUARGA
      ═══════════════════════════════════════════ */}
      <section className="bg-surface-container-low px-6 md:px-12 lg:pt-12 lg:pb-12 lg:px-20 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-3">
                Sistem Pengasuhan Berbasis Keluarga
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-xl font-sans">
                Di bawah naungan Pastor Frans (MSC), kami meninggalkan model
                asrama tradisional menuju model unit keluarga yang lebih intim.
              </p>
            </div>
            {/* <Link
              href="/struktur"
              className="flex items-center gap-2 text-primary font-public-sans font-bold text-xs uppercase tracking-widest hover:text-primary-container transition-colors shrink-0"
            >
              <FiExternalLink />
              Struktur Aktif 2026
            </Link> */}
          </div>

          {/* Unit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {familyUnits.map((unit) => (
              <GlassContainer
                key={unit.number}
                className="p-6 flex flex-col justify-between min-h-[200px] relative overflow-hidden"
              >
                {/* Active badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-tertiary/15 text-tertiary font-public-sans text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block" />
                    Aktif
                  </span>
                </div>

                {/* Roman numeral */}
                <span className="font-black text-3xl text-primary/20 font-sans mb-4">
                  {unit.number}
                </span>

                {/* Info */}
                <div>
                  <h4 className="font-bold text-base text-on-surface font-sans mb-2">
                    {unit.name}
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
                    {unit.desc}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline-variant/10">
                  <FaChild className="text-primary/50 text-sm" />
                  <span className="font-public-sans text-[11px] text-on-surface-variant font-semibold">
                    Keluarga Pengasuh Aktif
                  </span>
                </div>
              </GlassContainer>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4.5 — STRUKTUR ORGANISASI
      ═══════════════════════════════════════════ */}
      <section className="bg-surface px-6 md:px-12 lg:pb-12 pb-8 lg:px-20 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-3">
              Struktur Organisasi
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xl mx-auto font-sans">
              Susunan pengurus Panti Asuhan Dr. J. Lucas Manado yang berdedikasi
              dalam melayani dan membimbing anak-anak dengan kasih sayang.
            </p>
          </div>

          {/* Org Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { role: "PENASEHAT", name: "Pdt. Dr. J. Lucas, M.Th." },
              { role: "KETUA", name: "Ibu Ny. F. Lucas-M." },
              { role: "SEKRETARIS", name: "Ibu Ny. J. Sumampouw-L." },
              { role: "BENDAHARA", name: "Ibu Ny. A. Lucas-P." },
              { role: "SEKSI USAHA", name: "Bpk. J. Kereh." },
              { role: "SEKSI PEMELIHARAAN", name: "Ibu Ny. S. Lucas-K." },
              {
                role: "SEKSI PENDIDIKAN / ROHANI",
                name: "Pdt. J. Sumampouw, S.Th.",
              },
            ].map((member, i) => (
              <GlassContainer
                key={i}
                className="p-6 flex flex-col justify-center text-center transition-all hover:shadow-ambient"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <FiUsers className="text-xl" />
                </div>
                <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-1">
                  {member.role}
                </span>
                <h4 className="font-bold text-base text-on-surface font-sans">
                  {member.name}
                </h4>
              </GlassContainer>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — FOUNDER QUOTE
      ═══════════════════════════════════════════ */}
      <section className="bg-surface px-6 md:px-12 lg:pt-12 lg:pb-12 pt-8 pb-8 lg:px-20 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <GlassContainer className="px-8 md:px-12 py-10 md:py-12 flex flex-col md:flex-row items-start gap-8 bg-surface-container-low/60">
            {/* Avatar */}
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center overflow-hidden shadow-ambient">
              <FaHandsHelping className="text-white text-2xl" />
            </div>

            {/* Quote body */}
            <div className="flex-1">
              <h4 className="font-bold text-lg text-on-surface font-sans mb-1">
                Pastor Frans, MSC
              </h4>
              <span className="font-public-sans text-[10px] font-bold uppercase tracking-[0.16em] text-primary mb-4 block">
                Ketua Yayasan &amp; Pembimbing Rohani
              </span>
              <div className="relative">
                <FaQuoteLeft className="absolute -top-1 -left-1 text-primary/15 text-2xl" />
                <p className="text-on-surface-variant text-sm leading-[1.75] font-sans pl-6 italic">
                  &ldquo;Tugas kita bukan sekadar memberi makan, melainkan
                  menumbuhkan martabat mereka sebagai citra Allah yang
                  merdeka.&rdquo;
                </p>
              </div>
            </div>
          </GlassContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — TRANSPARENCY PLEDGE
      ═══════════════════════════════════════════ */}
      {/* <section className="bg-surface-container-low px-6 md:px-12 lg:pt-12 lg:pb-12 lg:px-20 py-20 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-8">
            Keterbukaan adalah <span className="text-primary">Janji Kami.</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/transparansi/laporan-tahunan"
              className="inline-flex items-center gap-2.5 bg-surface-container-lowest px-6 py-3.5 rounded-xl font-public-sans text-sm font-semibold text-on-surface hover:shadow-ambient transition-all border border-outline-variant/15"
            >
              <FiFileText className="text-primary text-lg" />
              Laporan Tahunan 2023
            </Link>

            <Link
              href="/transparansi/audit-eksternal"
              className="inline-flex items-center gap-2.5 bg-surface-container-lowest px-6 py-3.5 rounded-xl font-public-sans text-sm font-semibold text-on-surface hover:shadow-ambient transition-all border border-outline-variant/15"
            >
              <FiShield className="text-primary text-lg" />
              Audit Keuangan Eksternal
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}
