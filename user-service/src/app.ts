import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { connectRedis } from "./redis/client";
import { initUserIndex } from "./elasticsearch/initIndex";

dotenv.config();

(async () => {
  try {
    await connectRedis();
    await initUserIndex();
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    const app = express();
    app.use(express.json());

    app.use("/api/auth", authRoutes);

    app.listen(3000, () => {
      console.log("🚀 User Service running on port 3000");
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
  }
})();