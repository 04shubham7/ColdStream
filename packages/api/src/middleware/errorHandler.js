import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, _req, res, _next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
