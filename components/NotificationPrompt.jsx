"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, Mail, CheckCircle2, ShieldCheck, X, Sparkles, Loader2 } from "lucide-react";

// Helper to convert VAPID base64 public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("push"); // 'push' | 'email'
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pushStatus, setPushStatus] = useState("default"); // 'default' | 'granted' | 'denied' | 'unsupported'

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushStatus("unsupported");
      } else if (Notification.permission === "granted") {
        setPushStatus("granted");
      } else if (Notification.permission === "denied") {
        setPushStatus("denied");
      }
    }
  }, []);

  const handleEnablePush = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setErrorMessage("Browser Push is not supported in this browser. Please use Email Reminders instead.");
        setIsSubmitting(false);
        return;
      }

      // 1. Request notification permission
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission !== "granted") {
        setErrorMessage("Notification permission was denied. Please allow notifications in your browser settings.");
        setIsSubmitting(false);
        return;
      }

      // 2. Register Service Worker
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      // 3. Subscribe to push manager with VAPID key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found in environment.");
      }

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }

      // 4. Send subscription to backend
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "push",
          subscription: sub.toJSON(),
          test: true, // Send immediate welcome test alert
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Push notifications enabled! A test notification has been sent to your device.");
        setPushStatus("granted");
      } else {
        setErrorMessage(data.error || "Failed to save push subscription.");
      }
    } catch (err) {
      console.error("Push registration error:", err);
      setErrorMessage(err.message || "Could not register push notifications.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubscribe = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailInput || !emailInput.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          email: emailInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Success! You will receive email reminders 1 day prior to upcoming events.");
        setEmailInput("");
      } else {
        setErrorMessage(data.error || "Failed to register email.");
      }
    } catch (err) {
      console.error("Email subscription error:", err);
      setErrorMessage("Network error while registering email reminder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Banner / Trigger Bar */}
      <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-r from-[#e6007e]/15 via-slate-900 to-cyan-500/15 border border-[#e6007e]/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#e6007e] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#e6007e]/40 animate-pulse">
            <BellRing size={20} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Never Miss an Upcoming Event</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold">
                1 Day Prior Reminder
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 font-light">
              Turn on event reminders once to receive automated notifications 1 day before any approved Rotaract initiative.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 active:scale-95"
        >
          <Bell size={14} className="text-[#e6007e]" />
          <span>{pushStatus === "granted" ? "Manage Reminders" : "Get Event Reminders"}</span>
        </button>
      </div>

      {/* Subscription Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0c1017] border border-slate-800 p-6 space-y-5 z-10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#e6007e]/20 text-[#ff4d94] flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <h3 className="text-base font-bold text-white">Event Notification Reminders</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Success State */}
            {successMessage ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <p className="text-sm font-semibold text-white">{successMessage}</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 px-5 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Method Tabs: Browser Push vs Email */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("push")}
                    className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeTab === "push"
                        ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <BellRing size={13} />
                    <span>Browser Push</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("email")}
                    className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeTab === "email"
                        ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Mail size={13} />
                    <span>Email Alert</span>
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    {errorMessage}
                  </div>
                )}

                {/* Tab 1: Push Notification */}
                {activeTab === "push" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        Click below to allow instant browser push alerts. Even when your browser is in the background, you will receive reminders:
                      </p>
                      <ul className="text-[11px] text-cyan-400 font-medium space-y-1 pl-1">
                        <li>✓ 1 day before the event starts (at 09:00 AM)</li>
                        <li>✓ On the event day morning</li>
                        <li>✓ 100% spam-free, only verified club events</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleEnablePush}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e6007e] to-[#ff4d94] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-[#e6007e]/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Activating Push...</span>
                        </>
                      ) : (
                        <>
                          <BellRing size={15} />
                          <span>{pushStatus === "granted" ? "Re-send Test Notification" : "Allow Browser Notifications"}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Tab 2: Email Reminder */}
                {activeTab === "email" && (
                  <form onSubmit={handleEmailSubscribe} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-[#e6007e] text-white text-xs outline-none transition-colors"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400">
                      We will dispatch an automated email with full event schedule and venue details 24 hours prior to each approved event.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-[#e6007e]/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Registering Email...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={15} />
                          <span>Subscribe to Email Reminders</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
