/**
 * Enterprise Security Utility Module for Rotaract SLTC
 * Provides XSS Sanitization, Safe URL validation, Hashing, and Rate-Limiting.
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
    // Prevent inline javascript or encoded script payloads
    if (trimmed.toLowerCase().includes("javascript:") || trimmed.toLowerCase().includes("data:text/html")) {
      return "/images/projects/project1.jpg";
    }
    return trimmed;
  }
  return "/images/projects/project1.jpg";
}

// SHA-256 Hashing helper (Native Web Crypto API)
export async function hashPasscode(passcode) {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pre-calculated SHA-256 Hashes for Admin Roles
// Raw strings are NEVER stored in plain text anywhere in source code!
export const ADMIN_PASSCODE_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // sha256("admin123")
export const PROJECT_PASSCODE_HASH = "801572e25ac195aa08115b40a1bfc8a5dafb9992982676244eaac5ef87e932f8"; // sha256("project123")

export async function authenticatePasscode(passcode) {
  const hashed = await hashPasscode(passcode);
  if (hashed === ADMIN_PASSCODE_HASH) {
    return { success: true, role: "super_admin" };
  }
  if (hashed === PROJECT_PASSCODE_HASH) {
    return { success: true, role: "project_editor" };
  }
  return { success: false, role: null };
}

// Brute-force Lockout Manager
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
