const ApiResponse = require("../utils/response.util");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return ApiResponse.error(res, 409, "Resource already exists", {
      field: err.meta?.target?.[0] || "unknown",
    });
  }

  if (err.code === "P2025") {
    return ApiResponse.error(res, 404, "Resource not found");
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return ApiResponse.error(res, 400, "Validation failed", err.errors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return ApiResponse.error(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiResponse.error(res, 401, "Token expired");
  }

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return ApiResponse.error(res, 400, "File size too large");
    }
    return ApiResponse.error(res, 400, err.message);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return ApiResponse.error(res, statusCode, message);
};

module.exports = errorHandler;
