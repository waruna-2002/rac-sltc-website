import { NextResponse } from "next/server";

// In-memory token bucket / sliding window storage
const ipTracker = new Map();

/**
 * Extract reliable Client IP address from request headers
 */
export function getClientIp(request) {
  if (!request) return "127.0.0.1";

  // Standard reverse proxy / CDN headers
  const forwarded = request.headers?.get("x-forwarded-for");
  if (forwarded) {
    // In multi-hop proxies, the first IP is the real client IP
    const clientIp = forwarded.split(",")[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = request.headers?.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers?.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Check and register an attempt for an IP key
 * @param {string} key - Unique key combining scope and IP (e.g. 'auth:1.2.3.4')
 * @param {object} options - { limit: number, windowMs: number }
 */
export function checkServerRateLimit(key, { limit = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();

  // Lazy clean-up if memory Map exceeds 2000 entries
  if (ipTracker.size > 2000) {
    for (const [k, v] of ipTracker.entries()) {
      if (now > v.resetTime) {
        ipTracker.delete(k);
      }
    }
  }

  const record = ipTracker.get(key);

  if (!record || now > record.resetTime) {
    ipTracker.set(key, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}

/**
 * Reset rate limit counter on successful action (e.g., successful login)
 */
export function resetServerRateLimit(key) {
  ipTracker.delete(key);
}

/**
 * Standard 429 Too Many Requests response builder
 */
export function rateLimitExceededResponse(
  resetInSeconds,
  message = "Too many requests from your IP address."
) {
  return NextResponse.json(
    {
      success: false,
      error: `${message} Please try again in ${resetInSeconds} seconds.`,
      retryAfter: resetInSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(resetInSeconds),
      },
    }
  );
}
