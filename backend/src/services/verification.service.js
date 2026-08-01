// src/services/verification.service.js
const { generateOtpCode, generateToken, getExpiredAt } = require("../utils/verification");
const { VERIFICATION_TYPES } = require("../constants/verification");
const crypto = require("../utils/crypto");
const Verification = require("../models/verification.model");

const argon2 = require("argon2");
const dayjs = require("dayjs");

/**
 * Tạo OTP code và token gắn link
 * @param {string} userId - ID người dùng
 * @param {string} verificationType - Loại OTP code
 * @returns OTP code và Token
 */
async function createOTPAndToken(userId, verificationType) {
    const otpCode = generateOtpCode();
    const expiredAt = getExpiredAt();
    const token = generateToken(userId, verificationType);

    const otpHash = await argon2.hash(otpCode);
    const tokenHash = await argon2.hash(token);

    await Verification.create({
        userId: userId,
        verificationType: verificationType,
        otpCode: otpHash,
        token: tokenHash,
        expiredAt: expiredAt,
    });

    return {
        otpCode: otpCode,
        token: token,
        expiredAt: expiredAt,
    };
}

/**
 * Xác thực OTP or Token
 * @param {string} userId - ID người dùng
 * @param {string} deviceId - ID thiết bị
 * @param {string} randomString - Mã ngẫu nhiên
 * @param {string} otpType - Loại OTP code
 * @param {string} verificationValue - Mã OTP hoặc Token
 * @returns Kết quả: true/false
 */
async function verifyOTPOrToken(userId, verificationType, verificationValue) {
    const verification = await Verification.findOne({
        userId: userId,
        verificationType: verificationType,
    });

    if (!verification) {
        throw new Error("Không tìm thấy thông tin xác thực.");
    }

    if (verification.expiredAt < dayjs().toDate()) {
        await Verification.deleteOne({ _id: verification._id });
        throw new Error("Yêu cầu xác thực hết hạn.");
    }

    let result =
        verificationValue.length === parseInt(process.env.OTP_LENGTH)
            ? await argon2.verify(verification.otpCode, verificationValue)
            : await argon2.verify(verification.token, verificationValue);

    await Verification.deleteOne({ _id: verification._id });

    return result;
}

module.exports = {
    createOTPAndToken,
    verifyOTPOrToken,
};
