"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "ABOUT US", href: "/about-us" },
    { name: "OUR PEOPLE", href: "/our-people" },
    { name: "PROJECTS", href: "/projects" },
    { name: "MEDIA", href: "/media" },
  ];

  return (
    <>
      {/* Clean Full-Width Top Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#07090e]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Rotaract Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#e6007e] to-[#ff4d94] flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-[#e6007e]/40 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <span className="text-sm sm:text-base lg:text-lg font-extrabold tracking-wider text-white whitespace-nowrap">
                ROTARACT <span className="text-[#e6007e]">SLTC</span>
              </span>
            </div>
          </Link>

          {/* Right: Join Us Button & Menu Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <Link
              href="/join-us"
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-[#e6007e] hover:bg-[#c4006c] text-white transition-all shadow-md hover:shadow-[#e6007e]/40 inline-flex items-center gap-1 sm:gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>JOIN US</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation sidebar"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 border border-slate-700/60 hover:border-[#e6007e] text-slate-200 hover:text-white flex items-center justify-center transition-all hover:bg-[#e6007e]/10 active:scale-95 cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hideable Navigation Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            />

            {/* Slide-in Sidebar */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#0c1017] border-l border-slate-800/80 z-50 flex flex-col p-6 shadow-2xl overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#e6007e] flex items-center justify-center text-white font-bold text-xs">
                    R
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                    Navigation Menu
                  </span>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close sidebar"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links inside Sidebar */}
              <nav className="flex flex-col gap-2 py-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wider transition-all flex items-center justify-between group ${
                        isActive
                          ? "bg-[#e6007e]/15 text-[#e6007e] border border-[#e6007e]/40 shadow-sm"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                      }`}
                    >
                      <span>{link.name}</span>
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isActive ? "bg-[#e6007e]" : "bg-slate-700 group-hover:bg-[#e6007e]"
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer Info */}
              <div className="mt-auto pt-6 border-t border-slate-800/80 text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-400">Rotaract Club of SLTC</p>
                <p className="text-[11px] text-slate-500">District 3220 • Sri Lanka</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}