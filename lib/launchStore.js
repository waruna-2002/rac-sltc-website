import dbConnect from "@/lib/mongodb";
import LaunchControl from "@/models/LaunchControl";

let memoryCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 1500; // 1.5s server-level micro-cache

export function invalidateLaunchCache() {
  memoryCache = null;
  lastCacheTime = 0;
}

export async function getLaunchControl() {
  const now = Date.now();
  if (memoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    await dbConnect();
    let config = await LaunchControl.findOne({ key: "rotaract_sltc_launch" }).lean();
    if (!config) {
      config = await LaunchControl.create({
        key: "rotaract_sltc_launch",
        mode: "LIVE", // Default is LIVE for approval safety!
        isLaunched: false,
        targetDate: "2026-11-21T15:00:00+05:30",
        launchedAt: null,
        launchedBy: null,
        zeroMessage: "Standing by for Official Ignition by the Chief Guest...",
      });
    }

    memoryCache = {
      mode: config.mode || "LIVE",
      isLaunched: Boolean(config.isLaunched),
      targetDate: config.targetDate || "2026-11-21T15:00:00+05:30",
      launchedAt: config.launchedAt || null,
      launchedBy: config.launchedBy || null,
      zeroMessage: config.zeroMessage || "Standing by for Official Ignition by the Chief Guest...",
    };
    lastCacheTime = now;
    return memoryCache;
  } catch (err) {
    console.error("Database connection error in getLaunchControl:", err);
    return {
      mode: "LIVE",
      isLaunched: false,
      targetDate: "2026-11-21T15:00:00+05:30",
      launchedAt: null,
      launchedBy: null,
      zeroMessage: "Standing by for Official Ignition by the Chief Guest...",
    };
  }
}

export async function executeLaunch({ launchedBy = "Chief Guest" }) {
  await dbConnect();
  const updated = await LaunchControl.findOneAndUpdate(
    { key: "rotaract_sltc_launch" },
    {
      $set: {
        mode: "LAUNCHED",
        isLaunched: true,
        launchedAt: new Date(),
        launchedBy,
      },
    },
    { upsert: true, new: true }
  ).lean();

  invalidateLaunchCache();
  return updated;
}

export async function updateLaunchSettings({ mode, isLaunched, targetDate, zeroMessage, resetLaunch }) {
  await dbConnect();
  
  const updatePayload = {};
  if (mode !== undefined) updatePayload.mode = mode;
  if (isLaunched !== undefined) updatePayload.isLaunched = isLaunched;
  if (targetDate !== undefined) updatePayload.targetDate = targetDate;
  if (zeroMessage !== undefined) updatePayload.zeroMessage = zeroMessage;
  
  if (resetLaunch) {
    updatePayload.isLaunched = false;
    updatePayload.launchedAt = null;
    updatePayload.launchedBy = null;
  }

  const updated = await LaunchControl.findOneAndUpdate(
    { key: "rotaract_sltc_launch" },
    { $set: updatePayload },
    { upsert: true, new: true }
  ).lean();

  invalidateLaunchCache();
  return updated;
}
