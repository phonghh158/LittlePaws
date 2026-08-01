// src/services/user.service.js
const dayjs = require("dayjs");
const User = require("../models/user.model");
const argon2 = require("argon2");
const { USER_AVATAR } = require("../constants/default-avatar");

/**
 * Lấy thông tin người dùng theo ID
 * @param {string} userId - ID của người dùng
 * @returns Thông tin người dùng hoặc null
 */
async function getProfileById(userId) {
    return await User.findOne({ _id: userId, deletedAt: null });
}

/**
 * Lấy thông tin người dùng theo Username
 * @param {string} username - Tên đăng nhập của người dùng
 * @returns Thông tin người dùng hoặc null
 */
async function getProfileByUsername(username) {
    return await User.findOne({ username, deletedAt: null });
}

/**
 * Cập nhật Username
 * @param {string} userId - ID của người dùng
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newUsername - Tên đăng nhập mới
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function updateUsername(userId, currentPassword, newUsername) {
    const user = await User.findById(userId).select("+password").lean();
    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
        throw new Error("Mật khẩu không chính xác");
    }

    user.username = newUsername;
    return await user.save();
}

/**
 * Yêu cầu cập nhật Email
 * @param {string} userId - ID của người dùng
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newEmail - Email mới
 * @returns Kết quả yêu cầu
 */
async function requestUpdateEmail(userId, currentPassword, newEmail) {
    const user = await User.findById(userId).select("+password").lean();
    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
        throw new Error("Mật khẩu không chính xác");
    }

    // TODO: Tạo OTP/Token Link và gửi về email mới (newEmail)
    return true;
}

/**
 * Yêu cầu cập nhật số điện thoại
 * @param {string} userId - ID của người dùng
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPhoneNumber - Số điện thoại mới
 * @returns Kết quả yêu cầu
 */
async function requestUpdatePhoneNumber(userId, currentPassword, newPhoneNumber) {
    const user = await User.findById(userId).select("+password").lean();
    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
        throw new Error("Mật khẩu không chính xác");
    }

    // TODO: Tạo OTP/Token Link và gửi SMS về số điện thoại mới (newPhoneNumber)
    return true;
}

/**
 * Yêu cầu đặt lại mật khẩu
 * @param {string} identifier - Email hoặc số điện thoại
 * @returns Kết quả yêu cầu
 */
async function resetPassword(identifier) {
    const user = await User.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }],
        deletedAt: null,
    });

    if (!user) {
        throw new Error("Không tìm thấy người dùng với thông tin đã cung cấp");
    }

    // TODO: Tạo OTP/Token Link và gửi về email hoặc số điện thoại tương ứng
    return true;
}

/**
 * Đổi mật khẩu
 * @param {string} userId - ID của người dùng
 * @param {string} currentPassword - Mật hàng hiện tại
 * @param {string} newPassword - Mật hàng mô tố
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function updatePassword(userId, currentPassword, newPassword, confirmPassword) {
    const user = await User.findById(userId).select("+password").lean();
    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
        throw new Error("Mật khẩu cũ không chính xác");
    }

    if (newPassword !== confirmPassword) {
        throw new Error("Mật khẩu mới và mật khẩu xác nhận không khớp nhau");
    }

    return await User.findByIdAndUpdate(
        userId,
        { password: await argon2.hash(newPassword) },
        { new: true, runValidators: true },
    );
}

/**
 * Xác nhận cập nhật Email
 * @param {string} userId - ID của người dùng
 * @param {string} newEmail - Email mới
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function updateEmail(userId, newEmail) {
    return await User.findByIdAndUpdate(
        userId,
        { email: newEmail },
        { new: true, runValidators: true },
    );
}

/**
 * Xác nhận cập nhật số điện thoại
 * @param {string} userId - ID của người dùng
 * @param {string} newPhoneNumber - Số điện thoại mới
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function updatePhoneNumber(userId, newPhoneNumber) {
    return await User.findByIdAndUpdate(
        userId,
        { phoneNumber: newPhoneNumber },
        { new: true, runValidators: true },
    );
}

/**
 * Cập nhật thông tin cá nhân
 * @param {string} userId - ID của người dùng
 * @param {Object} profileData - Dữ liệu cá nhân cần cập nhật
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function updateProfile(userId, profileData) {
    const { fullName, gender } = profileData;

    return await User.findByIdAndUpdate(
        userId,
        { fullName, gender },
        { new: true, runValidators: true },
    );
}

/**
 * Cập nhật ảnh đại diện
 * @param {string} userId - ID của người dùng
 * @param {Object} file - File ảnh được upload
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function updateAvatar(userId, file) {
    // TODO: Upload ảnh qua multer hoặc dịch vụ lưu trữ (Cloudinary) để lấy URL
    const avatarUrl = "đường_dẫn_sau_khi_upload";

    return await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
}

/**
 * Xóa ảnh đại diện (đưa về mặc định theo giới tính)
 * @param {string} userId - ID của người dùng
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function deleteAvatar(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    let defaultAvatar = USER_AVATAR.UNKNOWN;
    if (user.gender === "male") {
        defaultAvatar = USER_AVATAR.MALE;
    } else if (user.gender === "female") {
        defaultAvatar = USER_AVATAR.FEMALE;
    }

    user.avatarUrl = defaultAvatar;
    return await user.save();
}

/**
 * Xóa mềm tài khoản
 * @param {string} userId - ID của người dùng
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function deleteAccountByUser(userId) {
    return await User.findByIdAndUpdate(userId, { deletedAt: dayjs().toDate() }, { new: true });
}

/**
 * Khôi phục tài khoản
 * @param {string} userId - ID của người dùng
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function restoreAccountByUser(userId) {
    return await User.findByIdAndUpdate(userId, { deletedAt: null }, { new: true });
}

module.exports = {
    getProfileById,
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
