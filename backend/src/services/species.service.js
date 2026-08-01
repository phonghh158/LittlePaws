// src/services/species.service.js
const dayjs = require("dayjs");

const Species = require("../models/species.model");

/**
 * CREATE: Tạo mới loài thú cưng
 * Just Admin
 * @param { Object } data - Dữ liệu loài (name, description)
 * @returns Thông tin loài vừa tạo
 */
async function createSpecies(data) {
    return await Species.create(data);
}

/**
 * Lấy danh sách loài thú cưng (có phân trang và lọc)
 * @param { Object } query - Object chứa thông tin query (page, limit, keyword, sort...)
 * @returns Object chứa mảng dữ liệu (items) và thông tin phân trang (meta)
 */
async function getAllSpecies(query, isDelete) {
    const { keyword = "", page = 1, sort } = query;

    let filter = {};

    // Khai báo rõ ràng, không bị bắt vào falsy
    if (isDelete === "true") {
        filter.deletedAt = { $ne: null };
    } else if (isDelete === "false") {
        filter.deletedAt = null;
    }

    if (keyword) {
        filter.name = { $regex: keyword, $options: "i" };
    }

    // Cấu hình options cho mongoose-paginate-v2
    const options = {
        page: parseInt(page, 10),
        limit: 9,
        sort: sort ? sort : { createdAt: -1 }, // Sắp xếp mặc định
    };

    return await Species.paginate(filter, options);
}

/**
 * Lấy danh sách một loài bằng id
 * @param { String } speciesId - ID của loài
 * @param { boolean } isUser - Admin hay User gọi hàm
 * @returns Thông tin loài
 */
async function getSpeciesById(speciesId, isUser = true) {
    let species;

    if (isUser) species = await Species.findOne({ _id: speciesId, deletedAt: null });
    else species = await Species.findOne({ _id: speciesId });

    if (!species) {
        const error = new Error("Không tìm thấy loài thú cưng.");
        error.status = 404;
        throw error;
    }

    return species;
}

/**
 * UPDATE: Cập nhật thông tin loài
 * Không cho phép cập nhật deletedAt
 * Just Admin
 * @param { String } speciesId - ID của loài
 * @param { Object } updateData - Dữ liệu cần cập nhật
 * @returns Thông tin loài sau khi cập nhật
 */
async function updateSpecies(speciesId, updateData) {
    const species = await Species.findOneAndUpdate({ _id: speciesId }, updateData, {
        new: true,
        runValidators: true,
    });

    if (!species) {
        const error = new Error("Không tìm thấy loài thú cưng để cập nhật.");
        error.status = 404;
        throw error;
    }

    return species;
}

/**
 * Xóa mềm loài (cập nhật deletedAt)
 * Just Admin
 * @param { String } speciesId - ID của loài
 * @returns Thông tin loài sau khi xóa
 */
async function deleteSpecies(speciesId) {
    const species = await Species.findOneAndUpdate(
        { _id: speciesId, deletedAt: null },
        { deletedAt: dayjs().toDate() },
        { new: true },
    );

    if (!species) {
        const error = new Error("Không tìm thấy loài thú cưng hoặc dữ liệu đã bị xóa.");
        error.status = 404;
        throw error;
    }

    return species;
}

/**
 * Khôi phục loài (cập nhật deletedAt)
 * Just Admin
 * @param { String } speciesId - ID của loài
 * @returns Thông tin loài sau khi xóa
 */
async function restoreSpecies(speciesId) {
    const species = await Species.findOneAndUpdate(
        { _id: speciesId, deletedAt: { $ne: null } },
        { deletedAt: null },
        { new: true },
    );

    if (!species) {
        const error = new Error("Không tìm thấy loài thú cưng hoặc dữ liệu chưa bị xóa.");
        error.status = 404;
        throw error;
    }

    return species;
}

/**
 * Xóa cứng toàn bộ dữ liệu loài (Phục vụ cho Mock test)
 * Just Admin
 * @returns Kết quả xóa của Mongoose
 */
async function deleteAllSpecies() {
    return await Species.deleteMany({});
}

module.exports = {
    createSpecies,
    getAllSpecies,
    getSpeciesById,
    updateSpecies,
    deleteSpecies,
    restoreSpecies,
    deleteAllSpecies,
};
