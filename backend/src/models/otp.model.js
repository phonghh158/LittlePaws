//src/models/otp.model.js
const mongoose = require("mongoose");
const { OTP_TYPES } = require("../constants/otp");

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        otpType: {
            type: String,
            enum: Object.values(OTP_TYPES),
            required: true,
        },
        otpCode: {
            type: String,
            required: true,
        },
        deviceId: {
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
