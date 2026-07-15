//src/models/otp.model.js
const mongoose = require("mongoose");
const { VERIFICATION_TYPES } = require("../constants/verification");

const verificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        deviceId: {
            type: String,
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
    },
);

// Hỗ trợ tối ưu truy vấn tìm kiếm OTP của user
otpSchema.index({ userId: 1, otpType: 1 });

module.exports = mongoose.model("OTPs", otpSchema);
