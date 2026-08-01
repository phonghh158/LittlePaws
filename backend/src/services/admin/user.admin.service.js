// src/services/user.admin.service.js
// Service for admin managing users
const dayjs = require("dayjs");

const User = require("../models/user.model");

/**
 * CREATE
 * Tạo mới tài khoản người dùng từ phía Admin (Admin force create)
 * @param { Object } userData - Dữ liệu người dùng
 * @returns Thông tin người dùng vừa tạo
 */
async function createUser(userData) {
    const { email, phoneNumber, username, password, fullName, gender, avatarUrl, role } =
        userData;

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
        const error = new Error("Tên đăng nhập (username) đã tồn tại.");
        error.status = 400;
        throw error;
    }

    // Nếu tạo từ admin thì có thể set trực tiếp role
    const newUser = await User.create({
        email: email,
        phoneNumber: phoneNumber,
        username: username,
        password: password, // Lưu ý: Cần có middleware pre-save bên model để hash password
        fullName: fullName,
        gender: gender,
        avatarUrl: avatarUrl,
        role: role || "USER",
    });

    // Ẩn password trước khi trả về
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return userResponse;
}

/**
 * GET
 * Lấy danh sách toàn bộ người dùng trong hệ thống
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách người dùng
 */
async function getAllUsers(query) {
    const { keyword = "", role, isDeleted, page = 1, sort } = query;
    const limit = 10;

    let filter = {};

    // Tìm kiếm tương đối theo username, fullName hoặc email
    if (keyword) {
        filter.$or = [
            { username: { $regex: keyword, $options: "i" } },
            { fullName: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
        ];
    }

    if (role) {
        filter.role = role;
    }

    if (isDeleted === "true") {
        filter.deletedAt = { $ne: null };
    } else if (isDeleted === "false") {
        filter.deletedAt = null;
    }

    const options = {
        page: parseInt(page, 10),
        limit: limit,
        sort: sort ? sort : { createdAt: -1 },
    };

    return await User.paginate(filter, options);
}

/**
 * GET
 * Lấy chi tiết bản ghi người dùng theo ID
 * @param { String } userId - ID người dùng
 * @returns Thông tin chi tiết người dùng
 */
async function getUserById(userId) {
    const user = await User.findById(userId).lean();

    if (!user) {
        const error = new Error("Không tìm thấy người dùng.");
        error.status = 404;
        throw error;
    }

    return user;
}

/**
 * UPDATE
 * Cập nhật thông tin người dùng (Admin force update)
 * @param { String } userId - ID người dùng
 * @param { Object } updateData - Dữ liệu cập nhật
 * @returns Thông tin người dùng sau khi cập nhật
 */
async function updateUser(userId, updateData) {
    // Không cho phép đổi password qua API này (nên tách luồng đổi mật khẩu riêng)
    if (updateData.password) {
        delete updateData.password;
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        updateData,
        {
            new: true,
            runValidators: true,
        },
    ).lean();

    if (!updatedUser) {
        const error = new Error("Không tìm thấy người dùng hoặc người dùng đã bị xóa.");
        error.status = 404;
        throw error;
    }

    return updatedUser;
}

/**
 * DELETE
 * Xóa mềm bản ghi người dùng
 * @param { String } userId - ID người dùng
 * @returns Thông tin người dùng sau khi xóa
 */
async function deleteUser(userId) {
    const deletedUser = await User.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        { deletedAt: dayjs().toDate() },
        { new: true, runValidators: true },
    ).lean();

    if (!deletedUser) {
        const error = new Error("Không tìm thấy người dùng hoặc người dùng đã bị xóa.");
        error.status = 404;
        throw error;
    }

    return deletedUser;
}

/**
 * UPDATE
 * Khôi phục người dùng đã bị xóa mềm
 * @param { String } userId - ID người dùng
 * @returns Thông tin người dùng sau khi khôi phục
 */
async function restoreUser(userId) {
    const restoredUser = await User.findOneAndUpdate(
        { _id: userId, deletedAt: { $ne: null } },
        { deletedAt: null },
        {
            new: true,
            runValidators: true,
        },
    ).lean();

    if (!restoredUser) {
        const error = new Error("Không tìm thấy người dùng hoặc người dùng chưa bị xóa.");
        error.status = 404;
        throw error;
    }

    return restoredUser;
}

/**
 * DELETE
 * Xóa vĩnh viễn (Hard Delete) người dùng
 * @param { String } userId - ID người dùng
 * @returns Thông báo kết quả
 */
async function hardDeleteUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("Không tìm thấy người dùng.");
        error.status = 404;
        throw error;
    }

    try {
        await User.deleteOne({ _id: userId });

        return { message: "Xóa vĩnh viễn người dùng thành công." };
    } catch (error) {
        console.log("[ERROR]: Lỗi trong quá trình hard delete người dùng bởi Admin: ", error);
        throw new Error("Lỗi hệ thống khi xóa vĩnh viễn người dùng.");
    }
}

/**
 * DELETE
 * Xóa tất cả người dùng
 * Dành riêng cho Admin dọn rác hệ thống
 * Mock Test - Run Seed
 * Không được sử dụng trong thuật toán hệ thống.
 */
async function deleteAllUsers() {
    await User.deleteMany({});
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    restoreUser,
    hardDeleteUser,
    deleteAllUsers,
};
