// Configure the Express application
// This file wires together middlewares and routes

const express = require("express");
const cors = require("cors");
const path = require("path");
const usecaseRoutes = require("./routes/usecase.routes");
const authRoutes = require("./routes/auth.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const { CLIENT_ORIGIN } = require("./config/server.config");

// Initialize Express app
const app = express();

// Allow the frontend to call this API and parse incoming JSON bodies
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Simple health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Mount use case routes under /api/usecases
app.use("/api/auth", authRoutes);
app.use("/api/usecases", usecaseRoutes);

// Handle unknown routes and unexpected errors
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
