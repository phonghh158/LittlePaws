// src/models/user.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
        },
        phoneNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },
        status: {
            type: String,
            enum: ["UNACTIVE", "ACTIVE", "BANNED"],
            default: "UNACTIVE",
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Thêm chỉ mục (Index) cho các trường thường xuyên dùng để truy vấn và lọc dữ liệu
userSchema.index({ status: 1 });
userSchema.index({ deletedAt: 1 });

module.exports = mongoose.model("User", userSchema);
