"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  ShieldCheck, 
  PlusCircle, 
  Clock, 
  Users, 
  LogOut, 
  Lock 
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { getStoredProjects } from "@/lib/projectsStore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [passError, setPassError] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const pathname = usePathname();
  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const projects = getStoredProjects();
    setPendingCount(projects.filter((p) => p.status === "pending").length);
  }, [isOpen, isAdmin]);

  const handleAdminModalLogin = async (e) => {
    e.preventDefault();
    const result = await loginAdmin(adminPasscode);
    if (result.success) {
      setShowAdminLoginModal(false);
      setAdminPasscode("");
      setPassError("");
    } else {
      setPassError(result.error);
    }
  };

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "ABOUT US", href: "/about-us" },
    { name: "OUR PEOPLE", href: "/our-people" },
    { name: "PROJECTS", href: "/projects" },
    { name: "SUBMIT PROJECT", href: "/projects/submit" },
    { name: "MEDIA", href: "/media" },
  ];

  // Admin-only Navigation Links
  const adminOnlyLinks = [
    { 
      name: `Pending Approvals (${pendingCount})`, 
      href: "/admin?tab=approvals", 
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { 
      name: "All Member Detail", 
      href: "/our-people", 
      icon: Users 
    },
  ];

  return (
    <>
      {/* Clean Full-Width Top Header - Dynamically pushed down when Admin Toolbar is active */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isAdmin ? "top-9 sm:top-8" : "top-0"
        } ${
          scrolled
            ? "bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3"
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

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Join Us Button */}
            <Link
              href="/join-us"
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-[#e6007e] hover:bg-[#c4006c] text-white transition-all shadow-md hover:shadow-[#e6007e]/40 inline-flex items-center gap-1 sm:gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>JOIN US</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>

            {/* Admin Logout / Login Button Right Next to Join Us */}
            {isAdmin ? (
              <button
                onClick={logoutAdmin}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-200 hover:text-rose-400 transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
              >
                <LogOut size={13} />
                <span>LOGOUT</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-slate-900/80 border border-slate-700/80 hover:border-[#e6007e] text-slate-300 hover:text-white transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Lock size={12} />
                <span>ADMIN</span>
              </button>
            )}

            {/* Menu Drawer Toggle */}
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

      {/* Admin Login Popup Modal */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAdminLoginModal(false)} />
          <form
            onSubmit={handleAdminModalLogin}
            className="relative w-full max-w-sm p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-5 z-10 shadow-2xl text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#e6007e]/20 text-[#e6007e] mx-auto flex items-center justify-center border border-[#e6007e]/40">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Admin Login</h3>
              <p className="text-[11px] text-slate-400 mt-1">Enter your admin role passcode</p>
            </div>

            {passError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold">
                {passError}
              </div>
            )}

            <input
              type="password"
              placeholder="Passcode (admin123 / project123)"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
              required
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider shadow-lg"
            >
              Enable Admin Mode
            </button>
          </form>
        </div>
      )}

      {/* Navigation Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#0c1017] border-l border-slate-800/80 z-50 flex flex-col p-6 shadow-2xl overflow-y-auto"
            >
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

              {/* Standard Links */}
              <nav className="flex flex-col gap-2 py-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-between group ${
                        isActive
                          ? "bg-[#e6007e]/15 text-[#e6007e] border border-[#e6007e]/40 shadow-sm"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {link.href === "/projects/submit" && <PlusCircle size={14} />}
                        <span>{link.name}</span>
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isActive ? "bg-[#e6007e]" : "bg-slate-700 group-hover:bg-[#e6007e]"
                        }`}
                      />
                    </Link>
                  );
                })}

                {/* ADMIN-ONLY NAVIGATION SECTION (VISIBLE ONLY WHEN LOGGED IN AS ADMIN) */}
                {isAdmin && (
                  <div className="pt-4 mt-2 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e6007e] block px-4 mb-2">
                      ✦ ADMIN CONTROLS ✦
                    </span>

                    {adminOnlyLinks.map((alink) => {
                      const Icon = alink.icon;
                      return (
                        <Link
                          key={alink.name}
                          href={alink.href}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 rounded-xl text-xs font-bold tracking-wider text-yellow-400 bg-yellow-950/40 border border-yellow-500/40 hover:bg-yellow-500/20 transition-all flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={14} />
                            <span>{alink.name}</span>
                          </span>
                          {alink.badge && (
                            <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] font-black flex items-center justify-center">
                              {alink.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </nav>

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