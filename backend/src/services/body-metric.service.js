// src/services/body-metric.service.js
const dayjs = require("dayjs");

const BodyMetric = require("../models/body-metric.model");
const PetOwner = require("../models/pet-owner.model");

/**
 * Helper: Kiểm tra quyền sở hữu thú cưng
 */
async function checkPetOwnership(petId, ownerId) {
    const isOwner = await PetOwner.exists({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    });

    if (!isOwner) {
        const error = new Error(
            "Không tìm thấy bạn nhỏ này trong danh sách thú cưng hoặc bạn không có quyền thao tác.",
        );
        error.status = 403;
        throw error;
    }
}

/**
 * CREATE
 * Thêm mới bản ghi chỉ số cơ thể (cân nặng) cho thú cưng
 * @param { String } ownerId - ID người dùng
 * @param { String } petId - ID thú cưng
 * @param { Object } metricData - Dữ liệu chỉ số
 * @returns Bản ghi chỉ số vừa tạo
 */
async function createBodyMetric(ownerId, petId, metricData) {
    await checkPetOwnership(petId, ownerId);

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
 * @param { String } ownerId - ID người dùng
 * @param { String } petId - ID thú cưng
 * @param { Object } query - Object query (page, limit, sort)
 * @returns Danh sách bản ghi chỉ số (có phân trang)
 */
async function getAllBodyMetrics(ownerId, petId, query) {
    await checkPetOwnership(petId, ownerId);

    const { page = 1, limit = 10, sort } = query;

    const filter = {
        petId: petId,
    };

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort ? sort : { recordedAt: -1 }, // Mặc định xếp mới nhất lên trước theo chuẩn index đã tạo[cite: 7]
    };

    return await BodyMetric.paginate(filter, options);
}

/**
 * GET
 * Lấy chi tiết một bản ghi chỉ số cơ thể
 * @param { String } ownerId - ID người dùng
 * @param { String } petId - ID thú cưng
 * @param { String } metricId - ID bản ghi chỉ số
 * @returns Thông tin chi tiết bản ghi
 */
async function getBodyMetricById(ownerId, petId, metricId) {
    await checkPetOwnership(petId, ownerId);

    const metric = await BodyMetric.findOne({ _id: metricId, petId: petId }).lean();

    if (!metric) {
        const error = new Error("Không tìm thấy bản ghi chỉ số cơ thể này.");
        error.status = 404;
        throw error;
    }

    return metric;
}

/**
 * UPDATE
 * Cập nhật thông tin bản ghi chỉ số cơ thể
 * @param { String } ownerId - ID người dùng
 * @param { String } petId - ID thú cưng
 * @param { String } metricId - ID bản ghi chỉ số
 * @param { Object } updateData - Dữ liệu cần cập nhật
 * @returns Thông tin bản ghi sau khi cập nhật
 */
async function updateBodyMetric(ownerId, petId, metricId, updateData) {
    await checkPetOwnership(petId, ownerId);

    const updatedMetric = await BodyMetric.findOneAndUpdate(
        { _id: metricId, petId: petId },
        updateData,
        {
            new: true,
            runValidators: true,
        },
    ).lean();

    if (!updatedMetric) {
        const error = new Error("Không tìm thấy bản ghi chỉ số cơ thể này để cập nhật.");
        error.status = 404;
        throw error;
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
async function deleteBodyMetric(ownerId, petId, metricId) {
    await checkPetOwnership(petId, ownerId);

    const deletedMetric = await BodyMetric.findOneAndDelete({
        _id: metricId,
        petId: petId,
    }).lean();

    if (!deletedMetric) {
        const error = new Error("Không tìm thấy bản ghi chỉ số cơ thể này để xóa.");
        error.status = 404;
        throw error;
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
