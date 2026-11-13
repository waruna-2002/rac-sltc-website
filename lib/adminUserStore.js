import crypto from "node:crypto";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";

export const TRUSTED_DEVICE_COOKIE_NAME = "rotaract_trusted_device";
export const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days inactivity rule

const DEVICE_SECRET = process.env.ADMIN_SESSION_SECRET || "rotaract_device_secret_salt_2026";
export const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "rotaractsltc@gmail.com").toLowerCase().trim();
const DEFAULT_INITIAL_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";

/**
 * PBKDF2 Password Hashing (OWASP recommended: 100,000 iterations, 16-byte random salt, SHA-512)
 */
export function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(plainPassword, storedHash, storedSalt) {
  if (!plainPassword || !storedHash || !storedSalt) return false;
  try {
    const derived = crypto.pbkdf2Sync(plainPassword, storedSalt, 100000, 64, "sha512").toString("hex");
    const derivedBuf = Buffer.from(derived, "hex");
    const storedBuf = Buffer.from(storedHash, "hex");
    if (derivedBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, storedBuf);
  } catch (e) {
    return false;
  }
}

/**
 * Cryptographic Device Token Signature (prevents cookie tampering)
 */
export function signDeviceToken(deviceId) {
  const signature = crypto
    .createHmac("sha256", DEVICE_SECRET)
    .update(deviceId)
    .digest("base64url");
  return `${deviceId}.${signature}`;
}

export function verifyDeviceToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [deviceId, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", DEVICE_SECRET)
    .update(deviceId)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  return deviceId;
}

// In-Memory Fallback Store (Ensures system functions flawlessly even if local MongoDB is offline)
const fallbackSaltAndHash = hashPassword(DEFAULT_INITIAL_PASSCODE);
let memoryAdminState = {
  email: DEFAULT_ADMIN_EMAIL,
  role: "super_admin",
  passwordHash: fallbackSaltAndHash.hash,
  passwordSalt: fallbackSaltAndHash.salt,
  trustedDevices: [],
  activeOtp: null,
  resetToken: null,
};

/**
 * Retrieve or Seed Admin User
 */
export async function getAdminUser(email = DEFAULT_ADMIN_EMAIL) {
  const cleanEmail = email.toLowerCase().trim();

  try {
    await dbConnect();
    let admin = await AdminUser.findOne({ email: cleanEmail });

    if (!admin && cleanEmail === DEFAULT_ADMIN_EMAIL) {
      // Seed default admin in database
      const initial = hashPassword(DEFAULT_INITIAL_PASSCODE);
      admin = await AdminUser.create({
        email: DEFAULT_ADMIN_EMAIL,
        role: "super_admin",
        passwordHash: initial.hash,
        passwordSalt: initial.salt,
        trustedDevices: [],
      });
      console.log(`[AdminStore] Default admin seeded in MongoDB: ${DEFAULT_ADMIN_EMAIL}`);
    }

    if (admin) return admin;
  } catch (err) {
    console.warn(`[AdminStore] MongoDB connection unavailable (${err.message}). Using memory fallback store.`);
  }

  // Fallback to in-memory store
  if (cleanEmail === memoryAdminState.email) {
    return memoryAdminState;
  }
  return null;
}

/**
 * Validate device against 3-day inactivity rule
 */
export function checkDeviceTrustStatus(admin, deviceId) {
  if (!admin || !deviceId) {
    return { trusted: false, reason: "no_device_id" };
  }

  const devices = admin.trustedDevices || [];
  const device = devices.find((d) => d.deviceId === deviceId);

  if (!device) {
    return { trusted: false, reason: "new_device" };
  }

  const lastActive = new Date(device.lastActiveAt).getTime();
  const elapsed = Date.now() - lastActive;

  if (elapsed > THREE_DAYS_MS) {
    return {
      trusted: false,
      reason: "inactivity_3_days",
      elapsedDays: Math.floor(elapsed / (24 * 60 * 60 * 1000)),
    };
  }

  return { trusted: true, device };
}

/**
 * Trust or Refresh Device
 */
export async function registerTrustedDevice(email, { deviceId, userAgent = "", ip = "" }) {
  const cleanEmail = email.toLowerCase().trim();
  const now = new Date();

  try {
    await dbConnect();
    const admin = await AdminUser.findOne({ email: cleanEmail });
    if (admin) {
      const existingIdx = admin.trustedDevices.findIndex((d) => d.deviceId === deviceId);
      if (existingIdx >= 0) {
        admin.trustedDevices[existingIdx].lastActiveAt = now;
        admin.trustedDevices[existingIdx].ip = ip || admin.trustedDevices[existingIdx].ip;
        admin.trustedDevices[existingIdx].userAgent = userAgent || admin.trustedDevices[existingIdx].userAgent;
      } else {
        admin.trustedDevices.push({
          deviceId,
          userAgent,
          ip,
          createdAt: now,
          lastActiveAt: now,
        });
      }
      admin.markModified("trustedDevices");
      await admin.save();
      return true;
    }
  } catch (err) {
    console.warn(`[AdminStore] DB error in registerTrustedDevice: ${err.message}. Updating memory.`);
  }

  // Update memory fallback
  if (cleanEmail === memoryAdminState.email) {
    const existingIdx = memoryAdminState.trustedDevices.findIndex((d) => d.deviceId === deviceId);
    if (existingIdx >= 0) {
      memoryAdminState.trustedDevices[existingIdx].lastActiveAt = now;
    } else {
      memoryAdminState.trustedDevices.push({
        deviceId,
        userAgent,
        ip,
        createdAt: now,
        lastActiveAt: now,
      });
    }
    return true;
  }

  return false;
}

