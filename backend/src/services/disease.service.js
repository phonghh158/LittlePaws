// src/services/disease.service.js
const dayjs = require("dayjs");
const Disease = require("../models/disease.model");

/**
 * CREATE
 * Tạo bản ghi bệnh
 * @param { Object } data - Dữ liệu bản ghi bệnh
 * @returns Bản ghi bệnh vừa tạo
 */
async function createDisease(data) {
    return await Disease.create(data);
}

/**
 * GET ALL
 * Lấy danh sách bản ghi bệnh
 * @param { Object } query - query
 * @param { String } userId - ID người dùng hiện tại
 * @returns Danh sách bản ghi bệnh
 */
async function getAllDiseases(query, userId) {
    const { page = 1, limit = 10, sort } = query;
    const { species, severity, isContagious, ofUser } = query;

    const filter = {
        deletedAt: null,
    };

    if (species) {
        const speciesArray = Array.isArray(species) ? species : [species];

        if (speciesArray.length > 0) {
            filter.species = { $in: speciesArray };
        }
    }

    if (severity) {
        const severityArray = Array.isArray(severity) ? severity : [severity];

        if (severityArray.length > 0) {
            filter.severity = { $in: severityArray };
        }
    }

    if (isContagious !== undefined) {
        // Xử lý cả dạng boolean và string từ query
        filter.isContagious = isContagious === "true" || isContagious === true;
    }

    if (ofUser) {
        filter.creatorId = userId;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort ? sort : { createdAt: -1 },
        lean: true,
    };

    return await Disease.paginate(filter, options);
}

/**
 * GET
 * Lấy bản ghi bệnh theo ID
 * @param { String } id - ID bản ghi bệnh
 * @returns Thông tin bản ghi bệnh
 */
async function getDiseaseById(id) {
    const disease = await Disease.findById(id).lean();

    if (!disease) {
        throw new Error("DataNotFound");
    }

    return disease;
}

/**
 * UPDATE
 * Cập nhật bản ghi bệnh
 * @param { String } id - ID bản ghi bệnh
 * @param { Object } updatedData - Dữ liệu bản ghi bệnh
 * @returns Bản ghi bệnh sau khi cập nhật
 */
async function updateDisease(id, updatedData) {
    const updatedDisease = await Disease.findOneAndUpdate(
        { _id: id, deletedAt: null },
        updatedData,
        {
            new: true,
            runValidators: true,
        },
    ).lean();

    if (!updatedDisease) {
        throw new Error("DataNotFound");
    }

    return updatedDisease;
}

/**
 * DELETE
 * Xóa bản ghi bệnh
 * @param { String } id - ID bản ghi bệnh
 * @returns Bản ghi bệnh sau khi xóa
 */
async function deleteDisease(id) {
    const deletedRecord = await Disease.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: dayjs() },
        { new: true },
    ).lean();

    if (!deletedRecord) {
        throw new Error("DataNotFound");
    }

    return deletedRecord;
}

/**
 * UPDATE
 * Khôi phục bản ghi đã xóa mềm
 * @param { String } id - ID bản ghi bệnh
 * @returns Bản ghi bệnh sau khi khôi phục
 */
async function restoreDisease(id) {
    const restoredRecord = await Disease.findOneAndUpdate(
        { _id: id, deletedAt: { $ne: null } },
        { deletedAt: null },
        { new: true },
    ).lean();

    if (!restoredRecord) {
        throw new Error("DataNotFound");
    }

    return restoredRecord;
}

/**
 * DELETE
 * Hard Delete tất cả bản ghi bệnh
 * Mock Test - Run Seed
 */
async function hardDeleteAll() {
    return await Disease.deleteMany({});
}

module.exports = {
    createDisease,
    getAllDiseases,
    getDiseaseById,
    updateDisease,
    deleteDisease,
    restoreDisease,
    hardDeleteAll,
};
