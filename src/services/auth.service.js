const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const config = require("../config/config");
const OTPUtil = require("../utils/otp.util");

class AuthService {
  /**
   * Hash password
   * @param {string} password
   * @returns {Promise<string>}
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare password
   * @param {string} password
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT token
   * @param {object} payload
   * @returns {string}
   */
  generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verify JWT token
   * @param {string} token
   * @returns {object}
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Admin login
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>}
   */
  async login(email, password) {
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new Error("Invalid credentials");
    }

    // Check if verified
    if (!admin.isVerified) {
      throw new Error("Email not verified. Please verify your email first.");
    }

    // Compare password
    const isPasswordValid = await this.comparePassword(
      password,
      admin.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate token
    const token = this.generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    };
  }

  /**
   * Create OTP for password reset or email verification
   * @param {string} email
   * @param {string} purpose - 'FORGOT_PASSWORD' or 'VERIFY_EMAIL'
   * @returns {Promise<string>}
   */
  async createOTP(email, purpose) {
    // Delete all expired OTPs from database (cleanup)
    await prisma.oTP.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Delete existing OTPs for this email and purpose (old unused OTPs)
    await prisma.oTP.deleteMany({
      where: { email, purpose },
    });

    // Generate new OTP
    const otp = OTPUtil.generateOTP();
    const expiresAt = OTPUtil.getExpiryTime();

    // Store OTP
    await prisma.oTP.create({
      data: {
        email,
        otp,
        purpose,
        expiresAt,
      },
    });

    return otp;
  }

  /**
   * Verify OTP
   * @param {string} email
   * @param {string} otp
   * @param {string} purpose - optional (defaults to FORGOT_PASSWORD)
   * @returns {Promise<boolean>}
   */
  async verifyOTP(email, otp, purpose = "FORGOT_PASSWORD") {
    const otpRecord = await prisma.oTP.findFirst({
      where: { email, purpose },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new Error("OTP not found");
    }

    // Check if expired
    if (OTPUtil.isExpired(otpRecord.expiresAt)) {
      // Delete expired OTP
      await prisma.oTP.delete({
        where: { id: otpRecord.id },
      });
      throw new Error("OTP has expired");
    }

    // Verify OTP
    if (!OTPUtil.verifyOTP(otp, otpRecord.otp)) {
      throw new Error("Invalid OTP");
    }

    // Delete used OTP
    await prisma.oTP.delete({
      where: { id: otpRecord.id },
    });

    return true;
  }

  /**
   * Reset password
   * @param {string} email
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async resetPassword(email, newPassword) {
    const hashedPassword = await this.hashPassword(newPassword);

    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  /**
   * Verify email
   * @param {string} email
   * @returns {Promise<void>}
   */
  async verifyEmail(email) {
    await prisma.admin.update({
      where: { email },
      data: { isVerified: true },
    });
  }
}

module.exports = new AuthService();
