// src/services/family.service.js
const dayjs = require("dayjs");

const Family = require("../models/family.model");
const PetOwnerInvitation = require("../models/pet-owner-invitation.model");

/**
 * CREATE
 * Gửi lời mời trở thành thành viên của gia đình
 * @param { String } petId - ID thú cưng
 * @param { String } familyId - ID gia đình
 * @param { String } inviterId - ID người gửi lời mời
 * @param { String } inviteeId - ID người được mời
 * @returns Bản ghi lời mời
 */
async function inviteFamilyMember(petId, familyId, inviterId, inviteeId) {
    const inviteeExists = await Family.exists({
        _id: familyId,
        "ownership.userId": inviteeId,
        deletedAt: null,
    });

    if (inviteeExists) {
        const error = new Error("Người này đã là thành viên của gia đình.");
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
 * Phản hồi lời mời tham gia gia đình
 * @param { String } petId - ID thú cưng
 * @param { String } inviteeId - ID người được mời
 * @param { String } inviteeResponse - Phản hồi (accept hoặc reject)
 * @returns Thông tin gia đình sau khi cập nhật hoặc kết quả từ chối
 */
async function respondFamilyInvitation(petId, inviteeId, inviteeResponse) {
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
        const updatedFamily = await Family.findOneAndUpdate(
            { petIds: petId, deletedAt: null },
            { $push: { ownership: { userId: inviteeId, role: "co-owner" } } },
            { new: true, runValidators: true },
        ).populate([
            {
                path: "ownership.userId",
                select: "username fullName avatarUrl",
            },
            {
                path: "petIds",
                select: "name nickname avatarUrl",
            },
        ]);

        return updatedFamily;
    } catch (error) {
        console.log("[ERROR]: Có lỗi trong quá trình thêm thành viên vào Family.");
        console.log("[ROLLBACK]: Thay đổi lại bản ghi lời mời.");
        try {
            await PetOwnerInvitation.updateOne({ _id: invitation._id }, { status: "pending" });
        } catch (rollbackError) {
            console.log("[ERROR]: Có lỗi trong quá trình rollback bản ghi lời mời.");
            throw rollbackError;
        }
        throw error;
    }
}

/**
 * GET
 * Lấy danh sách lời mời trở thành thành viên của User
 * @param { String } userId - ID người dùng
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách lời mời
 */
async function getFamilyInvitationByUserId(userId, query) {
    const { status, page = 1, sort } = query;

    let filter = { inviteeId: userId };

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
            { path: "petId", select: "name avatarUrl" },
            { path: "inviterId", select: "username fullName avatarUrl" },
            { path: "inviteeId", select: "username fullName avatarUrl" },
        ],
    };

    return await PetOwnerInvitation.paginate(filter, options);
}

/**
 * GET
 * Lấy danh sách thành viên của gia đình
 * @param { String } familyId - ID gia đình
 * @returns Danh sách thành viên (ownership)
 */
async function getFamilyMembers(familyId) {
    const family = await Family.findOne({ _id: familyId, deletedAt: null })
        .populate({
            path: "ownership.userId",
            select: "username fullName avatarUrl",
        })
        .lean();

    if (!family) return [];

    return family.ownership;
}

/**
 * UPDATE
 * Cập nhật role của thành viên trong nhà
 * @param { String } familyId - ID gia đình
 * @param { String } targetUserId - ID người cần đổi role
 * @returns Bản ghi gia đình sau khi lưu
 */
async function updateFamilyMemberRole(familyId, targetUserId) {
    const family = await Family.findOne({
        _id: familyId,
        "ownership.userId": targetUserId,
        deletedAt: null,
    });

    if (!family) {
        throw new Error("DataNotFound");
    }

    const memberIndex = family.ownership.findIndex(
        (m) => m.userId.toString() === targetUserId.toString(),
    );

    if (memberIndex !== -1) {
        family.ownership[memberIndex].role =
            family.ownership[memberIndex].role === "co-owner" ? "owner" : "co-owner";
        return await family.save();
    }

    throw new Error("DataNotFound");
}

/**
 * DELETE
 * Kick out thành viên khỏi gia đình
 * @param { String } familyId - ID gia đình
 * @param { String } targetUserId - ID thành viên bị kick
 * @returns Kết quả update database
 */
async function kickFamilyMember(familyId, targetUserId) {
    const family = await Family.findOne({
        _id: familyId,
        "ownership.userId": targetUserId,
        deletedAt: null,
    });

    if (!family) {
        throw new Error("DataNotFound");
    }

    const ownerQuantity = family.ownership.filter((m) => m.role === "owner").length;
    const targetMember = family.ownership.find(
        (m) => m.userId.toString() === targetUserId.toString(),
    );

    if (ownerQuantity === 1 && targetMember.role === "owner") {
        const error = new Error(
            "Gia đình phải có ít nhất một chủ sở hữu chính.\n Nếu bạn muốn out hãy chuyển chức vụ cho một người khác.",
        );
        error.status = 400;
        throw error;
    }

    return await Family.updateOne(
        { _id: familyId },
        { $pull: { ownership: { userId: targetUserId } } },
    );
}

module.exports = {
    inviteFamilyMember,
    respondFamilyInvitation,
    getFamilyInvitationByUserId,
    getFamilyMembers,
    updateFamilyMemberRole,
    kickFamilyMember,
};
