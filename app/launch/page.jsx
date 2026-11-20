"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Volume2, VolumeX } from "lucide-react";
import { fireLaunchCelebration } from "@/lib/launchConfetti";
import { launchAudio } from "@/lib/launchAudio";

function LaunchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlKey = searchParams?.get("key") || "";
  const [passkey, setPasskey] = useState(urlKey);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Audio state & Auto-hide timer logic (Tap top-right corner to reveal for 5s)
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showAudioControl, setShowAudioControl] = useState(false);
  const audioHideTimerRef = useRef(null);

  // Stage sequence states: "READY" | "COUNTDOWN" | "REVEAL"
  const [stagePhase, setStagePhase] = useState("READY");
  const [countDigit, setCountDigit] = useState(3);
  const [revealActive, setRevealActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const hasTriggeredApi = useRef(false);

  // Preload audio files & 9D countdown image assets into browser cache
  useEffect(() => {
    launchAudio.preload();

    // Pre-cache 9D luxury number renders so they swap instantly with zero latency
    [1, 2, 3].forEach((n) => {
      const img = new window.Image();
      img.src = `/images/countdown/number-${n}.png`;
    });
  }, []);

  useEffect(() => {
    if (urlKey.trim().toLowerCase() === "rsltc2026") {
      setIsAuthenticated(true);
    }
    setIsVerifying(false);
  }, [urlKey]);

  // Reveal audio button for 5 seconds when tapping top-right corner
  const triggerAudioVisibility = () => {
    setShowAudioControl(true);
    if (audioHideTimerRef.current) {
      clearTimeout(audioHideTimerRef.current);
    }
    audioHideTimerRef.current = setTimeout(() => {
      setShowAudioControl(false);
    }, 5000);
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    setAudioEnabled((prev) => !prev);
    triggerAudioVisibility();
  };

  const handleManualUnlock = (e) => {
    e.preventDefault();
    if (passkey.trim().toLowerCase() === "rsltc2026") {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect passkey. Access denied.");
    }
  };

  // Fullscreen Giant 3.. 2.. 1.. Countdown with identical timing, then Smooth Cinematic Shimmer Reveal
  const startGiantCountdown = async () => {
    if (stagePhase !== "READY") return;

    // Initialize AudioContext on user physical interaction
    launchAudio.init();

    setStagePhase("COUNTDOWN");

    const EXACT_GAP_MS = 1800; // Strictly identical 1.8 seconds per digit

    // 1. NUMBER 3
    setCountDigit(3);
    if (audioEnabled) launchAudio.playCountdownBoom(3);
    await new Promise((r) => setTimeout(r, EXACT_GAP_MS));

    // 2. NUMBER 2 (Exact same speed & duration)
    setCountDigit(2);
    if (audioEnabled) launchAudio.playCountdownBoom(2);
    await new Promise((r) => setTimeout(r, EXACT_GAP_MS));

    // 3. NUMBER 1 (Exact same speed & duration)
    setCountDigit(1);
    if (audioEnabled) launchAudio.playCountdownBoom(1);
    await new Promise((r) => setTimeout(r, EXACT_GAP_MS));

    // 4. TRANSITION TO SMOOTH CINEMATIC SHIMMER REVEAL (NO TYPING CLICKS, NO BLINKING CURSORS)
    setStagePhase("REVEAL");
    setRevealActive(true);

    // Trigger API update in central database
    if (!hasTriggeredApi.current) {
      hasTriggeredApi.current = true;
      fetch("/api/launch/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: passkey.trim() || "rsltc2026",
          name: "Chief Guest",
        }),
      }).catch((err) => console.error("Launch trigger error:", err));
    }

    // Brief 400ms silent breath as the text blooms into view, then triumphant climax fanfare!
    await new Promise((r) => setTimeout(r, 400));

    if (audioEnabled) {
      launchAudio.playLaunchFanfare();
    }
    // Formal, dignified celebratory confetti
    fireLaunchCelebration();

    // Keep in full glory on screen for 3.5 seconds
    await new Promise((r) => setTimeout(r, 3500));

    // Smooth auto-redirect to live homepage
    router.push("/");
  };

  return (
    <div className="h-screen w-full bg-[#07090e] text-slate-100 flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* =========================================================================
          SLTC CAMPUS BLUEPRINT + ROTARACT AMBIENT LIGHTING
      ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Architectural Sketch Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/launch-bg.jpg"
            alt="SLTC Campus Architecture Background"
            fill
            priority
            className="object-cover object-center opacity-40 filter contrast-125 brightness-115"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/70 via-[#07090e]/40 to-[#07090e]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,#07090e_85%)]" />

          {/* Dedicated Satellite Dish Uplink Spotlight Glow */}
          <div
            className="absolute top-[28%] left-[19%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full blur-[80px] opacity-35 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(6,182,212,0.45) 0%, rgba(230,0,126,0.25) 50%, transparent 80%)",
            }}
          />
        </div>

        {/* Animated Rotaract Cranberry Orb */}
        <motion.div
          animate={{
            scale: stagePhase === "COUNTDOWN" ? [1, 1.25, 1] : [1, 1.15, 0.95, 1],
            opacity: stagePhase === "COUNTDOWN" ? 0.6 : [0.35, 0.5, 0.38, 0.35],
          }}
          transition={{ duration: stagePhase === "COUNTDOWN" ? 1.5 : 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] lg:w-[1300px] h-[500px] sm:h-[700px] lg:h-[900px] rounded-full blur-[150px] sm:blur-[190px]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(230,0,126,0.4) 0%, rgba(184,0,101,0.22) 45%, transparent 75%)",
          }}
        />

        {/* Royal Purple / Violet Horizon */}
        <motion.div
          animate={{
            scale: [1.08, 0.94, 1.12, 1.08],
            opacity: [0.22, 0.35, 0.25, 0.22],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[350px] sm:h-[500px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(147,51,234,0.25) 0%, rgba(107,33,168,0.12) 50%, transparent 80%)",
          }}
        />

        {/* Subtle Tech Cyan Accent */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full blur-[160px] opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6,182,212,0.25) 0%, rgba(0,86,150,0.15) 50%, transparent 75%)",
          }}
        />
      </div>

      {/* =========================================================================
          DISCRETE SOUND TOGGLE (Tap top-right corner to reveal for 5s)
      ========================================================================= */}
      <div
        onClick={triggerAudioVisibility}
        className="fixed top-0 right-0 w-32 h-24 z-50 flex items-center justify-end p-6 cursor-pointer"
        title="Tap corner to reveal audio controls"
      >
        <AnimatePresence>
          {showAudioControl && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              onClick={toggleAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/95 border border-[#e6007e]/40 text-xs text-white shadow-2xl backdrop-blur-xl"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#e6007e]" />
                  <span className="font-semibold text-slate-200">Ceremonial Audio: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-400">Audio Muted</span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          MAIN DISPLAY AREA
      ========================================================================= */}
      <main className="z-10 w-full h-full flex flex-col items-center justify-between px-4 sm:px-8 py-6 sm:py-10 max-w-7xl mx-auto">
        {isVerifying ? (
          <div className="my-auto text-slate-400 text-base">Loading Stage...</div>
        ) : !isAuthenticated ? (
          /* Passkey Input Modal */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-auto w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#e6007e]/15 border border-[#e6007e]/40 flex items-center justify-center text-[#e6007e] mb-5 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Stage Authorization</h2>
            <form onSubmit={handleManualUnlock} className="space-y-4">
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter stage passkey..."
                className="w-full px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-center font-mono focus:outline-none focus:border-[#e6007e] text-base"
                autoFocus
              />
              {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white font-bold text-sm uppercase tracking-wider transition shadow-lg shadow-[#e6007e]/30"
              >
                Access Screen
              </button>
            </form>
          </motion.div>
        ) : stagePhase === "READY" ? (
          /* -------------------------------------------------------------------
              STAGE 1: THE FOUR-ELEMENT CLEAN LAYOUT
          ------------------------------------------------------------------- */
          <div className="w-full h-full flex flex-col items-center justify-between">
            {/* TOP BLOCK: Logo + "Rotaract Club of SLTC" */}
            <div className="flex-1 w-full flex flex-col items-center justify-end pb-8 sm:pb-12">
              {/* 1. UDIN ROTARACT LOGO EKA */}
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mb-4 sm:mb-6 drop-shadow-[0_0_60px_rgba(230,0,126,0.55)]">
                <Image
                  src="/images/rotaract-sltc-clean-logo.png"
                  alt="Rotaract Club of SLTC Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* 2. ITAPASSE "Rotaract Club of SLTC" */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wide text-center">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                  Rotaract Club of{" "}
                </span>
                <span className="bg-gradient-to-r from-[#ff66ab] via-[#e6007e] to-[#ff2d9b] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(230,0,126,0.65)] font-black">
                  SLTC
                </span>
              </h1>
            </div>

            {/* MIDDLE BLOCK: WIDE, COMMANDING LAUNCH BUTTON AT DEAD CENTER */}
            <div className="w-full max-w-2xl sm:max-w-4xl lg:max-w-5xl my-auto px-4 sm:px-6">
              <button
                onClick={startGiantCountdown}
                className="relative group w-full min-h-[82px] sm:min-h-[100px] md:min-h-[115px] px-8 sm:px-16 py-5 sm:py-7 rounded-2xl sm:rounded-3xl md:rounded-[36px] flex items-center justify-center transition-all duration-300 shadow-[0_0_80px_rgba(230,0,126,0.6)] hover:shadow-[0_0_130px_rgba(230,0,126,0.9)] overflow-hidden cursor-pointer bg-gradient-to-r from-[#e6007e] via-[#c4006c] to-[#e6007e] text-white border-2 border-pink-300/60 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Glowing Sweep Shimmer */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Inner Border Radiance Ring */}
                <div className="absolute inset-1 rounded-2xl sm:rounded-3xl md:rounded-[32px] border border-white/20 pointer-events-none" />

                <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.12em] sm:tracking-[0.16em] uppercase drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)]">
                  LAUNCH WEBSITE
                </span>
              </button>
            </div>

            {/* BOTTOM BLOCK: "Official Website Launch" */}
            <div className="flex-1 w-full flex flex-col items-center justify-start pt-8 sm:pt-12">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#ff66ab]/60" />
                <p className="text-xs sm:text-sm md:text-base font-bold tracking-[0.3em] uppercase text-[#ff66ab] text-center drop-shadow-[0_0_20px_rgba(230,0,126,0.5)]">
                  Official Website Launch
                </p>
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#ff66ab]/60" />
              </div>
            </div>
          </div>
        ) : stagePhase === "COUNTDOWN" ? (
          /* -------------------------------------------------------------------
              STAGE 2: EXECUTIVE DIAMOND & TITANIUM 3D COUNTDOWN (3... 2... 1...)
              CRISP PLATINUM FACE, SHARP BEVEL RIM, LASER OUTLINE, DEEP TITANIUM EXTRUSION
          ------------------------------------------------------------------- */
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Ambient Radial Backlight Glow behind the 9D sculpture */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[800px] h-[550px] sm:h-[800px] rounded-full bg-[#e6007e]/30 blur-[150px] pointer-events-none" />

            {/* Expanding Shockwave Ring on every digit impact */}
            <motion.div
              key={`shockwave-${countDigit}`}
              initial={{ scale: 0.35, opacity: 0.9 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full border-2 border-[#ff4da6] pointer-events-none"
            />

            <motion.div
              key={countDigit}
              initial={{ scale: 1.35, opacity: 0, filter: "brightness(1.5)" }}
              animate={{ scale: 1, opacity: 1, filter: "brightness(1.0)" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center my-auto relative z-10 select-none"
            >
              {/* VOLUMETRIC 9D LUXURY SCULPTED NUMBER IMAGE */}
              <div className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] md:w-[680px] md:h-[680px] lg:w-[820px] lg:h-[820px] max-h-[85vh] flex items-center justify-center">
                <Image
                  src={`/images/countdown/number-${countDigit}.png`}
                  alt={`Countdown ${countDigit}`}
                  fill
                  priority
                  className="object-contain pointer-events-none drop-shadow-[0_0_80px_rgba(230,0,126,0.65)]"
                />
              </div>
            </motion.div>
          </div>
        ) : (
          /* -------------------------------------------------------------------
              STAGE 3: SMOOTH CINEMATIC SHIMMER REVEAL
              STATELY TWO-TIER ARCHITECTURAL REVEAL. NO BLINKING CURSOR.
              LIGHT SHIMMER SWEEP. NO NOISY CLICKS.
          ------------------------------------------------------------------- */
          <div className="w-full h-full flex flex-col items-center justify-center my-auto px-4 sm:px-8 max-w-6xl text-center relative">
            {/* Luminous Light Sweep Flare */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "100%", opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none blur-xl"
            />

            <div className="flex flex-col items-center gap-4 sm:gap-6">
              {/* Tier 1: Subtitle Welcome Line */}
              <motion.p
                initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-2xl md:text-3xl font-bold tracking-[0.22em] sm:tracking-[0.28em] uppercase text-slate-300 drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)]"
              >
                Welcome to the New Website of
              </motion.p>

              {/* Tier 2: The Monument Brand Name */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wide uppercase"
              >
                <span className="bg-gradient-to-r from-white via-[#ff66ab] to-[#e6007e] bg-clip-text text-transparent drop-shadow-[0_0_70px_rgba(230,0,126,0.9)]">
                  Rotaract SLTC
                </span>
              </motion.h1>
            </div>
          </div>
        )}
      </main>

      {/* Discrete Bottom District Subtext */}
      <footer className="w-full text-center text-[11px] sm:text-xs text-slate-500 z-10 pb-3">
        Rotary International District 3220 • Sri Lanka & Maldives
      </footer>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400">
          Loading Stage Console...
        </div>
      }
    >
      <LaunchPageInner />
    </Suspense>
  );
}
