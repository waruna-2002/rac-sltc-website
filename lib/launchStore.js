import dbConnect from "./mongodb.js";
import LaunchControl from "../models/LaunchControl.js";
import fs from "fs";
import path from "path";

let memoryCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 500; // 500ms micro-cache

const FALLBACK_CONFIG_PATH = path.join(process.cwd(), "data", "launchControl.json");

const DEFAULT_CONFIG = {
  key: "rotaract_sltc_launch",
  mode: "LIVE",
  isLaunched: false,
  targetDate: "2026-11-21T15:00:00+05:30",
  launchedAt: null,
  launchedBy: null,
  zeroMessage: "Standing by for Official Ignition by the Chief Guest...",
};

function readLocalConfigFile() {
  try {
    if (fs.existsSync(FALLBACK_CONFIG_PATH)) {
      const raw = fs.readFileSync(FALLBACK_CONFIG_PATH, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn("Failed to read local launchControl.json:", e.message);
  }
  return { ...DEFAULT_CONFIG };
}

function writeLocalConfigFile(data) {
  try {
    const dir = path.dirname(FALLBACK_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write local launchControl.json:", e.message);
  }
}

export function invalidateLaunchCache() {
  memoryCache = null;
  lastCacheTime = 0;
}

export async function getLaunchControl() {
  const now = Date.now();
  if (memoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  // 1. Read local file as base
  const localConfig = readLocalConfigFile();

  try {
    await dbConnect();
    let config = await LaunchControl.findOne({ key: "rotaract_sltc_launch" }).lean();
    if (!config) {
      config = await LaunchControl.create(localConfig);
    }

    memoryCache = {
      mode: config.mode || localConfig.mode || "LIVE",
      isLaunched: Boolean(config.isLaunched),
      targetDate: config.targetDate || localConfig.targetDate || "2026-11-21T15:00:00+05:30",
      launchedAt: config.launchedAt || localConfig.launchedAt || null,
      launchedBy: config.launchedBy || localConfig.launchedBy || null,
      zeroMessage: config.zeroMessage || localConfig.zeroMessage || "Standing by for Official Ignition by the Chief Guest...",
    };
    lastCacheTime = now;

    // Sync cloud state back to local file
    writeLocalConfigFile(memoryCache);

    return memoryCache;
  } catch (err) {
    console.warn("MongoDB unavailable for getLaunchControl, using local file config:", err.message);
    memoryCache = localConfig;
    lastCacheTime = now;
    return memoryCache;
  }
}

export async function executeLaunch({ launchedBy = "Chief Guest" }) {
  const current = readLocalConfigFile();
  const updatedState = {
    ...current,
    mode: "LAUNCHED",
    isLaunched: true,
    launchedAt: new Date().toISOString(),
    launchedBy,
  };

  // 1. Immediately persist locally & update cache
  writeLocalConfigFile(updatedState);
  memoryCache = updatedState;
  lastCacheTime = Date.now();

  // 2. Persist to MongoDB in background
  try {
    await dbConnect();
    await LaunchControl.findOneAndUpdate(
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
  } catch (err) {
    console.warn("MongoDB write skipped in executeLaunch (saved locally):", err.message);
  }

  return updatedState;
}

export async function updateLaunchSettings({ mode, isLaunched, targetDate, zeroMessage, resetLaunch }) {
  const current = readLocalConfigFile();
  
  const updatedState = { ...current };

  if (mode !== undefined) {
    updatedState.mode = mode;
    // When switching to COUNTDOWN mode, automatically reset isLaunched so countdown displays
    if (mode === "COUNTDOWN" && isLaunched === undefined) {
      updatedState.isLaunched = false;
      updatedState.launchedAt = null;
      updatedState.launchedBy = null;
    }
  }

  if (isLaunched !== undefined) updatedState.isLaunched = Boolean(isLaunched);
  if (targetDate !== undefined) updatedState.targetDate = targetDate;
  if (zeroMessage !== undefined) updatedState.zeroMessage = zeroMessage;
  
  if (resetLaunch) {
    updatedState.isLaunched = false;
    updatedState.launchedAt = null;
    updatedState.launchedBy = null;
  }

  // 1. Immediately persist locally & update cache
  writeLocalConfigFile(updatedState);
  memoryCache = updatedState;
  lastCacheTime = Date.now();

  // 2. Persist to MongoDB
  try {
    await dbConnect();
    const updatePayload = {
      mode: updatedState.mode,
      isLaunched: updatedState.isLaunched,
      targetDate: updatedState.targetDate,
      zeroMessage: updatedState.zeroMessage,
      launchedAt: updatedState.launchedAt,
      launchedBy: updatedState.launchedBy,
    };

    await LaunchControl.findOneAndUpdate(
      { key: "rotaract_sltc_launch" },
      { $set: updatePayload },
      { upsert: true, new: true }
    ).lean();
  } catch (err) {
    console.warn("MongoDB update skipped in updateLaunchSettings (saved locally):", err.message);
  }

  return updatedState;
}
