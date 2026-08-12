// src/services/preventive-care.service.js
const dayjs = require("dayjs");
const PreventiveCare = require("../models/preventive-care.model");

/**
 * CREATE
 * Tạo bản ghi tiêm phòng cho thú cưng
 * @param { String } petId - ID thú cưng
 * @param { Object } preventiveCareData - Dữ liệu bản ghi tiêm phòng
 * @returns Bản ghi tiêm phòng vừa tạo
 */
async function createPreventiveCare(petId, preventiveCareData) {
    const { type, name, executionDate, appointmentDate, clinic, veterinarian } =
        preventiveCareData;

    return await PreventativeCare.create({
        petId: petId,
        type: type,
        name: name,
        executionDate: executionDate || dayjs().toDate(),
        appointmentDate: appointmentDate,
        clinic: clinic,
        veterinarian: veterinarian,
    })
        .populate({
            path: "petId",
            select: "name gender dob bloodType avatarUrl breedId",
            populate: {
                path: "breedId",
                select: "species name",
            },
        })
        .lean();
}

/**
 * GET
 * Lấy bản ghi tiêm phòng/phòng ngừa cho thú cưng
 * @param { String } petId - ID thú cưng
 * @param { Object } query - Object query (page, limit, sort, type, name, dates...)
 * @returns Danh sách bản ghi tiêm phòng
 */
async function getPreventiveCaresByPetId(petId, query) {
    const { page = 1, sort } = query;
    const {
        type,
        name,
        executionStartDate,
        executionEndDate,
        appointmentStartDate,
        appointmentEndDate,
    } = query;

    const filter = {
        petId: petId,
    };

    // Filter By Type of Preventive Care
    if (type) filter.type = type;

    // Filter By Name - Search name
    if (name) filter.name = { $regex: name, $options: "i" };

    // Filter By Execution Date
    if (executionStartDate || executionEndDate) {
        filter.executionDate = {};
        if (executionStartDate) filter.executionDate.$gte = executionStartDate;
        if (executionEndDate) filter.executionDate.$lte = executionEndDate;
    }

    // Filter By Appointment Date
    if (appointmentStartDate || appointmentEndDate) {
        filter.appointmentDate = {};
        if (appointmentStartDate) filter.appointmentDate.$gte = appointmentStartDate;
        if (appointmentEndDate) filter.appointmentDate.$lte = appointmentEndDate;
    }

    const options = {
        page: parseInt(page, 10),
        limit: 5,
        sort: sort ? sort : { createdAt: -1 },
        populate: {
            path: "petId",
            select: "name gender dob bloodType avatarUrl breedId",
            populate: {
                path: "breedId",
                select: "species name",
            },
        },
    };

    return await PreventiveCare.paginate(filter, options);
}

/**
 * GET
 * Lấy dữ liệu bản ghi tiêm phòng cho thú cưng
 * @param { String } petId - ID thú cưng
 * @param { String } preventiveCareId - ID bản ghi tiêm phòng
 * @returns Bản ghi tiêm phòng
 */
async function getPreventiveCare(petId, preventiveCareId) {
    const preventiveCare = await PreventativeCare.findOne({
        _id: preventiveCareId,
        petId: petId,
    })
        .populate({
            path: "petId",
            select: "name gender dob bloodType avatarUrl breedId",
            populate: {
                path: "breedId",
                select: "species name",
            },
        })
        .lean();

    if (!preventiveCare) {
        throw new Error("DataNotFound");
    }

    return preventiveCare;
}

/**
 * UPDATE
 * Cập nhật bản ghi tiêm phòng cho thú cưng
 * @param { String } petId - ID thú cưng
 * @param { String } preventiveCareId - ID bản ghi tiêm phòng
 * @param { Object } updateData - Dữ liệu cập nhật
 * @returns Bản ghi tiêm phòng sau khi cập nhật
 */
async function updatePreventiveCare(petId, preventiveCareId, updateData) {
    const updatedRecord = await PreventativeCare.findOneAndUpdate(
        { _id: preventiveCareId, petId: petId },
        updateData,
        {
            new: true,
            runValidators: true,
        },
    )
        .populate({
            path: "petId",
            select: "name gender dob bloodType avatarUrl breedId",
            populate: {
                path: "breedId",
                select: "species name",
            },
        })
        .lean();

    if (!updatedRecord) {
        throw new Error("DataNotFound");
    }

    return updatedRecord;
}

/**
 * DELETE
 * Xóa bản ghi tiêm phòng cho thú cưng
 * @param { String } petId - ID thú cưng
 * @param { String } preventiveCareId - ID bản ghi tiêm phòng
 * @returns Bản ghi tiêm phòng sau khi xóa
 */
async function deletePreventiveCare(petId, preventiveCareId) {
    const deletedRecord = await PreventativeCare.findOneAndDelete({
        _id: preventiveCareId,
        petId: petId,
    });

    if (!deletedRecord) {
        throw new Error("DataNotFound");
    }

    return deletedRecord;
}

module.exports = {
    createPreventiveCare,
    getPreventiveCaresByPetId,
    getPreventiveCare,
    updatePreventiveCare,
    deletePreventiveCare,
};
