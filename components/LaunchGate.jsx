"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ComingSoonCountdown from "./ComingSoonCountdown";

function LaunchGateInner({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [launchStatus, setLaunchStatus] = useState(null);

  const isTestCountdown = searchParams?.get("test_countdown") === "true";
  const isBypassCountdown = searchParams?.get("bypass_countdown") === "true";

  // Check if current route is exempted (admin, stage launch screen, or api)
  const isExemptRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/launch") ||
    pathname?.startsWith("/api");

  useEffect(() => {
    let isMounted = true;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/launch/status?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
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

  // If user passed ?test_countdown=true, force show countdown for preview
  if (isTestCountdown) {
    return <ComingSoonCountdown initialConfig={launchStatus} />;
  }

  // Pre-launch Countdown condition:
  // Mode is COUNTDOWN and site is not yet launched
  const isCountdownActive =
    launchStatus?.mode === "COUNTDOWN" && !launchStatus?.isLaunched;

  if (isCountdownActive) {
    return (
      <ComingSoonCountdown
        initialConfig={launchStatus}
        onUnlock={() => {
          setLaunchStatus((prev) => (prev ? { ...prev, isLaunched: true } : null));
        }}
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
