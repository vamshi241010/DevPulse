import mongoose from "mongoose";
import { isUsingRealMongoDB } from "../db.js";

const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarUrl: { type: String },
  accessToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MongoUser = mongoose.model("User", UserSchema);

// Memory database collection fallback
const memoryUsers = [];

export const User = {
  findOne: async (query) => {
    if (isUsingRealMongoDB) {
      return await MongoUser.findOne(query);
    }
    return memoryUsers.find((u) => {
      for (const key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  findById: async (id) => {
    if (isUsingRealMongoDB) {
      return await MongoUser.findById(id);
    }
    return memoryUsers.find((u) => u.id === id || u._id === id) || null;
  },

  create: async (data) => {
    if (isUsingRealMongoDB) {
      return await MongoUser.create(data);
    }
    const existingIndex = memoryUsers.findIndex((u) => u.githubId === data.githubId);
    if (existingIndex !== -1) {
      memoryUsers[existingIndex] = {
        ...memoryUsers[existingIndex],
        ...data,
      };
      return memoryUsers[existingIndex];
    }
    const newUser = {
      _id: `user_${Date.now()}`,
      id: `user_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    memoryUsers.push(newUser);
    return newUser;
  }
};
