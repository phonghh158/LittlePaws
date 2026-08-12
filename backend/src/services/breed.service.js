// src/services/breed.service.js
const dayjs = require("dayjs");

const Breed = require("../models/breed.model");
const Species = require("../models/species.model");

/**
 * CREATE: Tạo giống loài thú cưng mới
 * Just Admin
 * @param {Object} data - Dữ liệu giống loài (species, name, description)
 * @returns Thông tin giống loài vừa tạo
 */
async function createBreed(data) {
    return await Breed.create(data);
}

/**
 * READ: Lấy danh sách giống loài
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách giống loài đã phân trang
 */
async function getAllBreeds(query) {
    const { page = 1, sort } = query;
    const { name, species } = query;

    let filter = {
        deletedAt: null,
    };

    if (species) {
        filter.species = species;
    }

    if (name) {
        filter.name = { $regex: name, $options: "i" };
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
async function getBreedById(breedId) {
    const breed = await Breed.findOne({ _id: breedId, deletedAt: null });

    if (!breed) {
        throw new Error("DataNotFound");
    }

    return breed;
}

/**
 * UPDATE: Cập nhật thông tin giống loài
 * Không cho phép cập nhật deletedAt
 * Just Admin
 * @param { String } breedId - ID giống loại
 * @param { Object } updateData - Dữ liệu cập nhật (species, name, description)
 * @returns Thông tin giống loại sau khi cập nhật
 */
async function updateBreed(breedId, updateData) {
    const breed = await Breed.findOneAndUpdate({ _id: breedId }, updateData, {
        new: true,
        runValidators: true,
    });

    if (!breed) {
        throw new Error("DataNotFound");
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
        throw new Error("DataNotFound");
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
        throw new Error("DataNotFound");
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
