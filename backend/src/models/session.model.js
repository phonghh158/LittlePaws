// src/models/session.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        deviceId: {
            type: String,
            default: "",
        },
        userAgent: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "",
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

// Index tìm kiếm nhanh danh sách phiên đăng nhập của người dùng
sessionSchema.index({ userId: 1 });

// Index tìm kiếm nhanh token
sessionSchema.index({ refreshToken: 1 });

// Khu vực gọi plugin
sessionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Session", sessionSchema);
