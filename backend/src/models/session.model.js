// src/models/session.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        deviceInfo: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "",
        },
        userAgent: {
            type: String,
            default: "",
        },
        expiredAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index tìm kiếm nhanh danh sách phiên đăng nhập của người dùng
sessionSchema.index({ userId: 1 });

// TTL Index: Tự động xóa bản ghi khi thời gian hiện tại vượt quá expiredAt
sessionSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
