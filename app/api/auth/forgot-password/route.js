import { NextResponse } from "next/server";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import {
  getAdminUser,
  createOtp,
  DEFAULT_ADMIN_EMAIL,
} from "@/lib/adminUserStore";
import { sendOtpEmail } from "@/lib/emailService";

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    const rateCheck = checkServerRateLimit(`forgot:${ip}`, {
      limit: 3,
      windowMs: 15 * 60 * 1000, // 3 requests per 15 mins
    });

    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many password reset requests from this network. Please wait."
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = (body.email || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();

    const admin = await getAdminUser(email);
    if (!admin) {
      // Don't disclose user existence to unauthenticated callers, but for our admin system reject if non-admin
      return NextResponse.json(
        { success: false, error: "The provided email is not recognized as an Administrator." },
        { status: 404 }
      );
    }

    const otpData = await createOtp(email, "password_reset");
    if (!otpData) {
      return NextResponse.json(
        { success: false, error: "Failed to generate password reset code." },
        { status: 500 }
      );
    }

    // Dispatch verification code via email
    await sendOtpEmail({
      to: email,
      otp: otpData.code,
      purpose: "password_reset",
    });

    return NextResponse.json({
      success: true,
      email,
      tempToken: otpData.tempToken,
      message: `A 6-digit password reset code was dispatched to ${email}.`,
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otpData.code } : {}),
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { success: false, error: "Forgot password service error." },
      { status: 500 }
    );
  }
}
