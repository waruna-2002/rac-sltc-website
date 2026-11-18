"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import ComingSoonCountdown from "./ComingSoonCountdown";
import Link from "next/link";
import { ShieldCheck, Eye, ArrowRight } from "lucide-react";

function LaunchGateInner({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { adminRole, isVerifying } = useAdmin();

  const [launchStatus, setLaunchStatus] = useState(null);
  const [hasUnlockedLocally, setHasUnlockedLocally] = useState(false);

  const isTestCountdown = searchParams?.get("test_countdown") === "true";
  const isBypassCountdown = searchParams?.get("bypass_countdown") === "true";

  // Check if current route is exempted
  const isExemptRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/launch") ||
    pathname?.startsWith("/api");

  useEffect(() => {
    let isMounted = true;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/launch/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setLaunchStatus(data);
          }
        }
      } catch (err) {
        console.warn("LaunchGate fetchStatus error:", err);
      }
    }

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // If path is /admin or /launch, never block
  if (isExemptRoute) {
    return <>{children}</>;
  }

  // If user passed ?bypass_countdown=true, let them through
  if (isBypassCountdown) {
    return (
      <>
        <div className="bg-amber-600/90 text-white text-xs font-semibold py-1.5 px-4 text-center sticky top-0 z-[100] backdrop-blur-md flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          <span>Bypass Mode Active: Viewing site with countdown bypassed.</span>
        </div>
        {children}
      </>
    );
  }

  // If user passed ?test_countdown=true, force show countdown for testing
  if (isTestCountdown && !hasUnlockedLocally) {
    return (
      <ComingSoonCountdown
        onUnlock={() => setHasUnlockedLocally(true)}
        initialConfig={launchStatus}
      />
    );
  }

  // If admin is logged in and mode is COUNTDOWN, allow admin preview with a top banner
  const isCountdownActive =
    launchStatus?.mode === "COUNTDOWN" && !launchStatus?.isLaunched && !hasUnlockedLocally;

  if (isCountdownActive && adminRole && !isVerifying) {
    return (
      <>
        <div className="bg-[#e6007e]/90 text-white text-xs font-semibold py-2 px-4 text-center sticky top-0 z-[100] backdrop-blur-md flex items-center justify-center gap-3 shadow-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>
            <strong>Admin Preview:</strong> Public visitors currently see the Pre-Launch Countdown.
          </span>
          <Link
            href="/admin?tab=launch"
            className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white rounded-full px-2.5 py-0.5 transition"
          >
            Launch Controls <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {children}
      </>
    );
  }

  // If Pre-launch Countdown mode is active and site is not yet launched
  if (isCountdownActive) {
    return (
      <ComingSoonCountdown
        onUnlock={() => setHasUnlockedLocally(true)}
        initialConfig={launchStatus}
      />
    );
  }

  // Default: Site is LIVE! Render children normally
  return <>{children}</>;
}

export default function LaunchGate({ children }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LaunchGateInner>{children}</LaunchGateInner>
    </Suspense>
  );
}
