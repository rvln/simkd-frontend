"use client";

import React from "react";
import Link from "next/link";
import { FiBell, FiHelpCircle } from "react-icons/fi";
import { MobileMenuToggle } from "@/components/workspace/MobileMenuToggle";
import { useAuth } from "@/hooks/useAuth";

export function HeaderStaff() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-md z-30 flex items-center justify-between px-4 md:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      {/* Dashboard Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        <MobileMenuToggle />
        <h1 className="text-lg md:text-xl font-bold text-teal-700 tracking-tight uppercase">
          Ruang Kerja Panti Asuhan
        </h1>
      </div>

      {/* Right side: notification, help, profile */}
      <div className="flex items-center gap-6 pr-2 lg:pr-6">
        {/* <button className="relative text-gray-500 hover:text-teal-600 transition-colors">
          <FiBell className="text-xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="text-gray-500 hover:text-teal-600 transition-colors">
          <FiHelpCircle className="text-xl" />
        </button> */}

        {/* Separator using gradient instead of solid border */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-black/10 to-transparent mx-2"></div>

        <Link
          href="/profil-saya"
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              {user?.name?.split(" ")[0] || "Admin"}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              Pengurus Panti
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden shadow-sm">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt="Profil Pengguna"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-teal-700">
                {user?.name
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
        </Link>
      </div>
    </header>
  );
}
