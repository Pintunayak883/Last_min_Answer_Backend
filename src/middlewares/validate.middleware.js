const ApiResponse = require("../utils/response.util");

/**
 * Validation middleware factory
 * @param {Function} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return ApiResponse.error(res, 400, "Validation failed", errors);
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

module.exports = validate;
