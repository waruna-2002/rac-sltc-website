import { NextResponse } from "next/server";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import {
  updateAdminPassword,
  DEFAULT_ADMIN_EMAIL,
} from "@/lib/adminUserStore";

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    const rateCheck = checkServerRateLimit(`reset-pass:${ip}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many password reset requests. Please wait."
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = (body.email || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
    const resetToken = (body.resetToken || "").trim();
    const newPassword = (body.newPassword || "").trim();

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "Reset authorization token is missing or expired." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const result = await updateAdminPassword(email, resetToken, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Password update failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! All active sessions have been invalidated. Please log in with your new password.",
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { success: false, error: "Password update service error." },
      { status: 500 }
    );
  }
}
