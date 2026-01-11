const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Middleware - CORS configured for frontend with credentials
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Frontend URL
    credentials: true, // Allow cookies/auth headers
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve uploaded files
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
