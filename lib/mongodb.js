import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null, 
    lastAttempt: 0, 
    lastError: null 
  };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt failed within the last 10 seconds, fail immediately to prevent hanging
  const now = Date.now();
  if (cached.lastError && now - cached.lastAttempt < 10000) {
    throw cached.lastError;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // 3s fast fail when unreachable
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      cached.lastError = null;
      return mongoose;
    });
  }

  try {
    cached.lastAttempt = Date.now();
    cached.conn = await cached.promise;
    cached.lastError = null;
  } catch (e) {
    cached.promise = null;
    cached.lastError = e;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
