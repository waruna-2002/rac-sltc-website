"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Volume2, 
  VolumeX,
  ExternalLink 
} from "lucide-react";
import { fireLaunchCelebration } from "@/lib/launchConfetti";
import { launchAudio } from "@/lib/launchAudio";

function LaunchConsoleInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlKey = searchParams?.get("key") || "";
  const [passkey, setPasskey] = useState(urlKey);
  const [chiefGuestName, setChiefGuestName] = useState("Chief Guest");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Check key on mount
  useEffect(() => {
    async function checkKey(keyToTest) {
      if (!keyToTest) {
        setIsVerifying(false);
        return;
      }
      setIsVerifying(true);
      setErrorMsg("");

      try {
        // Quick verify with the server status or trigger check
        const res = await fetch("/api/launch/status");
        const data = await res.json();

        // If secret key is provided, we can test it against expected
        if (keyToTest.trim().toLowerCase() === "rsltc2026") {
          setIsAuthenticated(true);
          if (data.isLaunched) {
            setIsLaunched(true);
          }
        } else {
          setErrorMsg("Invalid launch passkey. Please verify and try again.");
          setIsAuthenticated(false);
        }
      } catch (e) {
        // Fallback
        if (keyToTest.trim().toLowerCase() === "rsltc2026") {
          setIsAuthenticated(true);
        }
      } finally {
        setIsVerifying(false);
      }
    }

    if (urlKey) {
      checkKey(urlKey);
    } else {
      setIsVerifying(false);
    }
  }, [urlKey]);

  const handleManualUnlock = (e) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setErrorMsg("Please enter the launch passkey.");
      return;
    }
    if (passkey.trim().toLowerCase() === "rsltc2026") {
      setIsAuthenticated(true);
      setErrorMsg("");
      launchAudio.playClick();
    } else {
      setErrorMsg("Incorrect passkey. Access denied.");
    }
  };

  const handleIgniteLaunch = async () => {
    if (isLaunching || isLaunched) return;

    setIsLaunching(true);
    setErrorMsg("");

    try {
      if (audioEnabled) {
        launchAudio.playClick();
      }

      const res = await fetch("/api/launch/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: passkey.trim() || "rsltc2026",
          name: chiefGuestName.trim() || "Chief Guest",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsLaunched(true);

        if (audioEnabled) {
          launchAudio.playLaunchFanfare();
        }
        fireLaunchCelebration();

        // Redirect after 4.5 seconds
        setTimeout(() => {
          router.push("/");
        }, 4500);
      } else {
        setErrorMsg(data.error || "Failed to trigger launch sequence.");
        setIsLaunching(false);
      }
    } catch (err) {
      console.error("Launch error:", err);
      setErrorMsg("Network error communicating with the launch server.");
      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative selection:bg-[#e6007e]/30">
      {/* Background glow fx */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-[#e6007e]/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#06b6d4]/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 p-1.5 shadow-lg">
            <Image
              src="/images/rotaract-sltc-clean-logo.png"
              alt="Rotaract Club of SLTC Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
              VIP STAGE LAUNCH CONSOLE
            </h1>
            <p className="text-xs text-[#e6007e] font-semibold">
              Rotaract Club of SLTC • District 3220
            </p>
          </div>
        </div>

        {/* Audio control */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#e6007e]" />
              <span className="hidden sm:inline">Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Muted</span>
            </>
          )}
        </button>
      </header>

      {/* Main Console Content */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-auto py-8">
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Radio className="w-8 h-8 text-[#e6007e] animate-spin mb-3" />
            <p className="text-sm">Connecting to secure launch network...</p>
          </div>
        ) : !isAuthenticated ? (
          /* Locked Passkey Form */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#e6007e]/10 border border-[#e6007e]/30 flex items-center justify-center text-[#e6007e] mb-5 mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-2">
              VIP Launch Authorization
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 text-center mb-6">
              Please enter the stage secret passkey to access the ignition console.
            </p>

            <form onSubmit={handleManualUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  Launch Passkey
                </label>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter passkey..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-[#e6007e] focus:ring-1 focus:ring-[#e6007e] text-sm"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e6007e] to-[#c7006e] hover:from-[#d50074] hover:to-[#b00062] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#e6007e]/25 transition active:scale-[0.98]"
              >
                Access Launch Console
              </button>
            </form>
          </motion.div>
        ) : (
          /* Authenticated Stage Ignition Console */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>STAGE CONSOLE ARMED & CONNECTED</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Official Launch Ignition
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-8">
              Pressing this button will instantly update the central database, trigger celebratory fireworks, and synchronize audience screens in the hall within 2-3 seconds.
            </p>

            {/* Chief Guest Name Input (Optional) */}
            <div className="w-full max-w-xs mb-8">
              <label className="block text-[11px] font-semibold uppercase text-slate-500 tracking-wider mb-1.5 text-center">
                Honored Guest / Launcher
              </label>
              <input
                type="text"
                value={chiefGuestName}
                onChange={(e) => setChiefGuestName(e.target.value)}
                disabled={isLaunching || isLaunched}
                className="w-full text-center px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#e6007e]"
              />
            </div>

            {/* EPIC LAUNCH BUTTON */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Outer pulsing energy rings */}
              <div className="absolute inset-0 rounded-full bg-[#e6007e]/20 blur-xl animate-pulse scale-125 pointer-events-none" />
              <div className="absolute -inset-4 rounded-full border border-[#e6007e]/30 animate-ping opacity-30 pointer-events-none" />

              <button
                onClick={handleIgniteLaunch}
                disabled={isLaunching || isLaunched}
                className={`relative group w-56 h-56 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 shadow-[0_0_60px_rgba(230,0,126,0.5)] ${
                  isLaunched
                    ? "bg-emerald-600 scale-95 shadow-[0_0_60px_rgba(16,185,129,0.6)]"
                    : isLaunching
                    ? "bg-[#e6007e] animate-pulse"
                    : "bg-gradient-to-tr from-[#c7006e] via-[#e6007e] to-[#ff2d9b] hover:scale-105 active:scale-95"
                }`}
              >
                {/* Border ring detail */}
                <div className="absolute inset-2 rounded-full border-2 border-white/30" />
                <div className="absolute inset-4 rounded-full border border-white/10" />

                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                  {isLaunched ? (
                    <>
                      <CheckCircle2 className="w-14 h-14 text-white mb-2 animate-bounce" />
                      <span className="text-xl font-black tracking-wider">
                        WE ARE LIVE!
                      </span>
                      <span className="text-xs text-white/80 mt-1">
                        Redirecting now...
                      </span>
                    </>
                  ) : isLaunching ? (
                    <>
                      <Radio className="w-12 h-12 text-white animate-spin mb-2" />
                      <span className="text-lg font-bold tracking-wider">
                        IGNITING...
                      </span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-12 h-12 text-white mb-2 group-hover:-translate-y-1 transition duration-300" />
                      <span className="text-2xl font-black tracking-wider uppercase">
                        LAUNCH
                      </span>
                      <span className="text-xs font-semibold text-white/90 tracking-widest mt-0.5 uppercase">
                        WEBSITE
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {errorMsg && (
              <div className="mt-6 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 max-w-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isLaunched && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-sm text-emerald-400 font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Celebration triggered. Audience screens are synchronizing!</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Rotaract Club of SLTC Research University</span>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Target: Nov 21, 2026 • 3:00 PM</span>
        </div>
      </footer>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white">
          Loading console...
        </div>
      }
    >
      <LaunchConsoleInner />
    </Suspense>
  );
}
