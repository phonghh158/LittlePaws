// src/controllers/user.controller.js
const userService = require("../services/user.service");
const { success } = require("../utils/response");

/**
 * GET
 * Lấy thông tin cá nhân của người dùng hiện tại
 */
async function getProfile(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const user = await userService.getProfileById(userId);

        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        return success(res, user, "Lấy thông tin người dùng thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * GET
 * Lấy thông tin người dùng qua username
 */
async function getProfileByUsername(req, res, next) {
    try {
        const { username } = req.params;
        const user = await userService.getProfileByUsername(username);

        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        return success(res, user, "Lấy thông tin người dùng thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Cập nhật tên đăng nhập (yêu cầu mật khẩu hiện tại)
 */
async function updateUsername(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const { currentPassword, newUsername } = req.body;

        const updatedUser = await userService.updateUsername(
            userId,
            currentPassword,
            newUsername,
        );
        return success(res, updatedUser, "Cập nhật tên đăng nhập thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * POST
 * Gửi yêu cầu cập nhật email mới (gửi mã xác thực)
 */
async function requestUpdateEmail(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const { currentPassword, newEmail } = req.body;

        await userService.requestUpdateEmail(userId, currentPassword, newEmail);
        return success(res, null, "Đã gửi yêu cầu cập nhật email thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * POST
 * Gửi yêu cầu cập nhật số điện thoại mới (gửi mã xác thực)
 */
async function requestUpdatePhoneNumber(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const { currentPassword, newPhoneNumber } = req.body;

        await userService.requestUpdatePhoneNumber(userId, currentPassword, newPhoneNumber);
        return success(res, null, "Đã gửi yêu cầu cập nhật số điện thoại thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * POST
 * Yêu cầu đặt lại mật khẩu (quên mật khẩu)
 */
async function resetPassword(req, res, next) {
    try {
        const { identifier } = req.body;

        await userService.resetPassword(identifier);
        return success(res, null, "Đã gửi yêu cầu đặt lại mật khẩu thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Đổi mật khẩu (dành cho người dùng đã đăng nhập)
 */
async function updatePassword(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const updatedUser = await userService.updatePassword(
            userId,
            currentPassword,
            newPassword,
            confirmPassword,
        );
        return success(res, updatedUser, "Đổi mật khẩu thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Cập nhật email sau khi xác thực thành công
 */
async function updateEmail(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const { newEmail } = req.body;

        const updatedUser = await userService.updateEmail(userId, newEmail);
        return success(res, updatedUser, "Cập nhật email thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Cập nhật số điện thoại sau khi xác thực thành công
 */
async function updatePhoneNumber(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const { newPhoneNumber } = req.body;

        const updatedUser = await userService.updatePhoneNumber(userId, newPhoneNumber);
        return success(res, updatedUser, "Cập nhật số điện thoại thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Cập nhật thông tin cá nhân (fullName, gender)
 */
async function updateProfile(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;

        const updatedUser = await userService.updateProfile(userId, req.body);
        return success(res, updatedUser, "Cập nhật thông tin cá nhân thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Cập nhật ảnh đại diện người dùng
 */
async function updateAvatar(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;
        const file = req.file;

        const updatedUser = await userService.updateAvatar(userId, file);
        return success(res, updatedUser, "Cập nhật ảnh đại diện thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE
 * Xóa ảnh đại diện (đưa về ảnh mặc định)
 */
async function deleteAvatar(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;

        const updatedUser = await userService.deleteAvatar(userId);
        return success(res, updatedUser, "Xóa ảnh đại diện thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE
 * Xóa mềm tài khoản người dùng
 */
async function deleteAccountByUser(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;

        await userService.deleteAccountByUser(userId);
        return success(res, null, "Xóa tài khoản thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Khôi phục tài khoản người dùng đã xóa mềm
 */
async function restoreAccountByUser(req, res, next) {
    try {
        const userId = req.user.sub || req.user.id || req.user._id;

        await userService.restoreAccountByUser(userId);
        return success(res, null, "Khôi phục tài khoản thành công");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProfile,
    getProfileByUsername,
    updateUsername,
    requestUpdateEmail,
    requestUpdatePhoneNumber,
    resetPassword,
    updatePassword,
    updateEmail,
    updatePhoneNumber,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    deleteAccountByUser,
    restoreAccountByUser,
};
