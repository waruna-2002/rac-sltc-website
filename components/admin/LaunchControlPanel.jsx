"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket,
  Clock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Eye,
  RotateCcw,
  Sparkles,
  Calendar,
  Lock,
  Radio,
} from "lucide-react";

export default function LaunchControlPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for Date & Time (User friendly!)
  const [dateValue, setDateValue] = useState("2026-11-21");
  const [timeValue, setTimeValue] = useState("15:00");
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

        // Parse target date into date and time
        const rawDate = data.config.targetDate || "2026-11-21T15:00:00+05:30";
        if (rawDate.includes("T")) {
          const parts = rawDate.split("T");
          setDateValue(parts[0] || "2026-11-21");
          setTimeValue(parts[1]?.substring(0, 5) || "15:00");
        }

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

      const payload = { mode: newMode };
      if (newMode === "COUNTDOWN") {
        payload.isLaunched = false;
        payload.resetLaunch = true;
      }

      const res = await fetch("/api/launch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setStatusMsg({
          type: "success",
          text:
            newMode === "COUNTDOWN"
              ? "Countdown Mode activated! Public visitors will now see the pre-launch countdown."
              : "Live Mode activated! Website is now open to the public.",
        });
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to update site mode.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Network error updating site mode." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetLaunch = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the launch? The site will revert to pre-launch Countdown mode."
      )
    )
      return;

    try {
      setSaving(true);
      setStatusMsg({ type: "", text: "" });

      const res = await fetch("/api/launch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetLaunch: true, mode: "COUNTDOWN", isLaunched: false }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        if (typeof window !== "undefined") {
          localStorage.removeItem("rotaract_site_launched");
          localStorage.removeItem("rotaract_launch_unlocked");
        }
        setStatusMsg({
          type: "success",
          text: "Launch reset successfully! Site reverted to Countdown mode.",
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

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg({ type: "", text: "" });

      const combinedIso = `${dateValue}T${timeValue}:00+05:30`;

      const res = await fetch("/api/launch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDate: combinedIso,
          zeroMessage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setStatusMsg({
          type: "success",
          text: "Countdown schedule saved successfully!",
        });
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to save countdown schedule.",
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
        <span>Loading Launch Control...</span>
      </div>
    );
  }

  const currentMode = config?.mode || "LIVE";
  const isLaunched = Boolean(config?.isLaunched);
  const isCountdownActive = currentMode === "COUNTDOWN" && !isLaunched;

  // Pretty human date
  let formattedTargetDate = `${dateValue} at ${timeValue}`;
  try {
    const dt = new Date(`${dateValue}T${timeValue}:00+05:30`);
    if (!isNaN(dt.getTime())) {
      formattedTargetDate =
        dt.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }) + ` at ${timeValue} (SLST)`;
    }
  } catch {}

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[#e6007e] text-xs font-semibold mb-2">
            <Rocket className="w-3.5 h-3.5" />
            <span>WEBSITE LAUNCH PORTAL</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Launch & Countdown Control
          </h2>
          <p className="text-sm text-slate-400">
            Control public access, pre-launch countdown, and stage launch.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConfig}
          disabled={saving}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Alert Notification */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-2.5 transition-all ${
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

      {/* SECTION 1: PUBLIC ACCESS MODE (SIMPLE 2-OPTION SWITCH) */}
      <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Globe className="w-4.5 h-4.5 text-[#e6007e]" />
            <span>Public Website Mode</span>
          </div>

          {/* Current Live Badge */}
          {isLaunched ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
              <Sparkles className="w-3 h-3" />
              Officially Launched
            </span>
          ) : isCountdownActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6007e]/20 text-[#ff66ab] border border-[#e6007e]/40 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#e6007e] animate-ping" />
              Countdown Active (Site Locked)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Live Mode (Site Open)
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Choose what public visitors see when they open{" "}
          <strong className="text-slate-300 font-mono">rotaractsltc.lk</strong>:
        </p>

        {/* 2 Big Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* OPTION 1: LIVE SITE */}
          <div
            onClick={() => !saving && handleModeChange("LIVE")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              currentMode === "LIVE"
                ? "bg-emerald-950/25 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/30"
                : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Live Website Mode
                </span>
                {currentMode === "LIVE" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                The entire website is open to everyone. No countdown screen.
                Ideal for university and district reviewers.
              </p>
            </div>

            <button
              type="button"
              disabled={saving || currentMode === "LIVE"}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentMode === "LIVE"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                  : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
            >
              {currentMode === "LIVE" ? "Currently Active" : "Switch to Live Mode"}
            </button>
          </div>

          {/* OPTION 2: COUNTDOWN MODE */}
          <div
            onClick={() => !saving && handleModeChange("COUNTDOWN")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isCountdownActive
                ? "bg-[#e6007e]/15 border-[#e6007e]/70 shadow-lg shadow-[#e6007e]/20 ring-2 ring-[#e6007e]/40"
                : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff66ab]" />
                  Countdown Mode
                </span>
                {isCountdownActive && (
                  <CheckCircle2 className="w-4 h-4 text-[#ff66ab]" />
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Locks the site for public visitors and displays the animated
                countdown clock until the official stage ignition.
              </p>
            </div>

            <button
              type="button"
              disabled={saving || isCountdownActive}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isCountdownActive
                  ? "bg-[#e6007e]/30 text-[#ff66ab] border border-[#e6007e]/50 cursor-default"
                  : "bg-[#e6007e] hover:bg-[#c7006e] text-white shadow-md shadow-[#e6007e]/25"
              }`}
            >
              {isCountdownActive ? "Currently Active" : "Activate Countdown Mode"}
            </button>
          </div>
        </div>

        {/* If site is currently launched, provide Reset button */}
        {isLaunched && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3 mt-2">
            <div>
              <p className="text-xs font-bold text-amber-300">
                Site was launched on stage!
              </p>
              <p className="text-[11px] text-slate-400">
                Launched by: {config?.launchedBy || "Chief Guest"}. Want to run
                the launch again?
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetLaunch}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Countdown</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: VIP STAGE LAUNCH SCREEN (FOR CHIEF GUEST) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1017] to-slate-900 border border-[#e6007e]/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Rocket className="w-4.5 h-4.5 text-[#e6007e]" />
            <span>VIP Stage Launch Screen</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e6007e]/20 text-[#ff66ab] font-mono border border-[#e6007e]/30">
            Passkey: rsltc2026
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Open this screen on the stage laptop or tablet for the Chief Guest.
          When they press the giant <strong>LAUNCH WEBSITE</strong> button, the 3.. 2.. 1.. sequence will trigger with audio and immediately open the live website.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="/launch?key=rsltc2026"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c7006e] text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-[#e6007e]/25 cursor-pointer"
          >
            <span>Open Stage Launch Screen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={copyStageLink}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? "Link Copied!" : "Copy Stage Link"}</span>
          </button>

          <a
            href="/?test_countdown=true"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-slate-800 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Countdown</span>
          </a>
        </div>
      </div>

      {/* SECTION 3: COUNTDOWN DATE & TIME SETTINGS */}
      <form
        onSubmit={handleSaveSchedule}
        className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Calendar className="w-4.5 h-4.5 text-[#e6007e]" />
            <span>Countdown Schedule Settings</span>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Target: <strong className="text-white">{formattedTargetDate}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Launch Date
            </label>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#e6007e]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Launch Time (SLST)
            </label>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#e6007e]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
            Hall Status Message (After countdown hits zero)
          </label>
          <input
            type="text"
            value={zeroMessage}
            onChange={(e) => setZeroMessage(e.target.value)}
            placeholder="Standing by for Official Ignition by the Chief Guest..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#e6007e]"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            Shown to the audience in the hall once the clock reaches 00:00:00 while waiting for the VIP button to be pressed.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c7006e] text-white text-xs font-bold tracking-wide transition shadow-lg shadow-[#e6007e]/25 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Schedule Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
