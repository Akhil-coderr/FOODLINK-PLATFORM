const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const requestRoutes = require("./routes/requestRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const qrRoutes = require("./routes/qrRoutes");
const adminRoutes = require("./routes/adminRoutes");
const impactRoutes = require("./routes/impactRoutes");
const contactRoutes = require("./routes/contactRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const rewardRoutes = require("./routes/rewardRoutes");

const app = express();

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const allowedOrigins = [
  "https://foodlink-platform.onrender.com",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during local development
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Serve uploaded media statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rewards", rewardRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    system: "FoodLink API",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// 404 handler for unhandled API routes (prevents /api/* from falling through to frontend index.html)
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Production Frontend Configuration
const clientDistPath = path.resolve(__dirname, "../client/dist");
const indexPath = path.join(clientDistPath, "index.html");

// 1. Serve static frontend assets from client/dist (JS, CSS, images, icons, manifest)
app.use(express.static(clientDistPath));

// 2. SPA Fallback: Serve client/dist/index.html for all non-API GET requests
// Supports direct browser navigation and page refresh across all React routes (e.g. /login, /about, /donor/dashboard, /ngo/dashboard, /volunteer/dashboard, /admin/dashboard)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      if (!res.headersSent) {
        res
          .status(err.status || 500)
          .send(
            'Frontend build not found. Please build the client using "npm run build".',
          );
      }
    }
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
