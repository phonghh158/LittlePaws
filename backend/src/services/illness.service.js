// src/services/illness-record.service.js
const dayjs = require("dayjs");
const Illness = require("../models/illness.model");
const Disease = require("../models/disease.model");

/**
 * CREATE
 * Tạo bản ghi bệnh án cho thú cưng
 * @param { Object } data - Dữ liệu bản ghi bệnh án
 * @returns Bản ghi bệnh án vừa tạo
 */
async function createIllness(data) {
    const disease = await Disease.exists({ _id: data.diseaseId, deletedAt: null }).lean();

    if (!disease) {
        throw new Error("DataNotFound");
    }

    return await Illness.create(data);
}

/**
 * GET ALL
 * Lấy danh sách lịch sử ốm bệnh của thú cưng
 * @param { Object } query - query params
 * @param { String } petId - ID thú cưng
 * @returns Danh sách bản ghi bệnh án
 */
async function getAllIllness(petId, query) {
    const { page = 1, sort } = query;
    const { diseaseId, status } = query;

    const filter = {
        deletedAt: null,
    };

    // Lấy theo loại bệnh
    if (diseaseId) {
        filter.diseaseId = diseaseId;
    }

    // Lọc theo trạng thái: đang bệnh (ongoing) hoặc đã khỏi (recovered)
    if (status === "ongoing") {
        filter.endDate = null;
    } else if (status === "recovered") {
        filter.endDate = { $ne: null };
    }

    const options = {
        page: parseInt(page, 10),
        limit: 9,
        sort: sort ? sort : { startDate: -1 }, // Sắp xếp theo ngày bị ốm mới nhất
        populate: {
            path: "diseaseId", // Lấy thêm thông tin chi tiết của loại bệnh
            select: "name severity isContagious",
        },
        lean: true,
    };

    return await Illness.paginate(filter, options);
}

/**
 * GET
 * Lấy chi tiết một bản ghi bệnh án theo ID
 * @param { String } recoredId - ID bản ghi bệnh án
 * @returns Thông tin bản ghi bệnh án
 */
async function getIllnessById(recordId) {
    const record = await Illness.findById(recordId)
        .populate("diseaseId", "name severity description isContagious symptoms")
        .lean();

    if (!record) {
        throw new Error("DataNotFound");
    }

    return record;
}

/**
 * UPDATE
 * Cập nhật thông tin bệnh án (VD: Cập nhật ngày khỏi bệnh, chi phí, ghi chú)
 * @param { String } recoredId - ID bản ghi bệnh án
 * @param { Object } updatedData - Dữ liệu cập nhật
 * @returns Bản ghi bệnh án sau khi cập nhật
 */
async function updateIllness(recordId, updatedData) {
    const updatedRecord = await Illness.findOneAndUpdate(
        { _id: recordId, deletedAt: null },
        updatedData,
        {
            new: true,
            runValidators: true,
        },
    )
        .populate("diseaseId", "name severity")
        .lean();

    if (!updatedRecord) {
        throw new Error("DataNotFound");
    }

    return updatedRecord;
}

/**
 * DELETE
 * Xóa mềm bản ghi bệnh án
 * @param { String } recoredId - ID bản ghi bệnh án
 * @returns Bản ghi bệnh án sau khi xóa
 */
async function deleteIllness(recordId) {
    const deletedRecord = await Illness.findOneAndUpdate(
        { _id: recordId, deletedAt: null },
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
 * Khôi phục bản ghi bệnh án đã xóa mềm
 * @param { String } recoredId - ID bản ghi bệnh án
 * @returns Bản ghi bệnh án sau khi khôi phục
 */
async function restoreIllness(recordId) {
    const restoredRecord = await Illness.findOneAndUpdate(
        { _id: recordId, deletedAt: { $ne: null } },
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
 * Hard Delete tất cả bản ghi bệnh án
 * Mock Test - Run Seed
 */
async function hardDeleteAll() {
    return await Illness.deleteMany({});
}

module.exports = {
    createIllness,
    getAllIllness,
    getIllnessById,
    updateIllness,
    deleteIllness,
    restoreIllness,
    hardDeleteAll,
};
