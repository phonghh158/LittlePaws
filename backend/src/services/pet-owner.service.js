// src/services/pet-owner.service.js
const dayjs = require("dayjs");

const Pet = require("../models/pet.model");
const PetOwner = require("../models/pet-owner.model");
const PetOwnerInvitation = require("../models/pet-owner-invitation.model");

/**
 * CREATE
 * Gửi lời mời trở thành đồng sở hữu của thú cưng
 * @param { String } petId - ID thú cưng
 * @param { String } inviterId - ID người gửi lời mời
 * @param { String } inviteeId - ID người được mời
 */
async function invitePetOwner(petId, inviterId, inviteeId) {
    const petOwnerRecord = await PetOwner.findOne({
        petId: petId,
        userId: inviterId,
        deletedAt: null,
    }).select("role");

    if (!petOwnerRecord) {
        const error = new Error("Không tìm thấy bản ghi thú cưng.");
        error.status = 404;
        throw error;
    }

    if (petOwnerRecord.role !== "owner") {
        const error = new Error(
            "Không có quyền thao tác mời người khác trở thành đồng sở hữu.",
        );
        error.status = 403;
        throw error;
    }

    const inviteeIsPetOwner = await PetOwner.exists({
        petId: petId,
        userId: inviteeId,
        deletedAt: null,
    });

    if (inviteeIsPetOwner) {
        const error = new Error("Người này đã là đồng sở hữu.");
        error.status = 400;
        throw error;
    }

    const invitation = await PetOwnerInvitation.findOne({
        petId: petId,
        inviteeId: inviteeId,
        expiresAt: { $gt: dayjs().toDate() },
    });

    if (invitation) {
        return await PetOwnerInvitation.updateOne(
            { _id: invitation._id },
            { expiresAt: dayjs().add(3, "day").toDate() },
        );
    }

    return await PetOwnerInvitation.create({
        petId: petId,
        inviterId: inviterId,
        inviteeId: inviteeId,
        expiresAt: dayjs().add(3, "day").toDate(),
    });
}

/**
 * UPDATE AND CREATE
 * Phản hồi lời mời trở thành đồng sở hữu
 * @param { String } invitationId - ID lời mời
 * @param { String } inviteeId - ID người được mời
 * @param { String } inviteeResponse - Phản hồi (accept hoặc reject)
 * @returns Đồng ý hay từ chối
 */
async function respondPetOwnerInvitation(petId, inviteeId, inviteeResponse) {
    const invitation = await PetOwnerInvitation.findOne({
        petId: petId,
        inviteeId: inviteeId,
        expiresAt: { $gt: dayjs().toDate() },
    });

    if (!invitation) {
        const error = new Error("Không tìm thấy lời mời / Lời mời đã hết hạn.");
        error.status = 404;
        throw error;
    }

    if (inviteeResponse === "reject") {
        return await PetOwnerInvitation.updateOne(
            { _id: invitation._id },
            { status: "rejected" },
        );
    }

    const acceptedPetOwnerInvitation = await PetOwnerInvitation.updateOne(
        { _id: invitation._id },
        { status: "accepted" },
    );
    if (!acceptedPetOwnerInvitation) {
        throw new Error("Có lỗi trong quá trình cập nhật phản hồi.");
    }

    try {
        const petOwnerData = {
            petId: petId,
            userId: inviteeId,
        };

        return await PetOwner.create(petOwnerData);
    } catch (error) {
        console.log("[ERROR]: Có lỗi trong quá trình tạo bản ghi đồng sở hữu.");
        console.log("[ROLLBACK]: Thay đổi lại bản ghi lời mời.");
        try {
            await PetOwnerInvitation.updateOne({ _id: invitation._id }, { status: "pending" });
        } catch (error) {
            console.log("[ERROR]: Có lỗi trong quá trình rollback bản ghi lời mời.");
            console.log(
                "[ROLLBACK]: Vui lòng cập nhật thủ công để tránh gây gián đoạn hệ thống.",
            );

            throw error;
        }

        throw error;
    }
}

/**
 * GET
 * Lấy danh sách lời mời trở thành đồng sở hữu của User
 * @param { String } userId - ID người dùng
 * @param { Object } query - Object chứa thông tin query
 */
