const authService = require("../services/auth.service");
const mailService = require("../services/mail.service");
const prisma = require("../config/database");
const ApiResponse = require("../utils/response.util");

class AdminController {
  /**
   * Admin login
   * POST /admin/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return ApiResponse.success(res, 200, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password - Send OTP
   * POST /admin/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      // Check if admin exists
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return ApiResponse.error(res, 404, "Admin not found");
      }

      // Generate and send OTP
      const otp = await authService.createOTP(email, "FORGOT_PASSWORD");
      await mailService.sendPasswordResetOTP(email, otp);

      return ApiResponse.success(res, 200, "OTP sent to your email");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP
   * POST /admin/verify-otp
   */
  async verifyOTP(req, res, next) {
    try {
      const { email, otp, purpose } = req.body;
      const effectivePurpose = purpose || "FORGOT_PASSWORD";

      await authService.verifyOTP(email, otp, effectivePurpose);

      // If purpose is VERIFY_EMAIL, mark admin as verified
      if (effectivePurpose === "VERIFY_EMAIL") {
        await authService.verifyEmail(email);
      }

      return ApiResponse.success(res, 200, "OTP verified successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /admin/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return ApiResponse.error(
          res,
          400,
          "Email and newPassword are required"
        );
      }

      // Ensure admin exists
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return ApiResponse.error(res, 404, "Admin not found");
      }

      await authService.resetPassword(email, newPassword);

      return ApiResponse.success(res, 200, "Password reset successful");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send email verification OTP
   * POST /admin/send-verification-otp
   */
  async sendVerificationOTP(req, res, next) {
    try {
      const { email } = req.body;

      // Check if admin exists
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return ApiResponse.error(res, 404, "Admin not found");
      }

      if (admin.isVerified) {
        return ApiResponse.error(res, 400, "Email already verified");
      }

      // Generate and send OTP
      const otp = await authService.createOTP(email, "VERIFY_EMAIL");
      await mailService.sendEmailVerificationOTP(email, otp);

      return ApiResponse.success(
        res,
        200,
        "Verification OTP sent to your email"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin profile (protected route)
   * GET /admin/profile
   */
  async getProfile(req, res, next) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          createdAt: true,
        },
      });

      return ApiResponse.success(
        res,
        200,
        "Profile fetched successfully",
        admin
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
