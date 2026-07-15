// src/services/verification.service.js
const { generateOtpCode, getExpiresAt } = require("../utils/verification");
const { VERIFICATION_TYPES } = require("../constants/verification");
const crypto = require("../utils/crypto");
const Verification = require("../models/verification.model");

const argon2 = require("argon2");
const dayjs = require("dayjs");

/**
 * Tạo OTP code và token gắn link
 * @param {string} userId - ID người dùng
 * @param {string} deviceId - ID thiết bị
 * @param {string} otpType - Loại OTP code
 * @returns Stateless OTP code và token
 */
async function createOTPAndToken(userId, deviceId, otpType) {
    const randomString = generateRandomString(4);
    const otpCode = generateOtpCode();
    const expiresAt = getExpiresAt();
    const token = generateToken(userId, deviceId, otpType);

    const otpHash = await argon2.hash(otpCode);
    const tokenHash = await argon2.hash(token);

    await Verification.create({
        userId: userId,
        deviceId: deviceId,
        verificationType: otpType,
        otpCode: otpHash,
        token: tokenHash,
        expiresAt: expiresAt,
    });

    return {
        otpCode: otpCode,
        token: token,
        expiresAt: expiresAt,
    };
}

/**
 * Xác thực OTP code
 * @param {string} userId - ID người dùng
 * @param {string} deviceId - ID thiết bị
 * @param {string} randomString - Mã ngẫu nhiên
 * @param {string} otpType - Loại OTP code
 * @param {string} verificationValue - Mã OTP hoặc Token
 * @returns Kết quả: true/false
 */
async function verifyOTP(userId, deviceId, otpType, otpCode) {
    const verification = await Verification.findOne({
        userId: userId,
        deviceId: deviceId,
        verificationType: otpType,
    });

    if (!verification) {
        throw new Error("Không tìm thấy yêu cầu xác thực.");
    }

    if (verification.expiresAt < dayjs().toDate()) {
        await Verification.deleteOne({ _id: verification._id });
        throw new Error("Yêu cầu xác thực hết hạn.");
    }

    return await argon2.verify(verification.otpCode, otpCode);
}

/**
 * Xác thực OTP code
 * @param {string} userId - ID người dùng
 * @param {string} deviceId - ID thiết bị
 * @param {string} randomString - Mã ngẫu nhiên
 * @param {string} otpType - Loại OTP code
 * @param {string} verificationValue - Mã OTP hoặc Token
 * @returns Kết quả: true/false
 */
async function verifyToken(userId, deviceId, otpType, token) {
    const verification = await Verification.findOne({
        userId: userId,
        deviceId: deviceId,
        verificationType: otpType,
    });

    if (!verification) {
        throw new Error("Không tìm thấy yêu cầu xác thực.");
    }

    if (verification.expiresAt < dayjs().toDate()) {
        await Verification.deleteOne({ _id: verification._id });
        throw new Error("Yêu cầu xác thực hết hạn.");
    }

    return await argon2.verify(verification.token, token);
}

module.exports = {
    createOTPAndToken,
    verifyOTP,
    verifyToken,
};
