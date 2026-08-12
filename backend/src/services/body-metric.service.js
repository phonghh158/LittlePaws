// src/services/body-metric.service.js
const dayjs = require("dayjs");

const BodyMetric = require("../models/body-metric.model");
const PetOwner = require("../models/pet-owner.model");

const PetOwnerHelper = require("../services/helper/pet-owner.helper");

/**
 * CREATE
 * Thêm mới bản ghi chỉ số cơ thể (cân nặng) cho thú cưng
 * @param { String } petId - ID thú cưng
 * @param { Object } metricData - Dữ liệu chỉ số
 * @returns Bản ghi chỉ số vừa tạo
 */
async function createBodyMetric(petId, metricData) {
    const { weight, recordedAt } = metricData;

    return await BodyMetric.create({
        petId: petId,
        weight: weight,
        recordedAt: recordedAt || dayjs().toDate(),
    });
}

/**
 * GET
 * Lấy danh sách lịch sử chỉ số cơ thể của thú cưng
 * @param { String } petId - ID thú cưng
 * @param { Object } query - Object query (page, limit, sort)
 * @returns Danh sách bản ghi chỉ số (có phân trang)
 */
async function getAllBodyMetrics(petId, query) {
    const { page = 1, limit = 10, sort } = query;

    const filter = {
        petId: petId,
    };

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort ? sort : { recordedAt: -1 },
        populate: {
            path: "petId",
            select: "name dob gender avatarUrl",
        },
    };

    return await BodyMetric.paginate(filter, options);
}

/**
 * GET
 * Lấy chi tiết một bản ghi chỉ số cơ thể
 * @param { String } petId - ID thú cưng
 * @param { String } metricId - ID bản ghi chỉ số
 * @returns Thông tin chi tiết bản ghi
 */
async function getBodyMetricById(petId, metricId) {
    const metric = await BodyMetric.findOne({ _id: metricId, petId: petId })
        .populate("petId", "name dob gender avatarUrl")
        .lean();

    if (!metric) {
        throw new Error("DataNotFound");
    }

    return metric;
}

/**
 * UPDATE
 * Cập nhật thông tin bản ghi chỉ số cơ thể
 * @param { String } petId - ID thú cưng
 * @param { String } metricId - ID bản ghi chỉ số
 * @param { Object } updateData - Dữ liệu cần cập nhật
 * @returns Thông tin bản ghi sau khi cập nhật
 */
async function updateBodyMetric(petId, metricId, updateData) {
    const updatedMetric = await BodyMetric.findOneAndUpdate(
        { _id: metricId, petId: petId },
        updateData,
        {
            new: true,
            runValidators: true,
        },
    )
        .populate("petId", "name dob gender avatarUrl")
        .lean();

    if (!updatedMetric) {
        throw new Error("DataNotFound");
    }

    return updatedMetric;
}

/**
 * DELETE
 * Xóa cứng bản ghi chỉ số cơ thể
 * @param { String } ownerId - ID người dùng
 * @param { String } petId - ID thú cưng
 * @param { String } metricId - ID bản ghi chỉ số
 * @returns Thông tin bản ghi vừa xóa
 */
async function deleteBodyMetric(petId, metricId) {
    const deletedMetric = await BodyMetric.findOneAndDelete({
        _id: metricId,
        petId: petId,
    });

    if (!deletedMetric) {
        throw new Error("DataNotFound");
    }

    return deletedMetric;
}

/**
 * DELETE
 * Xóa vĩnh viễn (Hard Delete) bản ghi thú cưng và các bản ghi liên quan
 * Dành riêng cho Admin dọn rác hệ thống
 * Mock Test - Run Seed
 * Không được sử dụng trong thuật toán hệ thống.
 */
async function deleteAllBodyMetrics() {
    try {
        await BodyMetric.deleteMany({});
        return { message: "Xóa toàn bộ bản ghi chỉ số cơ thể thành công." };
    } catch (error) {
        console.log("[ERROR]: Lỗi trong quá trình xóa toàn bộ bản ghi BodyMetric: ", error);
        throw new Error("Lỗi hệ thống khi xóa toàn bộ dữ liệu chỉ số cơ thể.");
    }
}

module.exports = {
    createBodyMetric,
    getAllBodyMetrics,
    getBodyMetricById,
    updateBodyMetric,
    deleteBodyMetric,
    deleteAllBodyMetrics,
};
