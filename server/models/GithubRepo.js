import mongoose from "mongoose";
import { isUsingRealMongoDB } from "../db.js";

const GithubRepoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  repoId: { type: Number, required: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  description: { type: String },
  ownerAvatar: { type: String },
  stars: { type: Number, default: 0 },
  language: { type: String },
  isWatching: { type: Boolean, default: false },
});

// Compound index for user & repo combination
GithubRepoSchema.index({ userId: 1, fullName: 1 }, { unique: true });

const MongoGithubRepo = mongoose.model("GithubRepo", GithubRepoSchema);

// Memory database collection fallback
const memoryRepos = [];

export const GithubRepo = {
  find: async (query) => {
    if (isUsingRealMongoDB) {
      return await MongoGithubRepo.find(query);
    }
    return memoryRepos.filter((r) => {
      for (const key in query) {
        if (r[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: async (query) => {
    if (isUsingRealMongoDB) {
      return await MongoGithubRepo.findOne(query);
    }
    return memoryRepos.find((r) => {
      for (const key in query) {
        if (r[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  findOneAndUpdate: async (query, update, options = {}) => {
    if (isUsingRealMongoDB) {
      return await MongoGithubRepo.findOneAndUpdate(query, update, { new: true, upsert: true, ...options });
    }
    let repo = memoryRepos.find((r) => {
      for (const key in query) {
        if (r[key] !== query[key]) return false;
      }
      return true;
    });

    const fieldsToUpdate = typeof update.$set === 'object' ? update.$set : update;

    if (repo) {
      Object.assign(repo, fieldsToUpdate);
    } else if (options.upsert) {
      repo = {
        _id: `repo_${Date.now()}`,
        ...query,
        ...fieldsToUpdate,
      };
      memoryRepos.push(repo);
    }
    return repo;
  },

  insertMany: async (reposList) => {
    if (isUsingRealMongoDB) {
      return await MongoGithubRepo.insertMany(reposList, { ordered: false }).catch(() => {
        // Suppress order key duplicates
      });
    }
    reposList.forEach((r) => {
      const exists = memoryRepos.some((existing) => existing.userId === r.userId && existing.fullName === r.fullName);
      if (!exists) {
        memoryRepos.push({
          _id: `repo_${Date.now()}_${Math.random()}`,
          ...r,
        });
      }
    });
    return reposList;
  }
};
