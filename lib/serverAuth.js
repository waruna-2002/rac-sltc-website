import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "rotaract_admin_session";

// Server-side Secrets (never bundled to browser)
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
const PROJECT_PASSCODE = process.env.PROJECT_PASSCODE || "project123";
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "rotaract_sltc_default_hmac_secret_key_secure_2026";

/**
 * Verify passcode strictly on server
 */
export function verifyAdminPasscode(passcode) {
  if (!passcode || typeof passcode !== "string") {
    return { success: false, error: "Passcode is required" };
  }

  const cleanPasscode = passcode.trim();

  // Timing safe or constant time match
  const adminBuf = Buffer.from(ADMIN_PASSCODE);
  const projBuf = Buffer.from(PROJECT_PASSCODE);
  const inputBuf = Buffer.from(cleanPasscode);

  let isSuperAdmin = false;
  let isProjectEditor = false;

  if (adminBuf.length === inputBuf.length && crypto.timingSafeEqual(adminBuf, inputBuf)) {
    isSuperAdmin = true;
  } else if (projBuf.length === inputBuf.length && crypto.timingSafeEqual(projBuf, inputBuf)) {
    isProjectEditor = true;
  }

  if (isSuperAdmin) {
    return { success: true, role: "super_admin" };
  }
  if (isProjectEditor) {
    return { success: true, role: "project_editor" };
  }

  return { success: false, error: "Incorrect passcode" };
}

/**
 * Create a cryptographically signed HMAC-SHA256 session token
 */
export function createSessionToken(role, expiresInDays = 7) {
  const payload = {
    role,
    iat: Date.now(),
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify token authenticity and expiration
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed token" };
  }

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, error: "Invalid cryptographic signature" };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));

    if (Date.now() > payload.exp) {
      return { valid: false, error: "Session token expired" };
    }

    if (!["super_admin", "project_editor"].includes(payload.role)) {
      return { valid: false, error: "Invalid session role" };
    }

    return { valid: true, role: payload.role, exp: payload.exp };
  } catch (e) {
    return { valid: false, error: "Failed to parse session payload" };
  }
}

/**
 * Extract and verify session from Next.js Request
 */
export function getSession(request) {
  let token = null;

  // 1. Try cookie
  if (request && request.cookies && typeof request.cookies.get === "function") {
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  }

  // 2. Try Authorization header
  if (!token && request && request.headers) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return { authenticated: false, role: null };
  }

  const verification = verifySessionToken(token);
  if (verification.valid) {
    return { authenticated: true, role: verification.role };
  }

  return { authenticated: false, role: null, error: verification.error };
}

/**
 * Guard helper for API routes: checks if session has one of allowedRoles
 */
export function requireAdmin(request, allowedRoles = ["super_admin", "project_editor"]) {
  const session = getSession(request);

  if (!session.authenticated) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin session required.",
        },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(session.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Forbidden: This action requires role [${allowedRoles.join(", ")}]. Current role: ${session.role}`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, role: session.role };
}
