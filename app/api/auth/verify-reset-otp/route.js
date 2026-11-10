import { NextResponse } from "next/server";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import {
  verifyOtp,
  createPasswordResetToken,
  DEFAULT_ADMIN_EMAIL,
} from "@/lib/adminUserStore";

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    const rateCheck = checkServerRateLimit(`verify-reset:${ip}`, {
      limit: 6,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many verification attempts."
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

    const otpResult = await verifyOtp(email, otp, "password_reset", tempToken);

    if (!otpResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: otpResult.error || "Invalid verification code.",
          remainingAttempts: otpResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP verified! Generate a time-limited one-time reset token (15 mins)
    const resetToken = await createPasswordResetToken(email);

    return NextResponse.json({
      success: true,
      resetToken,
      message: "OTP verified successfully. You may now set your new password.",
    });
  } catch (error) {
    console.error("POST /api/auth/verify-reset-otp error:", error);
    return NextResponse.json(
      { success: false, error: "OTP verification service error." },
      { status: 500 }
    );
  }
}
