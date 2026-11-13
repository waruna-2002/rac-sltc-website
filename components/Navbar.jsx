"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  PlusCircle, 
  ChevronDown,
  BookOpen,
  Newspaper,
  FileText,
  Globe,
  FolderKanban,
  Calendar,
  CalendarPlus
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const [mediaDropdownOpen, setMediaDropdownOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/media")) {
      setMediaDropdownOpen(true);
    }
    if (pathname.startsWith("/projects") || pathname.startsWith("/events")) {
      setProjectsDropdownOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        className={`fixed left-0 right-0 z-40 transition-all duration-300 top-0 ${
          scrolled
            ? "bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Official Rotaract & SLTC Campus Brand Logo */}
          <BrandLogo />

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
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Navigation
                </span>

                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close sidebar"
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Standard Links */}
              <nav className="flex flex-col gap-2 py-6">
                {navLinks.map((link) => {
                  if (link.name === "PROJECTS") {
                    const isProjectsActive = pathname.startsWith("/projects") || pathname.startsWith("/events");
                    return (
                      <div key={link.name} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
                          className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-between group cursor-pointer ${
                            isProjectsActive
                              ? "bg-[#e6007e]/15 text-[#e6007e] border border-[#e6007e]/40 shadow-sm"
                              : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>PROJECTS</span>
                          </span>
                          <ChevronDown
                            size={15}
                            className={`transition-transform duration-200 ${
                              projectsDropdownOpen ? "rotate-180 text-[#e6007e]" : "text-slate-400 group-hover:text-white"
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {projectsDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-3 pr-1 py-1 space-y-1 overflow-hidden"
                            >
                              {/* 1. All Projects (දැනට තියන Projects) */}
                              <Link
                                href="/projects"
                                onClick={() => setIsOpen(false)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between group/sub transition-colors ${
                                  pathname === "/projects"
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <FolderKanban size={14} className="text-[#e6007e]" />
                                  <span>All Projects</span>
                                </div>
                                <span className="text-[10px] text-slate-500 group-hover/sub:text-slate-400">Current</span>
                              </Link>

                              {/* 2. Upcoming Events (දැනට තියන Upcoming) */}
                              <Link
                                href="/#upcoming-events"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 flex items-center justify-between group/sub transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Calendar size={14} className="text-[#e6007e]" />
                                  <span>Upcoming Events</span>
                                </div>
                                <span className="text-[10px] text-slate-500 group-hover/sub:text-slate-400">Upcoming</span>
                              </Link>

                              {/* 3. Submit Project Proposal (Project Submit කරන එක) */}
                              <Link
                                href="/projects/submit"
                                onClick={() => setIsOpen(false)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between group/sub transition-colors ${
                                  pathname === "/projects/submit"
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <PlusCircle size={14} className="text-[#e6007e]" />
                                  <span>Submit Project</span>
                                </div>
                                <span className="text-[10px] text-[#e6007e]/90 bg-[#e6007e]/10 px-1.5 py-0.5 rounded font-semibold">Proposal</span>
                              </Link>

                              {/* 4. Propose Upcoming Event (Upcoming Submit කරන එක) */}
                              <Link
                                href="/events/submit"
                                onClick={() => setIsOpen(false)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between group/sub transition-colors ${
                                  pathname === "/events/submit"
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <CalendarPlus size={14} className="text-cyan-400" />
                                  <span>Propose Upcoming Event</span>
                                </div>
                                <span className="text-[10px] text-cyan-400/90 bg-cyan-400/10 px-1.5 py-0.5 rounded font-semibold">Propose</span>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  if (link.name === "MEDIA") {
                    const isMediaActive = pathname.startsWith("/media");
                    return (
                      <div key={link.name} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setMediaDropdownOpen(!mediaDropdownOpen)}
                          className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-between group cursor-pointer ${
                            isMediaActive
                              ? "bg-[#e6007e]/15 text-[#e6007e] border border-[#e6007e]/40 shadow-sm"
                              : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>MEDIA</span>
                          </span>
                          <ChevronDown
                            size={15}
                            className={`transition-transform duration-200 ${
                              mediaDropdownOpen ? "rotate-180 text-[#e6007e]" : "text-slate-400 group-hover:text-white"
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {mediaDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-3 pr-1 py-1 space-y-1 overflow-hidden"
                            >
                              <Link
                                href="/media?category=blogs"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition-colors"
                              >
                                <BookOpen size={14} className="text-[#e6007e]" />
                                <span>Blogs</span>
                              </Link>

                              <Link
                                href="/media?category=articles"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition-colors"
                              >
                                <Newspaper size={14} className="text-[#e6007e]" />
                                <span>Articles</span>
                              </Link>

                              <Link
                                href="/media?category=bulletins"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition-colors"
                              >
                                <FileText size={14} className="text-[#e6007e]" />
                                <span>Bulletins & Reports</span>
                              </Link>

                              <Link
                                href="/media"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition-colors"
                              >
                                <Globe size={13} className="text-slate-500" />
                                <span>All Media</span>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

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
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
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