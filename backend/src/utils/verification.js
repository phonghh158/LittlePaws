// src/utils/otp.js
const dayjs = require("dayjs");
const { hashSHA512, verifySHA512, generateRandomString } = require("./crypto");

/**
 * Tạo OTP code ngẫu nhiên (bao gồm cả số 0 đứng đầu)
 * @param {*} length - Độ dài của OTP code
 * @returns Mã OTP
 */
function generateOtpCode(length = process.env.OTP_LENGTH) {
    let otpCode = "";

    for (let i = 0; i < length; i++) {
        otpCode += Math.floor(Math.random() * 10).toString();
    }

    return otpCode;
}

/**
 * Tính thời gian hết hạn của OTP
 * @param { Number } time - Thời gian hết hạn OTP (tính bằng phút)
 * @returns Thời gian hết hạn
 */
function getExpiresAt(time = 15) {
    const exp = process.env.OTP_EXPIRES.toString();
    const expiredAt = dayjs().add(time, "m").toDate();

    return expiredAt;
}

/**
 * Tạo stateless OTP code và token gắn link
 * @param {string} userId - ID người dùng
 * @param {string} deviceId - ID thiết bị
 * @param {string} otpType - Loại OTP code
 * @returns Stateless OTP code và token
 */
function generateToken(userId, deviceId, otpType) {
    const randomString = generateRandomString(8);
    const otpCode = generateOtpCode();
    const expiresAt = getExpiresAt();

    const tokenPlain = `${userId}.${deviceId}.${randomString}.${otpType}.${otpCode}.${expiresAt}`;
    const tokenHash = hashSHA512(tokenPlain, process.env.SHA512_SALT);

    return tokenHash;
}

module.exports = {
    generateOtpCode,
    getExpiresAt,
};
