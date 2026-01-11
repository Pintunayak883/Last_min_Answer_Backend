const config = require("../config/config");

class OTPUtil {
  /**
   * Generate random OTP
   * @param {number} length - Length of OTP
   * @returns {string}
   */
  static generateOTP(length = config.otp.length) {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  /**
   * Calculate OTP expiry time
   * @param {number} minutes - Minutes until expiry
   * @returns {Date}
   */
  static getExpiryTime(minutes = config.otp.expiryMinutes) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  /**
   * Check if OTP is expired
   * @param {Date} expiryTime
   * @returns {boolean}
   */
  static isExpired(expiryTime) {
    return new Date() > new Date(expiryTime);
  }

  /**
   * Verify OTP
   * @param {string} inputOTP
   * @param {string} storedOTP
   * @returns {boolean}
   */
  static verifyOTP(inputOTP, storedOTP) {
    return inputOTP === storedOTP;
  }
}

module.exports = OTPUtil;
