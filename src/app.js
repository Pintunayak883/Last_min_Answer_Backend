const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

/* =========================
   🔥 GLOBAL CACHE DISABLE
   ========================= */
app.set("etag", false); // IMPORTANT: stop 304 drama

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

/* =========================
   🔐 CORS CONFIG
   ========================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://oneanswers.me",
      "https://www.oneanswers.me",
      "https://admin.oneanswers.me",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* =========================
   BODY PARSERS
   ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES
   ========================= */
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

/* =========================
   API ROUTES
   ========================= */
app.use("/api", routes);

/* =========================
   404 HANDLER
   ========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   ERROR HANDLER (LAST)
   ========================= */
app.use(errorHandler);

module.exports = app;
