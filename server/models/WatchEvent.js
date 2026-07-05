import mongoose from "mongoose";
import { isUsingRealMongoDB } from "../db.js";

const WatchEventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  repoFullName: { type: String, required: true },
  filename: { type: String, required: true },
  line: { type: Number, required: true },
  issue: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const MongoWatchEvent = mongoose.model("WatchEvent", WatchEventSchema);

// Memory database collection fallback
const memoryWatchEvents = [];

export const WatchEvent = {
  find: async (query) => {
    if (isUsingRealMongoDB) {
      return await MongoWatchEvent.find(query).sort({ timestamp: -1 });
    }
    const filtered = memoryWatchEvents.filter((we) => {
      for (const key in query) {
        if (we[key] !== query[key]) return false;
      }
      return true;
    });
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  create: async (data) => {
    if (isUsingRealMongoDB) {
      return await MongoWatchEvent.create(data);
    }
    const newEvent = {
      _id: `event_${Date.now()}_${Math.random()}`,
      ...data,
      timestamp: new Date(),
    };
    memoryWatchEvents.push(newEvent);
    return newEvent;
  }
};
