// src/middlewares/error-handler.js
const { StatusCodes } = require("http-status-codes");
const { error } = require("../utils/response");

/**
 * Middleware xử lý lỗi 404 Not Found
 */
function notFoundHandler(req, res, next) {
    return error(res, "Không tìm thấy đường dẫn. 404 Not Found", StatusCodes.NOT_FOUND);
}

/**
 * Middleware xử lý lỗi tổng (Global Error Handler)
 */
function globalErrorHandler(err, req, res, next) {
    let statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    let message = err.message || "Lỗi hệ thống nội bộ";

    // Xử lý lỗi Mongoose: CastError (Sai định dạng ObjectId)
    if (err.name === "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        message = `Dữ liệu không hợp lệ tại trường: ${err.path}`;
    }

    // Xử lý lỗi Mongoose: ValidationError (Vi phạm quy tắc cấu trúc Schema)
    if (err.name === "ValidationError") {
        statusCode = StatusCodes.BAD_REQUEST;
        const errors = Object.values(err.errors).map((el) => el.message);
        message = `Lỗi xác thực dữ liệu: ${errors.join(", ")}`;
    }

    // Xử lý lỗi MongoDB: Duplicate Key (Trùng lặp dữ liệu Unique)
    if (err.code === 11000) {
        statusCode = StatusCodes.CONFLICT;
        const field = Object.keys(err.keyValue)[0];
        message = `Dữ liệu đã tồn tại trong hệ thống: ${field}`;
    }

    // Xử lý lỗi MongoDB: Không tìm thấy dữ liệu trong cơ sở dữ liệu
    if (err.message === "DataNotFound") {
        statusCode = StatusCodes.NOT_FOUND;
        message = "Không tìm thấy dữ liệu trong cơ sở dữ liệu.";
    }

    // Xử lý lỗi JWT: JsonWebTokenError (Token sai định dạng hoặc bị chỉnh sửa)
    if (err.name === "JsonWebTokenError") {
        statusCode = StatusCodes.UNAUTHORIZED;
        message = "Xác thực thất bại, token không hợp lệ.";
    }

    // Xử lý lỗi JWT: TokenExpiredError (Token đã hết hạn sử dụng)
    if (err.name === "TokenExpiredError") {
        statusCode = StatusCodes.UNAUTHORIZED;
        message = "Phiên đăng nhập đã hết hạn, vui lòng thực hiện lại.";
    }

    const errorDetails = process.env.NODE_ENV === "development" ? err.stack : null;

    if (process.env.NODE_ENV === "development") {
        console.error("❌ Chi tiết lỗi:", err);
    }

    return error(res, message, statusCode, errorDetails);
}

module.exports = {
    notFoundHandler,
    globalErrorHandler,
};
