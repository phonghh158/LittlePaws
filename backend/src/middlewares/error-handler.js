// src/middlewares/error-handler.js
const { error } = require("../utils/response");

// Middleware xử lý lỗi 404
const notFoundHandler = (req, res, next) => {
    return error(res, "Không tìm thấy đường dẫn này (404 Not Found)", 404);
};

// Middleware xử lý lỗi tổng (Global Error Handler)
const globalErrorHandler = (err, req, res, next) => {
    console.error("❌ Lỗi hệ thống:", err);

    const statusCode = err.status || 500;
    const message = err.message || "Lỗi hệ thống nội bộ";

    // Ẩn chi tiết lỗi nếu không phải môi trường development
    const errorDetails = process.env.NODE_ENV === "development" ? err.stack : null;

    return error(res, message, statusCode, errorDetails);
};

module.exports = {
    notFoundHandler,
    globalErrorHandler,
};
