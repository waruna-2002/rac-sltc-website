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
  verifyPassword,
  verifyDeviceToken,
  checkDeviceTrustStatus,
  registerTrustedDevice,
  createOtp,
  TRUSTED_DEVICE_COOKIE_NAME,
  DEFAULT_ADMIN_EMAIL,
} from "@/lib/adminUserStore";
import { sendOtpEmail } from "@/lib/emailService";

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown Browser";

    const rateCheck = checkServerRateLimit(`login:${ip}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000, // 5 attempts per 15 mins
    });

    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many failed login attempts from this network."
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = (body.email || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
    const password = (body.password || body.passcode || "").trim();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    const admin = await getAdminUser(email);

    if (!admin) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid email or password. (${rateCheck.remaining} attempts remaining)`,
          remainingAttempts: rateCheck.remaining,
        },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, admin.passwordHash, admin.passwordSalt);

    if (!isMatch) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Incorrect password! (${rateCheck.remaining} attempts remaining before temporary lockout)`,
          remainingAttempts: rateCheck.remaining,
        },
        { status: 401 }
      );
    }

    // Password is valid! Check trusted device status & 3-day inactivity rule
    const deviceCookie = request.cookies.get(TRUSTED_DEVICE_COOKIE_NAME)?.value;
    const clientDeviceId = verifyDeviceToken(deviceCookie);
    const trustCheck = checkDeviceTrustStatus(admin, clientDeviceId);

    if (trustCheck.trusted) {
      // TRUSTED & ACTIVE within 3 days: Direct Login!
      resetServerRateLimit(`login:${ip}`);
      await registerTrustedDevice(email, {
        deviceId: clientDeviceId,
        userAgent,
        ip,
      });

      const token = createSessionToken(admin.role || "super_admin");

      const response = NextResponse.json({
        success: true,
        directLogin: true,
        role: admin.role || "super_admin",
        message: "Welcome back! Device authenticated.",
      });

      // Set Session Cookie
      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    // DEVICE IS UNTRUSTED OR 3-DAY INACTIVITY EXPIRED: REQUIRE 2FA OTP
    const otpData = await createOtp(email, "login_2fa");
    if (!otpData) {
      return NextResponse.json(
        { success: false, error: "Failed to generate security OTP." },
        { status: 500 }
      );
    }

    // Send OTP via email
    await sendOtpEmail({
      to: email,
      otp: otpData.code,
      purpose: "login_2fa",
    });

    const isInactive = trustCheck.reason === "inactivity_3_days";
    const statusNote = isInactive
      ? "Your trusted device has been inactive for more than 3 days. A 6-digit OTP has been sent to your email to re-verify."
      : "Login detected from a new browser/device. A 6-digit verification code has been dispatched to your email.";

    return NextResponse.json({
      success: true,
      requireOtp: true,
      email,
      tempToken: otpData.tempToken,
      reason: trustCheck.reason,
      message: statusNote,
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service error." },
      { status: 500 }
    );
  }
}
