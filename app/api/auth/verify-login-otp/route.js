import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { 
  createSessionToken, 
  SESSION_COOKIE_NAME 
} from "@/lib/serverAuth";
import { 
  getClientIp, 
  checkServerRateLimit, 
  resetServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import {
  getAdminUser,
  verifyOtp,
  registerTrustedDevice,
  signDeviceToken,
  TRUSTED_DEVICE_COOKIE_NAME,
  DEFAULT_ADMIN_EMAIL,
} from "@/lib/adminUserStore";

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown Browser";

    const rateCheck = checkServerRateLimit(`otp:${ip}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many OTP verification attempts."
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = (body.email || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
    const otp = (body.otp || "").toString().trim();
    const tempToken = (body.tempToken || "").trim();

    if (!otp) {
      return NextResponse.json(
        { success: false, error: "6-digit OTP code is required." },
        { status: 400 }
      );
    }

    const admin = await getAdminUser(email);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin account not found." },
        { status: 404 }
      );
    }

    const otpResult = await verifyOtp(email, otp, "login_2fa", tempToken);

    if (!otpResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: otpResult.error || "Incorrect verification code.",
          remainingAttempts: otpResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP Verified! Register device as trusted
    const newDeviceId = crypto.randomUUID();
    await registerTrustedDevice(email, {
      deviceId: newDeviceId,
      userAgent,
      ip,
    });

    resetServerRateLimit(`otp:${ip}`);
    resetServerRateLimit(`login:${ip}`);

    const sessionToken = createSessionToken(admin.role || "super_admin");
    const signedDevice = signDeviceToken(newDeviceId);

    const response = NextResponse.json({
      success: true,
      role: admin.role || "super_admin",
      message: "Device successfully authorized and trusted.",
    });

    // 1. Set Session Cookie (7 days)
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // 2. Set Trusted Device Cookie (90 days)
    response.cookies.set(TRUSTED_DEVICE_COOKIE_NAME, signedDevice, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 90 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/verify-login-otp error:", error);
    return NextResponse.json(
      { success: false, error: "Verification service error." },
      { status: 500 }
    );
  }
}
