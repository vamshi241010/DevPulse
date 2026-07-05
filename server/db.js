import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export let isUsingRealMongoDB = false;

export function connectDB() {
  if (MONGODB_URI) {
    mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        console.log("✅ Successfully connected to MongoDB");
        isUsingRealMongoDB = true;
      })
      .catch((err) => {
        console.log(`ℹ️ MongoDB connection not available (${err.message}). Running in Memory Sandbox fallback mode.`);
        isUsingRealMongoDB = false;
      });
  } else {
    console.log("ℹ️ No MONGODB_URI specified. Running in Memory Sandbox fallback mode.");
    isUsingRealMongoDB = false;
  }
}
