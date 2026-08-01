// src/services/pet-owner.admin.service.js
// Service for admin
const dayjs = require("dayjs");

const PetOwner = require("../models/pet-owner.model");
const PetOwnerInvitation = require("../models/pet-owner-invitation.model");

/**
 * CREATE
 * Chỉ định trực tiếp một người dùng làm chủ sở hữu/đồng sở hữu thú cưng (Admin force assign)
 * Bỏ qua luồng gửi lời mời, ép thêm trực tiếp vào danh sách.
 * @param { String } petId - ID thú cưng
 * @param { String } userId - ID người dùng được chỉ định
 * @param { String } role - Vai trò (owner hoặc co-owner)
 * @param { String } relationship - Mối quan hệ
 * @returns Bản ghi PetOwner vừa tạo
 */
async function forceAssignPetOwner(
    petId,
    userId,
    role = "co-owner",
    relationship = "co-owner",
) {
    const existingOwner = await PetOwner.exists({
        petId: petId,
        userId: userId,
        deletedAt: null,
    });

    if (existingOwner) {
        const error = new Error(
            "Người dùng này đã là chủ sở hữu hoặc đồng sở hữu của thú cưng.",
        );
        error.status = 400;
        throw error;
    }

    return await PetOwner.create({
        petId: petId,
        userId: userId,
        role: role,
        relationship: relationship,
    });
}

/**
 * GET
 * Lấy danh sách toàn bộ bản ghi quyền sở hữu (PetOwner) trong hệ thống
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách PetOwner
 */
async function getAllPetOwners(query) {
    const { petId, userId, role, isDeleted, page = 1, sort } = query;
    const limit = 10;

    let filter = {};

    if (petId) filter.petId = petId;
    if (userId) filter.userId = userId;
    if (role) filter.role = role;

    if (isDeleted === "true") {
        filter.deletedAt = { $ne: null };
    } else if (isDeleted === "false") {
        filter.deletedAt = null;
    }

    const options = {
        page: parseInt(page, 10),
        limit: limit,
        sort: sort ? sort : { createdAt: -1 },
        populate: [
            { path: "userId", select: "username fullName email avatarUrl" },
            { path: "petId", select: "name avatarUrl status deletedAt" },
        ],
    };

    return await PetOwner.paginate(filter, options);
}

/**
 * GET
 * Lấy danh sách toàn bộ lời mời trong hệ thống
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách lời mời
 */
async function getAllInvitations(query) {
    const { petId, inviterId, inviteeId, status, page = 1, sort } = query;
    const limit = 10;

    let filter = {};

    if (petId) filter.petId = petId;
    if (inviterId) filter.inviterId = inviterId;
    if (inviteeId) filter.inviteeId = inviteeId;
    if (status) filter.status = status;

    const options = {
        page: parseInt(page, 10),
        limit: limit,
        sort: sort ? sort : { createdAt: -1 },
        populate: [
            { path: "inviterId", select: "username fullName email" },
            { path: "inviteeId", select: "username fullName email" },
            { path: "petId", select: "name avatarUrl" },
        ],
    };

    return await PetOwnerInvitation.paginate(filter, options);
}

/**
 * UPDATE
 * Cập nhật mối quan hệ của bất kỳ đồng sở hữu nào với Pet (Admin force update)
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID đồng sở hữu
 * @param { String } relationship - Mối quan hệ
 * @returns Bản ghi đồng sở hữu
 */
async function updatePetOwnerRelationship(petId, ownerId, relationship) {
    const updatedPetOwner = await PetOwner.findOneAndUpdate(
        {
            petId: petId,
            userId: ownerId,
            deletedAt: null,
        },
        {
            relationship: relationship.trim(),
        },
        { new: true, runValidators: true },
    );

    if (!updatedPetOwner) {
        const error = new Error("Không tìm thấy dữ liệu sở hữu.");
        error.status = 404;
        throw error;
    }

    return updatedPetOwner;
}

/**
 * UPDATE
 * Cập nhật role của bất kỳ đồng sở hữu nào (Admin force update)
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID người sở hữu
 * @param { String } role - Role mới (owner hoặc co-owner)
 * @returns Bản ghi đồng sở hữu
 */
async function updatePetOwnerRole(petId, ownerId, role) {
    const updatedPetOwner = await PetOwner.findOneAndUpdate(
        {
            petId: petId,
            userId: ownerId,
            deletedAt: null,
        },
        {
            role: role,
        },
        { new: true, runValidators: true },
    );

    if (!updatedPetOwner) {
        const error = new Error("Không tìm thấy dữ liệu sở hữu.");
        error.status = 404;
        throw error;
    }

    return updatedPetOwner;
}

/**
 * DELETE
 * Xóa quyền sở hữu của một người dùng đối với thú cưng (Admin force remove)
 * Xóa cứng (deleteOne) giống hành vi kickPetOwner của user.
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID người bị xóa quyền
 * @returns Kết quả xóa
 */
async function removePetOwner(petId, ownerId) {
    const petOwnerRecord = await PetOwner.findOne({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    });

    if (!petOwnerRecord) {
        const error = new Error("Không tìm thấy dữ liệu sở hữu.");
        error.status = 404;
        throw error;
    }

    // Cơ chế an toàn: Đảm bảo thú cưng không bị "mồ côi" owner (trừ khi admin chọn xóa luôn thú cưng)
    if (petOwnerRecord.role === "owner") {
        const ownersCount = await PetOwner.countDocuments({
            petId: petId,
            deletedAt: null,
            role: "owner",
        });

        if (ownersCount <= 1) {
            const error = new Error(
                "Đây là chủ sở hữu (owner) duy nhất của thú cưng. Vui lòng chỉ định owner khác thay thế trước khi xóa quyền của người này.",
            );
            error.status = 400;
            throw error;
        }
    }

    return await PetOwner.deleteOne({ petId: petId, userId: ownerId });
}

/**
 * DELETE
 * Xóa cứng một lời mời rác hoặc bị lỗi (Admin force delete)
 * @param { String } invitationId - ID bản ghi lời mời
 * @returns Kết quả xóa
 */
async function deleteInvitation(invitationId) {
    const deletedInvitation = await PetOwnerInvitation.findByIdAndDelete(invitationId);

    if (!deletedInvitation) {
        const error = new Error("Không tìm thấy lời mời này.");
        error.status = 404;
        throw error;
    }

    return deletedInvitation;
}

module.exports = {
    forceAssignPetOwner,
    getAllPetOwners,
    getAllInvitations,
    updatePetOwnerRelationship,
    updatePetOwnerRole,
    removePetOwner,
    deleteInvitation,
};
