// src/services/auth.service.js
const dayjs = require("dayjs");
const argon2 = require("argon2");
const { randomUUID } = require("crypto");

const User = require("../models/user.model");
const Session = require("../models/session.model");

const { VERIFICATION_TYPES } = require("../constants/verification");
const { USER_AVATAR } = require("../constants/default-avatar");

const { hashSHA512 } = require("../utils/crypto");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt");

const { createOTPAndToken } = require("./verification.service");

/**
 * Đăng ký tài khoản mới
 */
async function register(data) {
    const { password, confirmPassword, phoneNumber, fullName, gender, avatarUrl, role } = data;
    let { username, email } = data;

    if (password !== confirmPassword) {
        throw new Error("Mật khẩu nhập lại không khớp.");
    }

    username = username.toLowerCase();
    const isUsernameExist = await User.exists({ username, deletedAt: null });
    if (isUsernameExist) {
        throw new Error("Tên đăng nhập đã tồn tại.");
    }

    if (email) {
        email = email.toLowerCase();
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

    if (avatarUrl === "") {
        if (gender === "MALE") {
            avatarUrl = USER_AVATAR.MALE;
        } else if (gender === "FEMALE") {
            avatarUrl = USER_AVATAR.FEMALE;
        } else {
            avatarUrl = USER_AVATAR.UNKNOWN;
        }
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = await User.create({
        username,
        password: hashedPassword,
        email,
        phoneNumber,
        fullName,
    });

    const user = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        fullName: newUser.fullName,
        role: newUser.role,
    };

    return user;
}

/**
 * Đăng nhập tài khoản
 */
async function login(data, deviceInfo) {
    const { identity, password } = data;

    const user = await User.findOne({
        $or: [{ username: identity }, { email: identity }, { phoneNumber: identity }],
        deletedAt: null,
    })
        .select("+password")
        .lean();

    if (!user) {
        throw new Error("Tài khoản không tồn tại.");
    }

    if (user.bannedAt) {
        throw new Error("Tài khoản của bạn đã bị khóa.");
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
    }

    if (!deviceInfo.deviceId) {
        // Code gửi email OTP, SMS OTP, v.v.
        // MOCK OTP And Token
        const verificationService = require("./verification.service");
        const verificationData = await verificationService.createOTPAndToken(
            user._id,
            VERIFICATION_TYPES.VERIFY_DEVICE,
        );

        console.log("📱 Thiết bị mới đăng nhập:");
        console.log("🔢 Mock OTP:", verificationData.otpCode);
        console.log("🔑 Mock Token:", verificationData.token);

        return {
            requireVerification: true,
            userId: user._id,
            message: "Thiết bị mới đăng nhập lần đầu. Vui lòng xác thực thiết bị.",
        };
    }

    return await issueNewSession(user._id, deviceInfo);
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
 * Refresh Token Rotation
 */
async function rotateToken(refreshToken, deviceInfo) {
    // Xác thực Refresh Token, lấy payload
    let payload = verifyRefreshToken(refreshToken);

    if (!payload) {
        throw new Error("Refresh Token không hợp lệ.");
    }

    // Kiểm tra session
    let refreshTokenHash = hashSHA512(refreshToken, process.env.SHA512_SALT);
    let currentSession = await Session.findOne({
        refreshToken: refreshTokenHash,
    });

    if (!currentSession || currentSession.deviceId !== deviceInfo.deviceId) {
        await Session.deleteMany({ userId: payload.sub });
        throw new Error("Phát hiện rủi ro bảo mật. Refresh Token không hợp lệ.");
    }

    if (currentSession.expiredAt < dayjs().toDate()) {
        await Session.deleteMany({ userId: payload.sub });
        throw new Error("Phát hiện rủi ro bảo mật. Refresh Token đã hết hạn.");
    }

    await Session.deleteOne({ refreshToken: refreshTokenHash });

    // Cấp phát cặp Token mới
    return await issueNewSession(payload.sub, deviceInfo);
}

/**
 * Cấp phát cặp Token mới
 */
async function issueNewSession(userId, deviceInfo) {
    // Đoạn này sẽ được thay thế bởi function getUser
    const user = await User.findById(userId);

    if (!user || user.status === "BANNED" || user.deletedAt) {
        throw new Error("Tài khoản không tồn tại.");
    }

    const { deviceId, ipAddress, userAgent } = deviceInfo;

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
    };

    const payloadRT = {
        sub: user._id,
        device_id: deviceId,
    };

    const accessToken = generateAccessToken(payloadAT);
    const refreshToken = generateRefreshToken(payloadRT);

    const refreshTokenHash = hashSHA512(refreshToken, process.env.SHA512_SALT);

    const refreshTokenExp = process.env.JWT_REFRESH_EXPIRES_IN.toString();
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
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            gender: user.gender,
            avatarUrl: user.avatarUrl,
            role: user.role,
            status: user.status,
        },
        token: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiredAt: refreshTokenExpiredAt,
        },
    };
}

/**
 * Issue new DeviceId for User
 */
async function issueNewDeviceId(userId, deviceInfo) {
    const deviceId = randomUUID();

    deviceInfo.deviceId = deviceId;

    return await issueNewSession(userId, deviceInfo);
}

module.exports = {
    register,
    login,
    logout,
    logoutAll,
    rotateToken,
    issueNewDeviceId,
};
