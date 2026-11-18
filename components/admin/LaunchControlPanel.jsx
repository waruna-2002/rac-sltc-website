"use client";

import React, { useState, useEffect } from "react";
import { 
  Rocket, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Flame,
  Globe,
  Lock,
  Sparkles
} from "lucide-react";

export default function LaunchControlPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [targetDate, setTargetDate] = useState("2026-11-21T15:00:00+05:30");
  const [zeroMessage, setZeroMessage] = useState(
    "Standing by for Official Ignition by the Chief Guest..."
  );

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/launch/config", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setTargetDate(data.config.targetDate || "2026-11-21T15:00:00+05:30");
        setZeroMessage(
          data.config.zeroMessage ||
            "Standing by for Official Ignition by the Chief Guest..."
        );
      }
    } catch (err) {
      console.error("Failed to load launch config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleModeChange = async (newMode) => {
    try {
      setSaving(true);
      setStatusMsg({ type: "", text: "" });

      const res = await fetch("/api/launch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setStatusMsg({
          type: "success",
          text: `Site mode changed to ${newMode} successfully.`,
        });
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to change site mode.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Network error updating mode." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetLaunch = async () => {
    if (!confirm("Are you sure you want to reset the launch status? The site will revert to unlaunched state.")) return;

    try {
      setSaving(true);
      setStatusMsg({ type: "", text: "" });

      const res = await fetch("/api/launch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetLaunch: true, mode: "COUNTDOWN" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setStatusMsg({
          type: "success",
          text: "Launch status reset successfully. Site set to COUNTDOWN mode.",
        });
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to reset launch status.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Network error resetting launch." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg({ type: "", text: "" });

      const res = await fetch("/api/launch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDate,
          zeroMessage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setStatusMsg({
          type: "success",
          text: "Launch settings saved successfully.",
        });
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to save launch settings.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Network error saving settings." });
    } finally {
      setSaving(false);
    }
  };

  const copyStageLink = () => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const link = `${origin}/launch?key=rsltc2026`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-[#0c1017] border border-slate-800 flex items-center justify-center text-slate-400 gap-3">
        <Radio className="w-5 h-5 text-[#e6007e] animate-spin" />
        <span>Loading Launch Control telemetry...</span>
      </div>
    );
  }

  const currentMode = config?.mode || "LIVE";
  const isLaunched = Boolean(config?.isLaunched);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[#e6007e] text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>MISSION CONTROL</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Official Website Launch Control Center
          </h2>
          <p className="text-sm text-slate-400">
            Manage pre-launch countdown, VIP stage authorization, and live synchronization.
          </p>
        </div>

        <button
          onClick={fetchConfig}
          disabled={saving}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-2.5 ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 3-State Current Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State 1: Public Live */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            currentMode === "LIVE"
              ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30"
              : "bg-[#0c1017] border-slate-800/80 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Normal / Review Mode
            </span>
            {currentMode === "LIVE" && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Website is 100% open to everyone. No countdown. Perfect for approval review by university & district.
          </p>
          {currentMode !== "LIVE" && (
            <button
              onClick={() => handleModeChange("LIVE")}
              disabled={saving}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Switch to Live / Review Mode
            </button>
          )}
        </div>

        {/* State 2: Countdown Mode */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            currentMode === "COUNTDOWN" && !isLaunched
              ? "bg-[#e6007e]/10 border-[#e6007e]/60 shadow-lg shadow-[#e6007e]/10 ring-1 ring-[#e6007e]/30"
              : "bg-[#0c1017] border-slate-800/80 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6007e] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pre-Launch Countdown
            </span>
            {currentMode === "COUNTDOWN" && !isLaunched && (
              <span className="w-2 h-2 rounded-full bg-[#e6007e] animate-ping" />
            )}
          </div>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Public visitors see the Live Countdown towards Nov 21, 3:00 PM. Admins can preview the full website.
          </p>
          {currentMode !== "COUNTDOWN" && (
            <button
              onClick={() => handleModeChange("COUNTDOWN")}
              disabled={saving}
              className="w-full py-2 rounded-xl bg-[#e6007e] hover:bg-[#c7006e] text-xs font-semibold text-white transition shadow-md shadow-[#e6007e]/20"
            >
              Activate Countdown Mode
            </button>
          )}
        </div>

        {/* State 3: Officially Launched */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLaunched || currentMode === "LAUNCHED"
              ? "bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30"
              : "bg-[#0c1017] border-slate-800/80 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" /> Officially Launched
            </span>
            {isLaunched && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </div>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            {isLaunched ? (
              <>
                Launched on:{" "}
                <strong className="text-white">
                  {config?.launchedAt ? new Date(config.launchedAt).toLocaleString() : "Recently"}
                </strong>
                <br />
                By: <strong className="text-white">{config?.launchedBy || "Chief Guest"}</strong>
              </>
            ) : (
              "Triggered live on stage via the VIP secret launch console."
            )}
          </p>
          {isLaunched ? (
            <button
              onClick={handleResetLaunch}
              disabled={saving}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-xs font-semibold text-slate-300 transition"
            >
              Reset to Pre-Launch
            </button>
          ) : (
            <button
              onClick={() => handleModeChange("LAUNCHED")}
              disabled={saving}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition"
            >
              Simulate Launch
            </button>
          )}
        </div>
      </div>

      {/* Secret VIP Link & Stage Console Quick Access */}
      <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Lock className="w-4 h-4 text-[#e6007e]" />
          <span>Stage Console & Preview Links</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* VIP Stage Link */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                VIP Stage Ignition Link (Chief Guest)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e6007e]/20 text-[#e6007e] font-mono">
                Key: rsltc2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Open this link on the stage tablet or laptop for the Chief Guest to press.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={copyStageLink}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-2 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Link Copied!" : "Copy VIP Link"}</span>
              </button>
              <a
                href="/launch?key=rsltc2026"
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-[#e6007e] hover:bg-[#c7006e] text-xs font-semibold text-white flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Open Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Test Countdown Preview Link */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Public Countdown Preview (Safe Test)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                Bypass Flag
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Preview the countdown page anytime without locking the site for the public.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="/?test_countdown=true"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-2 transition"
              >
                <span>Preview Countdown Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Target Date & Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-5 shadow-xl"
      >
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Clock className="w-4 h-4 text-[#e6007e]" />
          <span>Countdown Schedule & Event Settings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Target Launch Date & Time (ISO / SLST format)
            </label>
            <input
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="2026-11-21T15:00:00+05:30"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-[#e6007e]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Currently set to <strong>November 21, 2026 at 3:00 PM (15:00 SLST)</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Zero-Countdown Status Message
            </label>
            <input
              type="text"
              value={zeroMessage}
              onChange={(e) => setZeroMessage(e.target.value)}
              placeholder="Standing by for Official Ignition by the Chief Guest..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#e6007e]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Shown to audiences in the hall after the clock hits 3:00 PM while waiting for the VIP button.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c7006e] text-white text-xs font-bold tracking-wide transition shadow-lg shadow-[#e6007e]/20"
          >
            {saving ? "Saving..." : "Save Countdown Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
