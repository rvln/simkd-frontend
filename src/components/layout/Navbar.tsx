"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiChevronDown,
  FiDollarSign,
  FiPackage,
  FiUser,
  FiGrid,
  FiMenu,
  FiX,
} from "react-icons/fi";
import LogoutButton from "@/components/layout/LogoutButton";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil Panti" },
  { href: "/transparansi", label: "Transparansi" },
  { href: "/jadwal-kunjungan", label: "Jadwal Kunjungan" },
  { href: "/kontak", label: "Kontak" },
];

const donasiSubmenus = [
  {
    href: "/donasi/finansial",
    label: "Donasi Finansial",
    desc: "Transfer dana secara aman via Midtrans",
    icon: <FiDollarSign className="text-lg text-primary" />,
  },
  {
    href: "/donasi/barang",
    label: "Donasi Barang",
    desc: "Kirim bantuan fisik ke gudang panti",
    icon: <FiPackage className="text-lg text-primary" />,
  },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [donasiOpen, setDonasiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDonasiOpen, setMobileDonasiOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Server-authoritative auth state (replaces the old isLoggedIn mock)
  const { user, isLoading, isAuthenticated } = useAuth();

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [tickerMessages, setTickerMessages] = useState<string[]>([]);

  useEffect(() => {
    setProfilePhotoUrl(user?.avatar || null);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTickerMessages([]);
      return;
    }
    const fetchTicker = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/ticker-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTickerMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to fetch ticker stats", err);
      }
    };
    
    fetchTicker();
    const interval = setInterval(fetchTicker, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDonasiOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setDonasiOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
    setMobileDonasiOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => pathname === href;
  const isDonasiActive = pathname.startsWith("/donasi");

  const linkBase =
    "font-sans font-medium text-on-surface-variant hover:text-primary transition-colors text-base tracking-tight";
  const linkActive =
    "font-sans font-bold text-primary border-b-2 border-primary pb-1 text-base tracking-tight";

  /* ── Derive the dashboard link based on the user's role ── */
  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case "PENGURUS_PANTI":
        return { href: "/dashboard", label: "Dasbor Panti" };
      case "KEPALA_PANTI":
        return { href: "/dashboard-kepala-panti", label: "Dasbor Panti" };
      default:
        return null; // PENGUNJUNG — no dashboard access
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <>
      {tickerMessages.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-teal-800 to-teal-700 text-teal-50 text-xs py-2 px-4 flex items-center justify-center font-sans tracking-wide">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-ellipsis max-w-full">
            <span className="font-bold flex-shrink-0">INFO:</span>
            <span className="truncate">{tickerMessages.join(" • ")}</span>
          </div>
        </div>
      )}
      <nav className={`fixed left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm transition-all duration-300 ${tickerMessages.length > 0 ? "top-8" : "top-0"}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-sans font-black text-base text-primary tracking-tighter">
            Panti Asuhan Dr. J. Lucas
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? linkActive : linkBase}
            >
              {link.label}
            </Link>
          ))}

          {/* Donasi Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDonasiOpen((v) => !v)}
              className={`flex items-center gap-1 transition-colors text-base tracking-tight ${
                isDonasiActive
                  ? "font-bold text-primary border-b-2 border-primary pb-1"
                  : "font-medium text-on-surface-variant hover:text-primary"
              }`}
            >
              Donasi
              <FiChevronDown
                className={`text-sm transition-transform duration-200 ${
                  donasiOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown panel */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-surface/95 backdrop-blur-xl rounded-xl shadow-ambient border border-outline-variant/10 overflow-hidden transition-all duration-200 origin-top ${
                donasiOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {donasiSubmenus.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors group"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mt-0.5 group-hover:bg-primary/15 transition-colors">
                    {sub.icon}
                  </div>
                  <div>
                    <span className="block font-sans font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                      {sub.label}
                    </span>
                    <span className="block font-public-sans text-xs text-on-surface-variant mt-0.5">
                      {sub.desc}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {navLinks.slice(3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? linkActive : linkBase}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth CTA (Desktop) + Mobile Hamburger */}
        <div className="flex items-center gap-4">
          {/* Desktop Auth CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-32 h-10 rounded-full bg-surface-container-low animate-pulse" />
            ) : isAuthenticated && user ? (
              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 font-sans font-bold text-on-surface hover:text-primary transition-colors text-sm px-3 py-1.5 bg-surface-container-low rounded-full shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                    {profilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profilePhotoUrl}
                        alt="Foto Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-teal-700">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "?"}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block">
                    {user.name?.split(" ")[0] || "Profil Saya"}
                  </span>
                  <FiChevronDown
                    className={`text-sm transition-transform duration-200 hidden md:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute top-full right-0 mt-3 w-52 bg-surface/95 backdrop-blur-xl rounded-xl shadow-ambient border border-outline-variant/10 overflow-hidden transition-all duration-200 origin-top-right ${
                    profileOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="py-1">
                    <div className="px-4 py-2.5 border-b border-outline-variant/10">
                      <span className="font-public-sans text-[9px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                        {user.role === "PENGUNJUNG"
                          ? "PENGUNJUNG"
                          : user.role === "PENGURUS_PANTI"
                            ? "PENGURUS PANTI"
                            : "KEPALA PANTI"}
                      </span>
                    </div>

                    <Link
                      href="/profil-saya"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors"
                    >
                      <FiUser className="text-base" />
                      Halaman Profil
                    </Link>

                    {dashboardLink && (
                      <Link
                        href={dashboardLink.href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors"
                      >
                        <FiGrid className="text-base" />
                        {dashboardLink.label}
                      </Link>
                    )}

                    {user.role !== "PENGURUS_PANTI" && (
                      <>
                        <div className="border-t border-outline-variant/20 my-1 mx-2"></div>
                        <div className="px-1">
                          <LogoutButton />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-sans text-sm font-medium text-on-surface-variant hover:text-primary transition-colors text-base px-4 py-2"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="font-sans text-sm font-bold bg-primary text-white hover:bg-primary-container hover:text-on-primary-container transition-colors rounded-lg px-6 py-2 text-base shadow-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-low text-on-surface hover:text-primary transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <FiX className="text-xl" />
            ) : (
              <FiMenu className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" />
      </div>

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`fixed top-0 right-0 z-50 w-[85vw] max-w-sm h-dvh bg-surface/95 backdrop-blur-xl shadow-ambient md:hidden flex flex-col transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 h-20 flex-shrink-0">
          <span className="font-sans font-black text-sm text-primary tracking-tighter">
            Menu
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface hover:text-primary transition-colors"
            aria-label="Close mobile menu"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex-1 overflow-y-auto px-6 pb-8 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-3.5 px-4 rounded-xl font-sans text-base transition-colors ${
                isActive(link.href)
                  ? "font-bold text-primary bg-primary/8"
                  : "font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Donasi Expandable */}
          <div>
            <button
              onClick={() => setMobileDonasiOpen((v) => !v)}
              className={`w-full flex items-center justify-between py-3.5 px-4 rounded-xl font-sans text-base transition-colors ${
                isDonasiActive
                  ? "font-bold text-primary bg-primary/8"
                  : "font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              }`}
            >
              Donasi
              <FiChevronDown
                className={`text-sm transition-transform duration-200 ${
                  mobileDonasiOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                mobileDonasiOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-4 py-2 space-y-1">
                {donasiSubmenus.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      {sub.icon}
                    </div>
                    <div>
                      <span className="block font-sans font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {sub.label}
                      </span>
                      <span className="block font-public-sans text-xs text-on-surface-variant">
                        {sub.desc}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Drawer Footer — Auth */}
        <div className="flex-shrink-0 px-6 py-6 bg-surface-container-low/50">
          {isLoading ? (
            <div className="w-full h-12 rounded-xl bg-surface-container-low animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                  {profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhotoUrl}
                      alt="Foto Profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-bold text-teal-700">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "?"}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block font-sans font-bold text-sm text-on-surface">
                    {user.name || "Profil Saya"}
                  </span>
                  <span className="block font-public-sans text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                    {user.role === "PENGUNJUNG"
                      ? "PENGUNJUNG"
                      : user.role === "PENGURUS_PANTI"
                        ? "PENGURUS PANTI"
                        : "KEPALA PANTI"}
                  </span>
                </div>
              </div>

              <Link
                href="/profil-saya"
                className="block w-full py-3 px-4 rounded-xl text-center font-sans font-semibold text-sm text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
              >
                Halaman Profil
              </Link>

              {dashboardLink && (
                <Link
                  href={dashboardLink.href}
                  className="block w-full py-3 px-4 rounded-xl text-center font-sans font-semibold text-sm text-on-surface bg-surface-container-low hover:bg-surface-container-lowest transition-colors"
                >
                  {dashboardLink.label}
                </Link>
              )}

              {user.role !== "PENGURUS_PANTI" && (
                <div className="pt-2">
                  <LogoutButton />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="block w-full py-3 rounded-xl text-center font-sans font-bold text-sm bg-gradient-to-r from-primary to-primary-container text-white shadow-sm"
              >
                Daftar
              </Link>
              <Link
                href="/login"
                className="block w-full py-3 rounded-xl text-center font-sans font-medium text-sm text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>
      </nav>
    </>
  );
};
