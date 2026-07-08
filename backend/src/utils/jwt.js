// src/utils/jwt.js

const jwt = require("jsonwebtoken");

/**
 * Tạo Access Token (Thời hạn ngắn)
 * @param {Object} payload - Dữ liệu cần mã hóa
 * @returns {string} Chuỗi JWT Access Token
 */
function generateAccessToken(payload) {
    const secret = process.env.JWT_ACCESS_SECRET;
    return jwt.sign(payload, secret, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }); //11m
}

/**
 * Tạo Refresh Token (Thời hạn dài)
 * @param {Object} payload - Dữ liệu cần mã hóa
 * @returns {string} Chuỗi JWT Refresh Token
 */
function generateRefreshToken(payload) {
    const secret = process.env.JWT_REFRESH_SECRET;
    return jwt.sign(payload, secret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }); //7d
}

/**
 * Xác thực và giải mã Access Token
 * @param {string} token - Chuỗi token do client gửi lên
 * @returns {Object} Payload đã giải mã nếu hợp lệ
 * @throws {Error} Ném lỗi nếu token sai, bị sửa đổi hoặc đã hết hạn
 */
function verifyAccessToken(token) {
    const secret = process.env.JWT_ACCESS_SECRET;
    return jwt.verify(token, secret);
}

/**
 * Xác thực và giải mã Refresh Token
 * @param {string} token - Chuỗi token cần kiểm tra
 * @returns {Object} Payload đã giải mã nếu hợp lệ
 * @throws {Error} Ném lỗi nếu token sai, bị sửa đổi hoặc đã hết hạn
 */
function verifyRefreshToken(token) {
    const secret = process.env.JWT_REFRESH_SECRET;
    return jwt.verify(token, secret);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
