// src/services/pet-care-brand.service.js
const PetCareBrand = require("../models/pet-care-brand.model");

/**
 * CREATE
 * Tạo bản ghi thương hiệu mới
 * @param { Object } brandData - Dữ liệu thương hiệu
 * @returns Bản ghi thương hiệu vừa tạo
 */
async function createPetCareBrand(brandData) {
    return await PetCareBrand.create(brandData);
}

/**
 * GET ALL
 * Lấy danh sách thương hiệu (có phân trang và tìm kiếm)
 * @param { Object } query - Object query (page, limit, sort, name)
 * @returns Danh sách thương hiệu
 */
async function getPetCareBrands(query) {
    const { page = 1, limit = 10, sort, name } = query;

    const filter = {
        deletedAt: null,
    };

    // Filter By Name - Lọc tương đối bằng $regex
    if (name) {
        filter.name = { $regex: name, $options: "i" };
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort ? sort : { createdAt: -1 },
    };

    return await PetCareBrand.paginate(filter, options);
}

/**
 * GET
 * Lấy dữ liệu chi tiết một thương hiệu
 * @param { String } brandId - ID thương hiệu
 * @returns Bản ghi thương hiệu
 */
async function getPetCareBrand(brandId) {
    const brand = await PetCareBrand.findOne({
        _id: brandId,
        deletedAt: null,
    }).lean();

    if (!brand) {
        throw new Error("DataNotFound");
    }

    return brand;
}

/**
 * UPDATE
 * Cập nhật thông tin thương hiệu
 * @param { String } brandId - ID thương hiệu
 * @param { Object } updateData - Dữ liệu cập nhật
 * @returns Bản ghi thương hiệu sau khi cập nhật
 */
async function updatePetCareBrand(brandId, updateData) {
    const updatedRecord = await PetCareBrand.findOneAndUpdate(
        { _id: brandId, deletedAt: null },
        updateData,
        {
            new: true,
            runValidators: true,
        },
    ).lean();

    if (!updatedRecord) {
        throw new Error("DataNotFound");
    }

    return updatedRecord;
}

/**
 * DELETE (Soft Delete)
 * Xóa mềm bản ghi thương hiệu
 * @param { String } brandId - ID thương hiệu
 * @returns Bản ghi thương hiệu sau khi xóa mềm
 */
async function deletePetCareBrand(brandId) {
    const deletedRecord = await PetCareBrand.findOneAndUpdate(
        { _id: brandId, deletedAt: null },
        { deletedAt: new Date() },
        { new: true },
    ).lean();

    if (!deletedRecord) {
        throw new Error("DataNotFound");
    }

    return deletedRecord;
}

/**
 * RESTORE
 * Khôi phục bản ghi thương hiệu đã xóa mềm
 * @param { String } brandId - ID thương hiệu
 * @returns Bản ghi thương hiệu sau khi khôi phục
 */
async function restorePetCareBrand(brandId) {
    const restoredRecord = await PetCareBrand.findOneAndUpdate(
        { _id: brandId, deletedAt: { $ne: null } },
        { deletedAt: null },
        { new: true },
    ).lean();

    if (!restoredRecord) {
        throw new Error("DataNotFound");
    }

    return restoredRecord;
}

/**
 * HARD DELETE ALL
 * Xóa cứng toàn bộ dữ liệu (Chỉ dùng cho mock test / seed data)
 */
async function hardDeleteAll() {
    return await PetCareBrand.deleteMany({});
}

module.exports = {
    createPetCareBrand,
    getPetCareBrands,
    getPetCareBrand,
    updatePetCareBrand,
    deletePetCareBrand,
    restorePetCareBrand,
    hardDeleteAll,
};
