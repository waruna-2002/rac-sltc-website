"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import ComingSoonCountdown from "./ComingSoonCountdown";

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
    return <>{children}</>;
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

  // If admin is logged in and mode is COUNTDOWN, allow clean admin preview
  const isCountdownActive =
    launchStatus?.mode === "COUNTDOWN" && !launchStatus?.isLaunched && !hasUnlockedLocally;

  if (isCountdownActive && adminRole && !isVerifying) {
    return <>{children}</>;
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
