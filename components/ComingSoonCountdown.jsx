"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Radio, Clock, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { fireLaunchCelebration } from "@/lib/launchConfetti";
import { launchAudio } from "@/lib/launchAudio";

export default function ComingSoonCountdown({ onUnlock, initialConfig }) {
  const [targetDateStr, setTargetDateStr] = useState(
    initialConfig?.targetDate || "2026-11-21T15:00:00+05:30"
  );
  const [zeroMessage, setZeroMessage] = useState(
    initialConfig?.zeroMessage || "Standing by for Official Ignition by the Chief Guest..."
  );
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isZero: false,
  });
  const [isLiveRevealed, setIsLiveRevealed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
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

  // Smart Adaptive Polling
  // If countdown is zero, poll rapidly every 2.5s. Otherwise, poll every 25s.
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

    const pollIntervalMs = timeLeft.isZero ? 2500 : 25000;
    const interval = setInterval(checkStatus, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [timeLeft.isZero, targetDateStr]);

  const triggerLiveReveal = () => {
    setIsLiveRevealed(true);

    if (audioEnabled) {
      launchAudio.playLaunchFanfare();
    }
    fireLaunchCelebration();

    // After 3.5 seconds celebration, unlock full site
    setTimeout(() => {
      if (onUnlock) {
        onUnlock();
      } else {
        window.location.reload();
      }
    }, 3500);
  };

  const padZero = (n) => String(n).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[9999] bg-[#07090e] text-slate-100 flex flex-col justify-between overflow-y-auto px-4 py-8 selection:bg-[#e6007e]/30">
      {/* Background ambient glowing orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-[#e6007e]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#005696]/15 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-10 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-[#06b6d4]/10 rounded-full blur-[90px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 p-1.5 shadow-lg backdrop-blur-md">
            <Image
              src="/images/rotaract-sltc-clean-logo.png"
              alt="Rotaract Club of SLTC Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-wider text-white">
              ROTARACT CLUB OF SLTC
            </h2>
            <p className="text-[11px] sm:text-xs text-[#e6007e] font-medium tracking-wide">
              District 3220 • Sri Lanka & Maldives
            </p>
          </div>
        </div>

        {/* Audio Toggle Button */}
        <button
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            if (!audioEnabled) launchAudio.playClick();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition backdrop-blur-md"
          title="Toggle celebration sound"
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#e6007e]" />
              <span className="hidden sm:inline">Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Muted</span>
            </>
          )}
        </button>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center my-auto py-10">
        <AnimatePresence mode="wait">
          {!isLiveRevealed ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center w-full"
            >
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[#e6007e] text-xs sm:text-sm font-semibold mb-6 tracking-wide backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e6007e] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e6007e]"></span>
                </span>
                {timeLeft.isZero ? "OFFICIAL LAUNCH IN PROGRESS" : "OFFICIAL WEBSITE LAUNCH"}
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-2xl leading-tight mb-4">
                Ignite Potential. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#e6007e] via-pink-400 to-[#ffb81c] bg-clip-text text-transparent">
                  Inspire Impact.
                </span>
              </h1>

              <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-10">
                The digital gateway to the Rotaract Club of SLTC Research University is preparing to go live.
              </p>

              {/* Countdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-2xl mb-8">
                {/* Days */}
                <div className="relative group p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center transition-all hover:border-[#e6007e]/40">
                  <div className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {padZero(timeLeft.days)}
                  </div>
                  <div className="text-[11px] sm:text-xs uppercase font-semibold text-slate-400 tracking-widest mt-1">
                    Days
                  </div>
                </div>

                {/* Hours */}
                <div className="relative group p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center transition-all hover:border-[#e6007e]/40">
                  <div className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {padZero(timeLeft.hours)}
                  </div>
                  <div className="text-[11px] sm:text-xs uppercase font-semibold text-slate-400 tracking-widest mt-1">
                    Hours
                  </div>
                </div>

                {/* Minutes */}
                <div className="relative group p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center transition-all hover:border-[#e6007e]/40">
                  <div className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {padZero(timeLeft.minutes)}
                  </div>
                  <div className="text-[11px] sm:text-xs uppercase font-semibold text-slate-400 tracking-widest mt-1">
                    Minutes
                  </div>
                </div>

                {/* Seconds */}
                <div className="relative group p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-[#e6007e]/40 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center transition-all">
                  <div className="text-3xl sm:text-5xl font-black tracking-tight text-[#e6007e] font-mono">
                    {padZero(timeLeft.seconds)}
                  </div>
                  <div className="text-[11px] sm:text-xs uppercase font-semibold text-[#e6007e]/80 tracking-widest mt-1">
                    Seconds
                  </div>
                </div>
              </div>

              {/* Zero state or Countdown message */}
              {timeLeft.isZero ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium backdrop-blur-md animate-pulse"
                >
                  <Radio className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>{zeroMessage}</span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>
                    Scheduled for{" "}
                    <strong className="text-slate-200">
                      November 21, 2026 at 3:00 PM (15:00 SLST)
                    </strong>
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            /* Celebration Reveal Screen */
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/80 border border-[#e6007e]/60 shadow-[0_0_80px_rgba(230,0,126,0.3)] backdrop-blur-2xl max-w-xl"
            >
              <div className="w-16 h-16 rounded-full bg-[#e6007e]/20 border border-[#e6007e] flex items-center justify-center text-[#e6007e] mb-4 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                WE ARE OFFICIALLY LIVE!
              </h2>
              <p className="text-[#ffb81c] text-sm sm:text-base font-semibold mb-6">
                Ignited with Pride by the Rotaract Club of SLTC
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Redirecting you to the live experience...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900 pt-4">
        <div>
          © {new Date().getFullYear()} Rotaract Club of SLTC Research University. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Chartered 2020</span>
          <span>•</span>
          <span>Sponsored by Rotary Club of Colombo Centennial</span>
        </div>
      </footer>
    </div>
  );
}
