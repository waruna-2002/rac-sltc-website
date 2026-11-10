/**
 * Enterprise Security Utility Module for Rotaract SLTC
 * Provides XSS Sanitization, Safe URL validation, Rate-Limiting,
 * and Client Authentication API Handlers (2FA & Password Reset).
 * (Authentication is strictly executed on the server via /api/auth/*)
 */

// XSS Sanitizer: Strips potentially dangerous HTML tags and script handlers
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Safe URL Validator: Prevents javascript: XSS injection vectors
export function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "/images/projects/project1.jpg";
  const trimmed = url.trim();

  // Allow safe relative paths and standard http/https protocols
  if (trimmed.startsWith("/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    if (trimmed.toLowerCase().includes("javascript:") || trimmed.toLowerCase().includes("data:text/html")) {
      return "/images/projects/project1.jpg";
    }
    return trimmed;
  }
  return "/images/projects/project1.jpg";
}

/**
 * Authenticate Admin credentials against /api/auth/login
 * Supports both { email, password } and legacy (passcode)
 */
export async function authenticateAdmin(credentials) {
  try {
    const payload = typeof credentials === "string" 
      ? { password: credentials } 
      : credentials;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.requireOtp) {
        return {
          success: true,
          requireOtp: true,
          email: data.email,
          tempToken: data.tempToken,
          message: data.message,
          reason: data.reason,
          devOtp: data.devOtp,
        };
      }
      return { success: true, role: data.role, message: data.message };
    }
    return { 
      success: false, 
      error: data.error || "Authentication failed.", 
      remainingAttempts: data.remainingAttempts 
    };
  } catch (err) {
    console.error("Auth request error:", err);
    return { success: false, error: "Authentication service unavailable. Please check your connection." };
  }
}

// Backward-compatible alias
export const authenticatePasscode = authenticateAdmin;

/**
 * Verify 2FA OTP for Login
 */
export async function verifyLoginOtp({ email, otp, tempToken }) {
  try {
    const res = await fetch("/api/auth/verify-login-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp, tempToken }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, role: data.role, message: data.message };
    }
    return { 
      success: false, 
      error: data.error || "Invalid OTP code.", 
      remainingAttempts: data.remainingAttempts 
    };
  } catch (err) {
    console.error("Verify OTP error:", err);
    return { success: false, error: "OTP verification failed. Please try again." };
  }
}

/**
 * Request Password Reset OTP
 */
export async function requestForgotPassword({ email }) {
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        email: data.email,
        tempToken: data.tempToken,
        message: data.message,
        devOtp: data.devOtp,
      };
    }
    return { success: false, error: data.error || "Password reset request failed." };
  } catch (err) {
    console.error("Forgot password request error:", err);
    return { success: false, error: "Service unavailable. Please try again." };
  }
}

/**
 * Verify Reset OTP Code
 */
export async function verifyResetOtp({ email, otp, tempToken }) {
  try {
    const res = await fetch("/api/auth/verify-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp, tempToken }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        resetToken: data.resetToken,
        message: data.message,
      };
    }
    return { success: false, error: data.error || "Invalid or expired OTP." };
  } catch (err) {
    console.error("Verify reset OTP error:", err);
    return { success: false, error: "Verification failed. Please try again." };
  }
}

/**
 * Set New Password using Reset Token
 */
export async function resetAdminPassword({ email, resetToken, newPassword }) {
  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, resetToken, newPassword }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || "Failed to update password." };
  } catch (err) {
    console.error("Reset password error:", err);
    return { success: false, error: "Service error while resetting password." };
  }
}

// Brute-force Client Lockout Manager
const attemptTracker = new Map();

export function checkRateLimit(identifier = "admin_login", maxAttempts = 5, lockoutDurationMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = attemptTracker.get(identifier) || { attempts: 0, lockoutUntil: 0 };

  if (record.lockoutUntil > now) {
    const remainingSecs = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remainingSecs };
  }

  return { allowed: true, remainingSecs: 0 };
}

export function registerFailedAttempt(identifier = "admin_login", maxAttempts = 5, lockoutDurationMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = attemptTracker.get(identifier) || { attempts: 0, lockoutUntil: 0 };

  record.attempts += 1;

  if (record.attempts >= maxAttempts) {
    record.lockoutUntil = now + lockoutDurationMs;
    record.attempts = 0; // Reset counter for next cycle
    attemptTracker.set(identifier, record);
    return { locked: true, remainingSecs: Math.ceil(lockoutDurationMs / 1000) };
  }

  attemptTracker.set(identifier, record);
  return { locked: false, remainingAttempts: maxAttempts - record.attempts };
}

export function resetRateLimit(identifier = "admin_login") {
  attemptTracker.delete(identifier);
}
