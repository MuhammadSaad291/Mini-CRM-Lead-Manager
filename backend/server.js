import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ----- Middleware -----
app.use(
  cors()
);
app.use(express.json());

// ----- Health check -----
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Mini CRM Lead Manager API" });
});

// ----- Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

// ----- Error handling -----
app.use(notFound);
app.use(errorHandler);

// ----- Start -----
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // Seed a demo account + sample leads on first run (no-op if data exists).
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  });