/**
 * Generate and store a single-use 6-digit OTP
 */
export async function createOtp(email, purpose = "login_2fa") {
  const cleanEmail = email.toLowerCase().trim();
  // Cryptographically secure 6-digit OTP (100000 - 999999)
  const code = crypto.randomInt(100000, 999999).toString();
  const tempToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await dbConnect();
    const admin = await AdminUser.findOne({ email: cleanEmail });
    if (admin) {
      admin.activeOtp = {
        code,
        purpose,
        tempToken,
        expiresAt,
        attempts: 0,
      };
      await admin.save();
      return { code, tempToken, expiresAt };
    }
  } catch (err) {
    console.warn(`[AdminStore] DB error in createOtp: ${err.message}. Using memory store.`);
  }

  if (cleanEmail === memoryAdminState.email) {
    memoryAdminState.activeOtp = {
      code,
      purpose,
      tempToken,
      expiresAt,
      attempts: 0,
    };
    return { code, tempToken, expiresAt };
  }

  return null;
}

/**
 * Verify OTP
 */
export async function verifyOtp(email, inputCode, expectedPurpose, tempToken) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = (inputCode || "").toString().trim();

  const verifyLogic = (activeOtp) => {
    if (!activeOtp || !activeOtp.code) {
      return { valid: false, error: "No active verification code found. Please request a new one." };
    }

    if (activeOtp.purpose !== expectedPurpose) {
      return { valid: false, error: "Invalid verification purpose." };
    }

    if (tempToken && activeOtp.tempToken !== tempToken) {
      return { valid: false, error: "Session token mismatch. Please request a new code." };
    }

    if (new Date() > new Date(activeOtp.expiresAt)) {
      return { valid: false, error: "Verification code expired (10 min limit). Please request a new one." };
    }

    if (activeOtp.attempts >= 5) {
      return { valid: false, error: "Too many incorrect OTP attempts. Code invalidated." };
    }

    if (activeOtp.code !== cleanCode) {
      activeOtp.attempts = (activeOtp.attempts || 0) + 1;
      return { valid: false, error: "Incorrect verification code.", remainingAttempts: 5 - activeOtp.attempts };
    }

    return { valid: true };
  };

  try {
    await dbConnect();
    const admin = await AdminUser.findOne({ email: cleanEmail });
    if (admin) {
      const check = verifyLogic(admin.activeOtp);
      if (!check.valid) {
        await admin.save();
        return check;
      }
      // Valid OTP: clear it
      admin.activeOtp = null;
      await admin.save();
      return { valid: true };
    }
  } catch (err) {
    console.warn(`[AdminStore] DB error in verifyOtp: ${err.message}. Checking memory store.`);
  }

  if (cleanEmail === memoryAdminState.email) {
    const check = verifyLogic(memoryAdminState.activeOtp);
    if (!check.valid) return check;
    memoryAdminState.activeOtp = null;
    return { valid: true };
  }

  return { valid: false, error: "Account not found." };
}

/**
 * Generate Password Reset Token (after OTP verified)
 */
export async function createPasswordResetToken(email) {
  const cleanEmail = email.toLowerCase().trim();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    await dbConnect();
    const admin = await AdminUser.findOne({ email: cleanEmail });
    if (admin) {
      admin.resetToken = { token, expiresAt };
      await admin.save();
      return token;
    }
  } catch (err) {
    console.warn(`[AdminStore] DB error in createPasswordResetToken: ${err.message}.`);
  }

  if (cleanEmail === memoryAdminState.email) {
    memoryAdminState.resetToken = { token, expiresAt };
    return token;
  }

  return token;
}

/**
 * Reset Password, Clear Tokens, and Invalidate all trusted devices
 */
export async function updateAdminPassword(email, resetToken, newPassword) {
  const cleanEmail = email.toLowerCase().trim();
  const { hash, salt } = hashPassword(newPassword);

  const validateResetToken = (tokenRecord) => {
    if (!tokenRecord || !tokenRecord.token) return false;
    if (tokenRecord.token !== resetToken) return false;
    if (new Date() > new Date(tokenRecord.expiresAt)) return false;
    return true;
  };

  try {
    await dbConnect();
    const admin = await AdminUser.findOne({ email: cleanEmail });
    if (admin) {
      if (!validateResetToken(admin.resetToken)) {
        return { success: false, error: "Invalid or expired password reset session." };
      }

      admin.passwordHash = hash;
      admin.passwordSalt = salt;
      admin.resetToken = null;
      admin.activeOtp = null;
      // High-Security feature: Revoke all existing trusted devices on password reset!
      admin.trustedDevices = [];
      await admin.save();
      return { success: true };
    }
  } catch (err) {
    console.warn(`[AdminStore] DB error in updateAdminPassword: ${err.message}.`);
  }

  if (cleanEmail === memoryAdminState.email) {
    if (!validateResetToken(memoryAdminState.resetToken)) {
      return { success: false, error: "Invalid or expired password reset session." };
    }

    memoryAdminState.passwordHash = hash;
    memoryAdminState.passwordSalt = salt;
    memoryAdminState.resetToken = null;
    memoryAdminState.activeOtp = null;
    memoryAdminState.trustedDevices = [];
    return { success: true };
  }

  return { success: false, error: "Admin user not found." };
}
