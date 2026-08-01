// src/models/pet-owner-invation.model.js
const mongoose = require("mongoose");

const petOwnerInvitationSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        // Người mời
        inviterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Người được mời
        inviteeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Ngăn trường hợp 1 người bị mời làm chủ 1 bé thú cưng nhiều lần cùng lúc khi lời mời trước chưa hết hạn
petOwnerInvitationSchema.index({ petId: 1, inviteeId: 1, status: 1 });

// Xóa sau 3 ngày (259200 giây) tính từ updatedAt nếu status là accepted hoặc rejected
petOwnerInvitationSchema.index(
    { updatedAt: 1 },
    {
        expireAfterSeconds: 3 * 24 * 60 * 60,
        partialFilterExpression: {
            status: { $in: ["accepted", "rejected"] },
        },
    },
);

// Xóa sau 7 ngày (604800 giây) tính từ expiresAt nếu status là pending
petOwnerInvitationSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 7 * 24 * 60 * 60,
        partialFilterExpression: {
            status: "pending",
        },
    },
);

module.exports = mongoose.model("PetOwnerInvitation", petOwnerInvitationSchema);
