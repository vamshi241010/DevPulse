import mongoose from "mongoose";
import { isUsingRealMongoDB } from "../db.js";

const CodeIssueSchema = new mongoose.Schema({
  file: { type: String, required: true },
  line: { type: Number, required: true },
  severity: { type: String, enum: ["error", "warning", "info"], required: true },
  message: { type: String, required: true },
});

const ScanResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  repoFullName: { type: String, required: true },
  score: { type: Number, required: true },
  issues: [CodeIssueSchema],
  createdAt: { type: Date, default: Date.now },
});

const MongoScanResult = mongoose.model("ScanResult", ScanResultSchema);

// Memory database collection fallback
const memoryScanResults = [];

export const ScanResult = {
  findLatest: async (query) => {
    if (isUsingRealMongoDB) {
      return await MongoScanResult.findOne(query).sort({ createdAt: -1 });
    }
    const filtered = memoryScanResults.filter((sr) => {
      for (const key in query) {
        if (sr[key] !== query[key]) return false;
      }
      return true;
    });
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  },
  findHistory: async (query) => {
    if (isUsingRealMongoDB) {
      return await MongoScanResult.find(query).sort({ createdAt: -1 });
    }
    const filtered = memoryScanResults.filter((sr) => {
      for (const key in query) {
        if (sr[key] !== query[key]) return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  },
  create: async (data) => {
    if (isUsingRealMongoDB) {
      return await MongoScanResult.create(data);
    }
    const newScan = {
      _id: `scan_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    memoryScanResults.push(newScan);
    return newScan;
  }
};
