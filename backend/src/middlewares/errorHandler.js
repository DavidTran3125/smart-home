/**
 * Global Error Handler Middleware
 *
 * Middleware cuối cùng trong pipeline Express.
 * Bắt tất cả lỗi không được xử lý trong controllers/services
 * và trả về response lỗi thống nhất.
 */

const errorHandler = (err, req, res, next) => {
  console.error("❌ [Error Handler]", err.stack || err.message);

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: "Dữ liệu không hợp lệ",
      details: messages,
    });
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: `ID không hợp lệ: ${err.value}`,
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    return res.status(400).json({
      success: false,
      error: `Giá trị đã tồn tại cho trường: ${field}`,
    });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Token không hợp lệ",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token đã hết hạn",
    });
  }

  // Default: Internal Server Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Lỗi hệ thống nội bộ",
  });
};

export default errorHandler;
