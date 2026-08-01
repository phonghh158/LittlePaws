// src/services/breed.service.js
const dayjs = require("dayjs");

const Breed = require("../models/breed.model");
const Species = require("../models/species.model");

/**
 * CREATE: Tạo giống loài thú cưng mới
 * Just Admin
 * @param {Object} data - Dữ liệu giống loài (name, description, speciesId)
 * @returns Thông tin giống loài vừa tạo
 */
async function createBreed(data) {
    const { speciesId } = data;

    const isSpeciesExist = await Species.exists({ _id: speciesId });
    if (!isSpeciesExist) {
        const error = new Error("Không tìm thấy loài thú cưng.");
        error.status = 404;
        throw error;
    }

    return await Breed.create(data);
}

/**
 * READ: Lấy danh sách giống loài
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách giống loài đã phân trang
 */
async function getAllBreeds(query, isDelete) {
    const { keyword = "", page = 1, sort } = query;

    let filter = {};

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
        sort: sort ? sort : { createdAt: -1 },
    };

    return await Breed.paginate(filter, options);
}

/**
 * READ: Lấy thông tin giống loại
 * @param { String } breedId - ID giống loại
 * @param {boolean} isUser - Admin hay User gọi hàm
 * @returns Thông tin giống loại
 */
async function getBreedById(breedId, isUser = true) {
    let breed;

    if (isUser) breed = await Breed.findOne({ _id: breedId, deletedAt: null });
    else breed = await Breed.findOne({ _id: breedId });

    if (!breed) {
        const error = new Error("Không tìm thấy giống thú cưng.");
        error.status = 404;
        throw error;
    }

    return breed;
}

/**
 * UPDATE: Cập nhật thông tin giống loài
 * Không cho phép cập nhật deletedAt
 * Just Admin
 * @param { String } breedId - ID giống loại
 * @param { Object } updateData - Dữ liệu cập nhật
 * @returns Thông tin giống loại sau khi cập nhật
 */
async function updateBreed(breedId, updateData) {
    const { speciesId } = updateData;

    if (speciesId) {
        const isSpeciesExist = await Species.exists({ _id: speciesId });

        if (!isSpeciesExist) {
            const error = new Error("Không tìm thấy loài thú cưng.");
            error.status = 404;
            throw error;
        }
    }

    const breed = await Breed.findOneAndUpdate({ _id: breedId }, updateData, {
        new: true,
        runValidators: true,
    });

    if (!breed) {
        const error = new Error("Không tìm thấy giống thú cưng.");
        error.status = 404;
        throw error;
    }

    return breed;
}

/**
 * DELETE: Xóa giống loài
 * Soft Delete
 * @param { String } breedId - ID giống loại
 * @returns Thông tin giống loại sau khi xóa
 */
async function deleteBreed(breedId) {
    const breed = await Breed.findOneAndUpdate(
        { _id: breedId, deletedAt: null },
        { deletedAt: dayjs().toDate() },
        { new: true },
    );

    if (!breed) {
        const error = new Error("Không tìm thấy giống thú cưng.");
        error.status = 404;
        throw error;
    }

    return breed;
}

/**
 * UPDATE: Restore giống loài
 * Just Admin
 * @param { String } breedId - ID giống loài
 * @returns Thông tin giống loài sau khi restore
 */
async function restoreBreed(breedId) {
    const breed = await Breed.findOneAndUpdate(
        { _id: breedId, deletedAt: { $ne: null } },
        { deletedAt: null },
        {
            new: true,
        },
    );

    if (!breed) {
        const error = new Error("Không tìm thấy giống thú cưng hoặc chưa bị xóa.");
        error.status = 404;
        throw error;
    }

    return breed;
}

/**
 * DELETE: Xóa toàn bộ dữ liệu
 * Just Admin
 */
async function deleteAllBreeds() {
    return await Breed.deleteMany({});
}

module.exports = {
    createBreed,
    getAllBreeds,
    getBreedById,
    updateBreed,
    deleteBreed,
    restoreBreed,
    deleteAllBreeds,
};
