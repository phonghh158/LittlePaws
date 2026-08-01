// src/models/verification.model.js
const mongoose = require("mongoose");
const { VERIFICATION_TYPES } = require("../constants/verification");

const verificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        verificationType: {
            type: String,
            enum: Object.values(VERIFICATION_TYPES),
            required: true,
        },
        otpCode: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        expiredAt: {
            type: Date,
            required: true,
            expires: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Hỗ trợ tối ưu truy vấn tìm kiếm OTP của user
verificationSchema.index({ userId: 1, verificationType: 1 });

module.exports = mongoose.model("Verification", verificationSchema);
