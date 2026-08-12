// src/services/pet-owner.service.js
const dayjs = require("dayjs");

const Pet = require("../models/pet.model");
const PetOwnership = require("../models/pet-ownership.model");
const PetOwnerInvitation = require("../models/pet-owner-invitation.model");

const PetOwnerHelper = require("../services/helper/pet-owner.helper");
const { populate } = require("../models/user.model");

/**
 * CREATE
 * Gửi lời mời trở thành đồng sở hữu của thú cưng
 * @param { String } petId - ID thú cưng
 * @param { String } inviterId - ID người gửi lời mời
 * @param { String } inviteeId - ID người được mời
 */
async function invitePetOwner(petId, inviterId, inviteeId) {
    const inviteeIsPetOwner = await PetOwnership.exists({
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
        status: "pending",
        expiresAt: { $gt: dayjs().toDate() },
    });

    if (invitation) {
        return await PetOwnerInvitation.updateOne(
            { _id: invitation._id },
            {
                inviterId: inviterId,
                inviteeId: inviteeId,
                status: "pending",
                expiresAt: dayjs().add(3, "day").toDate(),
            },
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
        status: "pending",
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
        return await PetOwnership.create({
            petId: petId,
            userId: inviteeId,
        }).populate([
            {
                path: "userId",
                select: "username fullName avatarUrl",
            },
            {
                path: "petId",
                select: "name nickname avatarUrl",
            },
        ]);
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
        populate: [
            {
                path: "petId",
                select: "name avatarUrl",
            },
            {
                path: "inviterId",
                select: "username fullName avatarUrl",
            },
            {
                path: "inviteeId",
                select: "username fullName avatarUrl",
            },
        ],
    };

    return await PetOwnerInvitation.paginate(filter, options);
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
        populate: [
            {
                path: "userId",
                select: "username fullName avatarUrl",
            },
        ],
    };

    return await PetOwnership.paginate(filter, options);
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
    const updatedPetOwner = await PetOwnership.findOneAndUpdate(
        {
            petId: petId,
            userId: ownerId,
            deletedAt: null,
        },
        {
            relationship: relationship.trim(),
        },
        { new: true, runValidators: true },
    )
        .populate([
            {
                path: "userId",
                select: "username fullName avatarUrl",
            },
            {
                path: "petId",
                select: "name nickname avatarUrl",
            },
        ])
        .lean();

    if (!updatedPetOwner) {
        throw new Error("DataNotFound");
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
async function updatePetOwnerRole(petId, ownerId) {
    const petOwnerRecord = await PetOwnership.findOne({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    }).populate([
        {
            path: "userId",
            select: "username fullName avatarUrl",
        },
        {
            path: "petId",
            select: "name nickname avatarUrl",
        },
    ]);

    if (!petOwnerRecord) {
        throw new Error("DataNotFound");
    }

    petOwnerRecord.role = petOwnerRecord.role === "co-owner" ? "owner" : "co-owner";

    return await petOwnerRecord.save();
}
/**
 * DELETE
 * Kick out người đồng sở hữu
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID người sở hữu
 * @param { String } coOwnerId - ID người đồng sở hữu
 */
async function kickPetOwner(petId, ownerId) {
    const petOwnerOut = await PetOwnership.findOne({
        petId: petId,
        userId: ownerId,
        deletedAt: null,
    }).populate([
        {
            path: "userId",
            select: "username fullName avatarUrl",
        },
        {
            path: "petId",
            select: "name nickname avatarUrl",
        },
    ]);

    if (!petOwnerOut) {
        throw new Error("DataNotFound");
    }

    const petOwnerRecordQuantity = await PetOwnership.countDocuments({
        petId: petId,
        role: "owner",
        deletedAt: null,
    });

    if (petOwnerRecordQuantity === 1 && petOwnerOut.role === "owner") {
        const error = new Error(
            "Thú cưng phải có một chủ sở hữu chính.\n Nếu bạn muốn out hãy chuyển chức vụ cho một người khác.",
        );
        error.status = 400;
        throw error;
    }

    return await PetOwner.deleteOne({ petId: petId, userId: ownerId });
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
