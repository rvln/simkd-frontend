import React from "react";

export function DashboardHeader() {
  return (
    <nav className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center h-16 px-8 shadow-sm shadow-outline-variant/5 transition-colors duration-300 border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <span className="md:hidden text-lg font-black tracking-tighter text-primary font-sans">
          Panti Asuhan Dr. J. Lucas
        </span>
        <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 gap-2 border border-outline-variant/20 focus-within:border-primary/40 transition-colors">
          <span className="material-symbols-outlined text-outline text-sm">
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm font-public-sans w-64 placeholder:text-outline-variant text-on-surface outline-none"
            placeholder="Cari data..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-outline hover:text-primary transition-colors cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden ring-2 ring-primary/10 hover:ring-primary/30 transition-all cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Admin user avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB22q_tfFLO_MGhsSAat7r9lnkzUS8I6pwFqcjtEJF9O9sXl_ng-EJuy0etTFTrebMkRqbzg8zLjuZxzy_XJV9V823gaJ8Pwi1kfdh5r1BPPTv1oCkwqUSnawYzzFYJEoeLZpn881WDaq9_amqFrvPCXSIPii6GatQvcvajmuAU4iei9Gd66SN72J7kCCHEtlHtmCWGzBT49GkFYwMAah2-yFl6sN9rxX9ofkJPyK3TUBrIASY-jRpPgShIdlrnpA_L6SIfvhw1y8Ic"
          />
        </div>
      </div>
    </nav>
  );
}
