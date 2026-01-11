const nodemailer = require("nodemailer");
const config = require("../config/config");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: config.mail.auth,
    });
  }

  /**
   * Send email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @returns {Promise<void>}
   */
  async sendMail(to, subject, html) {
    try {
      const mailOptions = {
        from: config.mail.from,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  /**
   * Send OTP email for password reset
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<void>}
   */
  async sendPasswordResetOTP(email, otp) {
    const subject = "Password Reset OTP";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the OTP below to proceed:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in ${config.otp.expiryMinutes} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin-top: 30px;">
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  /**
   * Send OTP email for email verification
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<void>}
   */
  async sendEmailVerificationOTP(email, otp) {
    const subject = "Email Verification OTP";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome! Please Verify Your Email</h2>
        <p>Thank you for registering. Use the OTP below to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in ${config.otp.expiryMinutes} minutes.</p>
        <hr style="margin-top: 30px;">
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }
}

module.exports = new MailService();
