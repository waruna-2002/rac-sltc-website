import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { executeLaunch } from "@/lib/launchStore";
import { getSession } from "@/lib/serverAuth";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";

export const dynamic = "force-dynamic";

function safeKeyMatch(input, expected) {
  if (!input || typeof input !== "string" || !expected || typeof expected !== "string") {
    return false;
  }
  const inputBuf = Buffer.from(input.trim());
  const expectedBuf = Buffer.from(expected.trim());
  if (inputBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuf, expectedBuf);
}

export async function POST(request) {
  try {
    // Rate limit: Max 5 attempts per 10 minutes per IP to prevent automated brute-force
    const ip = getClientIp(request);
    const rateCheck = checkServerRateLimit(`launch_trigger:${ip}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many launch attempts from this network. Access temporarily throttled."
      );
    }

    const body = await request.json().catch(() => ({}));
    const { key, name } = body;

    const expectedKey = process.env.LAUNCH_SECRET_KEY || "rsltc2026";
    const session = getSession(request);

    // Allow if timing-safe key matches OR if user has a verified admin session
    const isKeyValid = safeKeyMatch(key, expectedKey);
    const isAdmin = session.authenticated && ["super_admin", "project_editor"].includes(session.role);

    if (!isKeyValid && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid launch authorization key. Access denied.",
        },
        { status: 401 }
      );
    }

    const launcherName = name?.trim() || (isAdmin ? `Admin (${session.role})` : "Chief Guest");
    const result = await executeLaunch({ launchedBy: launcherName });

    return NextResponse.json({
      success: true,
      message: "Website has been officially launched!",
      launchedAt: result.launchedAt,
      launchedBy: launcherName,
    });
  } catch (error) {
    console.error("Error during launch trigger:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error triggering launch sequence.",
      },
      { status: 500 }
    );
  }
}
