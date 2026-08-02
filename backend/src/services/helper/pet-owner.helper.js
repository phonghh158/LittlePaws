// src/services/helper/pet-owner.helper.js
const PetOwner = require("../models/pet-owner.model");

/**
 * Helper: Kiểm tra chủ sở hữu thú cưng
 * @param { String } petId - ID thú cưng
 * @param { String } ownerId - ID người dùng
 * @returns _id chủ sở hữu / error null
 */
async function isPetOwnership(petId, ownerId) {
    const isOwner = await PetOwner.exists({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    });

    if (!isOwner) {
        const error = new Error("Không tìm thấy bạn nhỏ này trong danh sách thú cưng.");
        error.status = 404;
        throw error;
    }
}

/**
 * Helper: Kiểm tra quyền sở hữu thú cưng
 * @param { String } petId - ID thú cưng
 * @param { String } ownerId - ID người dùng
 * @returns true if is owner / false if not
 */
async function isPetOwner(petId, ownerId) {
    const petOwnerRecord = await PetOwner.findOne({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    }).select("role");

    if (!petOwnerRecord) {
        const error = new Error("Không tìm thấy bạn nhỏ này trong danh sách thú cưng.");
        error.status = 404;
        throw error;
    }

    if (petOwnerRecord.role !== "owner") {
        const error = new Error("Không có quyền xử lý thông tin thú cưng.");
        error.status = 403;
        throw error;
    }
}

module.exports = {
    isPetOwnership,
    isPetOwner,
};
