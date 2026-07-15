// src/services/auth.service.js
const dayjs = require("dayjs");

const User = require("../models/user.model");
const Session = require("../models/session.model");
const OTP = require("../models/otp.model");

const { hashPassword, verifyPassword, hashSHA512 } = require("../utils/crypto");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt");
const { generateOtpCode, otpExpiresAt } = require("../utils/otp");

const { VERIFICATION_TYPES } = require("../constants/verification");

/**
 * Đăng ký tài khoản mới
 */
async function register(data) {
    const { username, password, confirmPassword, email, phoneNumber, fullName } = data;

    if (password !== confirmPassword) {
        throw new Error("Mật khẩu nhập lại không khớp.");
    }

    const isUsernameExist = await User.exists({ username, deletedAt: null });
    if (isUsernameExist) {
        throw new Error("Tên đăng nhập đã tồn tại.");
    }

    if (email) {
        const isEmailExist = await User.exists({ email, deletedAt: null });
        if (isEmailExist) {
            throw new Error("Email này đã được sử dụng.");
        }
    }

    if (phoneNumber) {
        const isPhoneExist = await User.exists({ phoneNumber, deletedAt: null });
        if (isPhoneExist) {
            throw new Error("Số điện thoại này đã được sử dụng.");
        }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
        username,
        password: hashedPassword,
        email,
        phoneNumber,
        fullName,
    });

    return newUser;
}

/**
 * Đăng nhập tài khoản
 */
async function login(data, deviceInfo) {
    const { identity, password } = data;
    const { deviceId } = deviceInfo;

    const user = await User.findOne({
        $or: [{ username: identity }, { email: identity }, { phoneNumber: identity }],
        deletedAt: null,
    });

    if (!user) {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
    }

    if (user.status === "BANNED") {
        throw new Error("Tài khoản của bạn đã bị khóa.");
    }

    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
    }

    const isKnownDevice = await Session.exists({
        userId: user._id,
        deviceId: deviceId,
    });

    if (!isKnownDevice) {
        // Code gửi email OTP, SMS OTP, v.v.
        return {
            requireOTP: true,
            userId: user._id,
            message: "Thiết bị mới đăng nhập lần đầu. Vui lòng xác thực OTP.",
        };
    }

    return await issueNewSession(user._id, user.role, deviceInfo);
}

/**
 * Đăng xuất tài khoản
 */
async function logout(refreshToken) {
    if (!refreshToken) return;

    const tokenHash = hashSHA512(refreshToken, process.env.SHA512_SALT);
    await Session.deleteOne({ refreshToken: tokenHash });
}

/**
 * Đăng xuất khỏi mọi thiết bị
 */
async function logoutAll(userId) {
    await Session.deleteMany({ userId: userId });
}

/**
 * Refresh Token Rotation (Tích hợp Grace Period 30s & đối chiếu Device ID)
 */
async function rotateToken(refreshToken, deviceInfo) {
    // Kiểm tra session
    let refreshTokenHash = hashSHA512(refreshToken, process.env.SHA512_SALT);
    let currentSession = await Session.findOne({
        refreshToken: refreshTokenHash,
    });

    if (!currentSession) {
        throw new Error("Refresh token không tồn tại trong Session.");
    }

    // Xác thực Refresh Token, lấy payload
    let payload = verifyRefreshToken(refreshToken);

    if (!payload) {
        throw new Error("Refresh Token không hợp lệ.");
    }

    // Kiểm tra thiết bị gửi yêu cầu có phải thiết bị nắm Refresh Token hay không?
    if (currentSession.deviceId !== deviceInfo.deviceId) {
        await Session.deleteMany({ userId: payload.userId });
        throw new Error("Phát hiện rủi ro bảo mật. Refresh Token được gửi từ thiết bị lạ!");
    }

    await Session.deleteOne({ refreshToken: refreshTokenHash });

    // Cấp phát cặp Token mới
    return await issueNewSession(payload.userId, deviceInfo);
}

/**
 * Cấp phát cặp Token mới
 */
async function issueNewSession(userId, deviceInfo) {
    // Đoạn này sẽ được thay thế bởi function getUser
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("Tài khoản không tồn tại.");
    }

    const { deviceId, ipAddress, userAgent } = deviceInfo;

    const refreshTokenExp = process.env.JWT_REFRESH_EXPIRES.toString();
    const accessTokenExp = process.env.JWT_ACCESS_EXPIRES.toString();

    /**
     * Payload
     * - sub: Định danh của người dùng
     * - role: Quyền của người dùng
     * - device_id: Device ID
     * - exp: Thời gian hết hạn
     */

    const payloadAT = {
        sub: user._id,
        role: user.role,
        device_id: deviceId,
        exp: dayjs()
            .add(parseInt(accessTokenExp), accessTokenExp[accessTokenExp.length - 1])
            .unix(),
    };

    const payloadRT = {
        sub: user._id,
        device_id: deviceId,
        exp: dayjs()
            .add(parseInt(refreshTokenExp), refreshTokenExp[refreshTokenExp.length - 1])
            .unix(),
    };

    const accessToken = generateAccessToken(payloadAT);
    const refreshToken = generateRefreshToken(payloadRT);

    const refreshTokenHash = hashSHA512(refreshToken, process.env.SHA512_SALT);

    const refreshTokenExpiredAt = dayjs()
        .add(parseInt(refreshTokenExp), refreshTokenExp[refreshTokenExp.length - 1])
        .toDate();

    await Session.create({
        userId: user._id,
        refreshToken: refreshTokenHash,
        deviceId: deviceId,
        ipAddress: ipAddress,
        userAgent: userAgent,
        expiredAt: refreshTokenExpiredAt,
    });

    return {
        user: {
            _id: user._id,
            username: user.username,
            role: user.role,
        },
        token: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiredAt: refreshTokenExpiredAt,
        },
    };
}

module.exports = {
    register,
    login,
    logout,
    logoutAll,
    rotateToken,
};
