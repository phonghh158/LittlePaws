// src/utils/verification.js
const dayjs = require("dayjs");
const { hashSHA512, verifySHA512, generateRandomString } = require("./crypto");

/**
 * Tạo OTP code ngẫu nhiên (bao gồm cả số 0 đứng đầu)
 * @param { Number } length - Độ dài của OTP code
 * @returns Mã OTP
 */
function generateOtpCode(length = parseInt(process.env.OTP_LENGTH)) {
    let otpCode = "";

    for (let i = 0; i < length; i++) {
        otpCode += Math.floor(Math.random() * 10).toString();
    }

    return otpCode;
}

/**
 * Tạo Verification Token ngẫu nhiên
 * @param {string} userId - ID người dùng
 * @param {string} verificationType - Loại Verification
 * @returns Random Token Hash
 */
function generateToken(userId, verificationType) {
    const randomString = generateRandomString(8);

    const tokenPlain = `${userId}-${randomString}.${verificationType}`;
    const tokenHash = hashSHA512(tokenPlain, process.env.SHA512_SALT);

    return tokenHash;
}

/**
 * Tính thời gian hết hạn của OTP
 * @param { Number } exp - Thời gian hết hạn OTP (tính bằng phút)
 * @returns Thời gian hết hạn
 */
function getExpiredAt(exp = parseInt(process.env.VERIFICATION_EXPIRES)) {
    const expiredAt = dayjs().add(exp, "m").toDate();

    return expiredAt;
}

module.exports = {
    generateOtpCode,
    generateToken,
    getExpiredAt,
};
