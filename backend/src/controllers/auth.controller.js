// src/controllers/auth.controller.js

const authService = require("../services/authentication.service");

/**
 * 1. Đăng ký tài khoản mới
 */
async function register(req, res, next) {
    try {
        const { username, password, confirmPassword, email, phoneNumber, fullName } = req.body;

        const newUser = await authService.register({
            username,
            password,
            confirmPassword,
            email,
            phoneNumber,
            fullName,
        });

        return res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công.",
            data: {
                id: newUser._id,
                username: newUser.username,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * 2. Đăng nhập hệ thống
 */
async function login(req, res, next) {
    try {
        const { identity, password } = req.body;

        const deviceId = req.headers["x-device-id"];
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu định danh thiết bị (x-device-id).",
            });
        }

        const deviceInfo = {
            deviceId: deviceId,
            deviceName:
                req.headers["x-device-name"] ||
                req.headers["user-agent"] ||
                "Thiết bị không xác định",
            ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        };

        const result = await authService.login({ identity, password }, deviceInfo);

        if (result.requireOTP) {
            return res.status(200).json({
                success: true,
                requireOTP: true,
                userId: result.userId,
                message: result.message,
            });
        }

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            requireOTP: false,
            message: "Đăng nhập thành công.",
            accessToken: result.accessToken,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * 3. Xoay vòng Token
 */
async function rotateToken(req, res, next) {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.",
            });
        }

        const deviceId = req.headers["x-device-id"];
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu định danh thiết bị (x-device-id).",
            });
        }

        const deviceInfo = {
            deviceId: deviceId,
            deviceName:
                req.headers["x-device-name"] ||
                req.headers["user-agent"] ||
                "Thiết bị không xác định",
            ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        };

        const result = await authService.rotateToken(oldRefreshToken, deviceInfo);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            accessToken: result.accessToken,
        });
    } catch (error) {
        res.clearCookie("refreshToken");
        next(error);
    }
}

/**
 * 4. Đăng xuất
 */
async function logout(req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await authService.logout(refreshToken);
        }

        res.clearCookie("refreshToken");

        return res.status(200).json({
            success: true,
            message: "Đăng xuất thành công.",
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    rotateToken,
    logout,
};
