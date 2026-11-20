"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { fireLaunchCelebration } from "@/lib/launchConfetti";

export default function ComingSoonCountdown({ onUnlock, initialConfig }) {
  const [targetDateStr, setTargetDateStr] = useState(
    initialConfig?.targetDate || "2026-11-21T15:00:00+05:30"
  );
  const [zeroMessage, setZeroMessage] = useState(
    initialConfig?.zeroMessage || "Standing by for Official Stage Launch..."
  );
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isZero: false,
  });
  const [isLiveRevealed, setIsLiveRevealed] = useState(false);
  const celebrationTriggeredRef = useRef(false);

  // Calculate remaining time
  const calculateTime = useCallback(() => {
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isZero: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isZero: false };
  }, [targetDateStr]);

  // Tick every second
  useEffect(() => {
    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTime]);

  // Adaptive Polling for Stage Launch
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/launch/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        if (!isMounted) return;

        if (data.targetDate && data.targetDate !== targetDateStr) {
          setTargetDateStr(data.targetDate);
        }
        if (data.zeroMessage) {
          setZeroMessage(data.zeroMessage);
        }

        // If launched or mode switched to LIVE
        if (data.isLaunched || data.mode === "LAUNCHED" || data.mode === "LIVE") {
          if (!celebrationTriggeredRef.current) {
            celebrationTriggeredRef.current = true;
            triggerLiveReveal();
          }
        }
      } catch (err) {
        console.warn("Status poll error:", err);
      }
    };

    // Poll every 3 seconds so audience screens reveal instantly when stage launch button is pressed
    const pollIntervalMs = 3000;
    const interval = setInterval(checkStatus, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [targetDateStr]);

  const triggerLiveReveal = () => {
    setIsLiveRevealed(true);
    fireLaunchCelebration();

    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else if (onUnlock) {
        onUnlock();
      }
    }, 3800);
  };

  const padZero = (n) => String(n).padStart(2, "0");

  return (
    <div className="h-screen w-full bg-[#07090e] text-slate-100 flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* =========================================================================
          SLTC CAMPUS BLUEPRINT & ROTARACT AMBIENT LIGHTING (EXACT WEBSITE MATCH)
      ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Subtle Campus Line-Art */}
        <div className="absolute inset-0 opacity-25 filter contrast-125 brightness-110">
          <Image
            src="/images/launch-bg.jpg"
            alt="SLTC Campus Line-art"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/80 via-[#07090e]/50 to-[#07090e]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,#07090e_85%)]" />

        {/* Ambient Rotaract Cranberry Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[950px] h-[450px] sm:h-[650px] rounded-full blur-[160px] opacity-35 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(230,0,126,0.45) 0%, rgba(184,0,101,0.2) 50%, transparent 75%)",
          }}
        />

        {/* Royal Purple Horizon */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[150px] opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(147,51,234,0.3) 0%, transparent 75%)",
          }}
        />
      </div>

      {/* =========================================================================
          MAIN DISPLAY AREA
      ========================================================================= */}
      <main className="z-10 w-full h-full flex flex-col items-center justify-between px-4 sm:px-8 py-6 sm:py-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!isLiveRevealed ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex flex-col items-center justify-between"
            >
              {/* TOP BLOCK: UDIN ROTARACT LOGO EKA WITHARAK (EXACT MATCH TO LAUNCH PAGE) */}
              <div className="flex-1 w-full flex flex-col items-center justify-end pb-4 sm:pb-8">
                {/* 1. UDIN ROTARACT LOGO EKA */}
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 mb-4 sm:mb-6 drop-shadow-[0_0_60px_rgba(230,0,126,0.55)]">
                  <Image
                    src="/images/rotaract-sltc-clean-logo.png"
                    alt="Rotaract Club of SLTC Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* 2. TIME EKATA UDIN "WEBSITE LAUNCH" */}
                <div className="flex items-center gap-3">
                  <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#ff66ab]/60" />
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.18em] sm:tracking-[0.24em] text-white drop-shadow-[0_2px_25px_rgba(230,0,126,0.55)]">
                    WEBSITE LAUNCH
                  </h1>
                  <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#ff66ab]/60" />
                </div>
              </div>

              {/* MIDDLE BLOCK: LOKUWATA PENNA COUNTDOWN NUMBERS */}
              <div className="w-full max-w-4xl my-auto px-2 sm:px-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 md:gap-8 w-full">
                  {/* DAYS */}
                  <div className="p-4 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center group hover:border-[#e6007e]/40 transition-colors">
                    <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-mono drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                      {padZero(timeLeft.days)}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm uppercase font-bold text-slate-400 tracking-[0.25em] mt-2 sm:mt-3">
                      Days
                    </div>
                  </div>

                  {/* HOURS */}
                  <div className="p-4 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center group hover:border-[#e6007e]/40 transition-colors">
                    <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-mono drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                      {padZero(timeLeft.hours)}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm uppercase font-bold text-slate-400 tracking-[0.25em] mt-2 sm:mt-3">
                      Hours
                    </div>
                  </div>

                  {/* MINUTES */}
                  <div className="p-4 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center group hover:border-[#e6007e]/40 transition-colors">
                    <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-mono drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                      {padZero(timeLeft.minutes)}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm uppercase font-bold text-slate-400 tracking-[0.25em] mt-2 sm:mt-3">
                      Minutes
                    </div>
                  </div>

                  {/* SECONDS */}
                  <div className="p-4 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl bg-slate-900/70 border border-[#e6007e]/40 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight font-mono bg-gradient-to-r from-[#ff66ab] via-[#e6007e] to-[#ff2d9b] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,0,126,0.7)]">
                      {padZero(timeLeft.seconds)}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm uppercase font-bold text-[#ff66ab] tracking-[0.25em] mt-2 sm:mt-3">
                      Seconds
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM BLOCK: ZERO STATE OR STANDING BY INDICATOR */}
              <div className="flex-1 w-full flex flex-col items-center justify-start pt-4 sm:pt-8">
                {timeLeft.isZero && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#e6007e]/15 border border-[#e6007e]/40 text-[#ff66ab] text-xs sm:text-sm font-semibold backdrop-blur-md animate-pulse shadow-lg"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#e6007e] animate-ping" />
                    <span>{zeroMessage}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            /* =========================================================================
                STAGE LAUNCHED: "WEBSITE IS LIVE" (CLEAN, NO EMOJIS, NO SOUND)
            ========================================================================= */
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center my-auto px-4"
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
                <span className="relative flex h-3 w-3 sm:h-4 sm:w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e6007e] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-[#e6007e]" />
                </span>
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-wider">
                  <span className="bg-gradient-to-r from-white via-[#ff66ab] to-[#e6007e] bg-clip-text text-transparent drop-shadow-[0_0_80px_rgba(230,0,126,0.9)]">
                    WEBSITE IS LIVE
                  </span>
                </h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* =========================================================================
          DISCRETE BOTTOM DISTRICT LINE
      ========================================================================= */}
      <footer className="w-full text-center text-[11px] sm:text-xs text-slate-500 z-10 pb-3">
        Rotary International District 3220 • Sri Lanka & Maldives
      </footer>
    </div>
  );
}
