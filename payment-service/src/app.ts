import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment.routes";

dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("🟢 Payment Service is running");
});

app.use("/payments", paymentRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 Payment service listening on port ${PORT}`);
});