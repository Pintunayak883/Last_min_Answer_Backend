const authService = require("../services/auth.service");
const ApiResponse = require("../utils/response.util");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.error(res, 401, "No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach admin info to request
    req.admin = decoded;

    next();
  } catch (error) {
    return ApiResponse.error(res, 401, "Invalid or expired token");
  }
};

module.exports = authMiddleware;