async function getPetOwnerInvitationByUserId(userId, query) {
    const { status, page = 1, sort } = query;

    let filter = {
        inviteeId: userId,
    };

    if (status) {
        if (status === "pending") filter.status = "pending";
        else if (status === "accepted") filter.status = "accepted";
        else if (status === "rejected") filter.status = "rejected";
    }

    const options = {
        page: parseInt(page, 10),
        limit: 9,
        sort: sort ? sort : { createdAt: -1 },
    };

    return await PetOwnerInvitation.paginate({ inviteeId: userId }, options);
}

/**
 * GET
 * Lấy danh sách đồng sở hữu của Pet
 * @param { String } petId - ID bản ghi thú cưng
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách đồng sở hữu
 */
async function getPetOwnersByPetId(petId, query) {
    const { status, page = 1, sort } = query;

    let filter = {
        petId: petId,
    };

    if (status) {
        if (status === "pending") filter.status = "pending";
        else if (status === "rejected") filter.status = "rejected";
    }

    const options = {
        page: parseInt(page, 10),
        limit: 9,
        sort: sort ? sort : { createdAt: -1 },
    };

    return await PetOwner.paginate(filter, options);
}

/**
 * UPDATE
 * Cập nhật mối quan hệ của đồng sở hữu với Pet
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
        const error = new Error("Không tìm thấy đồng sở hữu.");
        error.status = 404;
        throw error;
    }

    return updatedPetOwner;
}

/**
 * UPDATE
 * Cập nhật role của đồng sở hữu
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID người sở hữu
 * @param { String } coOwnerId - ID người đồng sở hữu
 * @param { String } role - Role
 */
async function updatePetOwnerRole(petId, ownerId, coOwnerId, role) {
    const petOwnerRecord = await PetOwner.findOne({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    });

    if (!petOwnerRecord) {
        const error = new Error("Không tìm thấy bản ghi thú cưng.");
        error.status = 404;
        throw error;
    }

    if (petOwnerRecord.role !== "owner") {
        const error = new Error("Không có quyền thay đổi role của người khác.");
        error.status = 403;
        throw error;
    }

    const petCoOwnerRecord = await PetOwner.findOne({
        petId: petId,
        userId: coOwnerId,
        deletedAt: null,
    });

    if (!petCoOwnerRecord) {
        const error = new Error("Người dùng này không phải chủ sở hữu của bé pet này.");
        error.status = 404;
        throw error;
    }

    if (petCoOwnerRecord.role === "co-owner") role = "owner";
    else role = "co-owner";

    return await petCoOwnerRecord.save({ role: role });
}

/**
 * DELETE
 * Kick out người đồng sở hữu
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID người sở hữu
 * @param { String } coOwnerId - ID người đồng sở hữu
 */
async function kickPetOwner(petId, ownerId, coOwnerId, role) {
    const petOwnerRecord = await PetOwner.findOne({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    });

    if (!petOwnerRecord) {
        const error = new Error("Không tìm thấy bản ghi thú cưng.");
        error.status = 404;
        throw error;
    }

    if (petOwnerRecord.role !== "owner") {
        if (ownerId === coOwnerId) {
            return await PetOwner.deleteOne({ petId: petId, userId: ownerId });
        }

        const error = new Error("Không có quyền thay đổi role của người khác.");
        error.status = 403;
        throw error;
    }

    if (ownerId === coOwnerId) {
        const petOwnersRecord = await PetOwner.find({
            petId: petId,
            deletedAt: null,
            role: "owner",
        });

        if (petOwnersRecord.length === 1) {
            const error = new Error(
                "Thú cưng chỉ có một chủ sở hữu duy nhất, nếu bạn không còn là chủ sở hữu, bạn phải chuyển quyền này cho người khác.",
            );
            error.status = 400;
            throw error;
        }
    }

    const petCoOwnerRecord = await PetOwner.findOne({
        petId: petId,
        userId: coOwnerId,
        deletedAt: null,
    });

    if (!petCoOwnerRecord) {
        const error = new Error("Người dùng này không phải chủ sở hữu của bé pet này.");
        error.status = 404;
        throw error;
    }

    return await PetOwner.deleteOne({ petId: petId, userId: coOwnerId });
}

module.exports = {
    invitePetOwner,
    respondPetOwnerInvitation,
    getPetOwnerInvitationByUserId,
    getPetOwnersByPetId,
    updatePetOwnerRelationship,
    updatePetOwnerRole,
    kickPetOwner,
};
