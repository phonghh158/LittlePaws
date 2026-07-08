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
function otpExpiresAt(time = 15) {
    const exp = process.env.OTP_EXPIRES.toString();
    const expiredAt = dayjs().add(time, "m").toDate();

    return expiredAt;
}

module.exports = {
    generateOtpCode,
    otpExpiresAt,
};
