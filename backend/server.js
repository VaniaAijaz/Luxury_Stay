/**
 * LuxuryStay Hospitality — Backend Server
 * =========================================
 * Entry point for the Express application.
 * Loads environment variables, connects to MongoDB,
 * registers all middleware and routes, then starts listening.
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Load environment variables from .env file
dotenv.config();

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Import all route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const { checkInRouter, checkOutRouter } = require("./routes/checkInOutRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const housekeepingRoutes = require("./routes/housekeepingRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// Enable CORS — allow frontend on port 5173 (Vite) and 3000 (CRA)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
}));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/checkin", checkInRouter);
app.use("/api/checkout", checkOutRouter);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/services", serviceRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏨 LuxuryStay Hospitality API is running",
    version: "1.0.0",
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
  );
});
