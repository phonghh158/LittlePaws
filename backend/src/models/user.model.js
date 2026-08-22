//src/models/user.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 16,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 72,
        },
        gender: {
            type: String,
            enum: ["male", "female", "unknown"],
            default: "unknown",
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
        bannedAt: {
            type: Date,
            default: null,
        },
        deletedAt: {
            type: Date,
            default: null,
            expires: "30d",
        },
    },
    {
        timestamps: true,
    },
);

// Khu vực cấu hình index
userSchema.index({ username: "text", fullName: "text" });
userSchema.index({ deletedAt: 1 });

// Plugin
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", userSchema);
