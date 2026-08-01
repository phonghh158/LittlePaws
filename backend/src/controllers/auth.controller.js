//src/controllers/auth.controller.js
const authService = require("../services/auth.service");
const { success } = require("../utils/response");

async function register(req, res, next) {
    try {
        const newUser = await authService.register(req.body);
        return success(res, newUser, "Đăng ký tài khoản thành công", 201);
    } catch (error) {
        return next(error);
    }
}

async function login(req, res, next) {
    try {
        const deviceInfo = {
            deviceId: req.headers["x-device-id"] || "",
            ipAddress: req.ip || "",
            userAgent: req.headers["user-agent"] || "Unknown Device",
        };

        const result = await authService.login(req.body, deviceInfo);
        return success(res, result, "Đăng nhập thành công", 200);
    } catch (error) {
        return next(error);
    }
}

async function logout(req, res, next) {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        return success(res, null, "Đăng xuất thành công", 200);
    } catch (error) {
        return next(error);
    }
}

async function logoutAll(req, res, next) {
    try {
        const userId = req.user.sub;
        await authService.logoutAll(userId);
        return success(res, null, "Đăng xuất khỏi tất cả thiết bị thành công", 200);
    } catch (error) {
        return next(error);
    }
}

async function rotateToken(req, res, next) {
    try {
        const { refreshToken } = req.body;
        const deviceInfo = {
            deviceId: req.headers["x-device-id"] || "",
            ipAddress: req.ip || "",
            userAgent: req.headers["user-agent"] || "Unknown Device",
        };

        const result = await authService.rotateToken(refreshToken, deviceInfo);
        return success(res, result, "Làm mới token thành công", 200);
    } catch (error) {
        return next(error);
    }
}

async function issueNewDeviceId(req, res, next) {
    try {
        const { userId } = req.body;
        const deviceInfo = {
            deviceId: "",
            ipAddress: req.ip || "",
            userAgent: req.headers["user-agent"] || "Unknown Device",
        };

        const result = await authService.issueNewDeviceId(userId, deviceInfo);
        return success(res, result, "Cấp thiết bị mới thành công", 200);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    register,
    login,
    logout,
    logoutAll,
    rotateToken,
    issueNewDeviceId,
};
