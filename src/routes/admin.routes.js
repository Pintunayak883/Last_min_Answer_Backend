const express = require("express");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/login", adminController.login.bind(adminController));
router.post(
  "/forgot-password",
  adminController.forgotPassword.bind(adminController)
);
router.post("/verify-otp", adminController.verifyOTP.bind(adminController));
router.post(
  "/reset-password",
  adminController.resetPassword.bind(adminController)
);
router.post(
  "/send-verification-otp",
  adminController.sendVerificationOTP.bind(adminController)
);

// Protected routes
router.get(
  "/profile",
  authMiddleware,
  adminController.getProfile.bind(adminController)
);

module.exports = router;
