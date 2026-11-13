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

  // Fail fast if recent connection error
  const now = Date.now();
  if (cached.lastError && now - cached.lastAttempt < 10000) {
    throw cached.lastError;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10s timeout for cloud Atlas connectivity
      socketTimeoutMS: 25000,
      maxPoolSize: 10,
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
