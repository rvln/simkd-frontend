"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiLogOut,
  FiGrid,
  FiCheckSquare,
  FiCheckCircle,
  FiArchive,
  FiTruck,
  FiUser,
  FiFileText,
  FiBarChart2,
} from "react-icons/fi";
import LogoutButton from "@/components/layout/LogoutButton";

interface SidebarProps {
  role: string;
}

const MENU_ITEMS = [
  {
    name: "Ringkasan",
    href: "/dashboard",
    icon: FiGrid,
  },
  {
    name: "Persetujuan Kunjungan",
    href: "/dashboard/approval-kunjungan",
    icon: FiCheckSquare,
  },
  {
    name: "Validasi Donasi",
    href: "/dashboard/validasi-donasi",
    icon: FiCheckCircle,
  },
  {
    name: "Kelola Kebutuhan",
    href: "/dashboard/kelola-kebutuhan",
    icon: FiArchive,
  },
  {
    name: "Distribusi",
    href: "/dashboard/distribusi",
    icon: FiTruck,
  },
  {
    name: "Moderasi Laporan",
    href: "/dashboard/moderasi-laporan",
    icon: FiFileText,
  },
  {
    name: "Laporan Resmi",
    href: "/dashboard/laporan",
    icon: FiBarChart2,
  },
];

export function SidebarStaff({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkState = () =>
      setIsOpen(document.body.classList.contains("sidebar-open"));
    checkState();
    const observer = new MutationObserver(checkState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => document.body.classList.remove("sidebar-open")}
      />
      <aside
        className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-teal-50/50 backdrop-blur-md flex flex-col justify-between py-6 px-4 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          {/* User Info block */}
          <div className="mb-10 px-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(13,148,136,0.3)]">
              <FiUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wider text-teal-800 mb-0.5 uppercase">
                {role.replace("_", " ")}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                OPERASIONAL
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {MENU_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => document.body.classList.remove("sidebar-open")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-white text-teal-700 shadow-[0_4px_20px_rgba(0,0,0,0.04)] font-semibold"
                      : "text-gray-500 hover:bg-white/60 hover:text-teal-600"
                  }`}
                >
                  <item.icon
                    className={`text-lg ${isActive ? "text-teal-600" : ""}`}
                  />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          {/* Separator using gradient */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent mb-2"></div>

          {/* <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white/60 hover:text-teal-600 transition-all duration-300"
        >
          <FiSettings className="text-lg" />
          <span className="text-sm font-medium uppercase tracking-wider">Pengaturan</span>
        </Link> */}
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
