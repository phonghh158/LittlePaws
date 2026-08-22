// src/models/home.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const dayjs = require("dayjs");

// Sub-schema thành viên trong nhà
const memberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["OWNER", "MEMBER"],
            default: "MEMBER",
            required: true,
        },
        joinedAt: {
            type: Date,
            default: dayjs().toDate(),
        },
    },
    {
        _id: false,
    },
);

// Schema chính
const homeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            default: "Home",
            trim: true,
            minlength: 1,
            maxlength: 72,
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 256,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        members: {
            type: [memberSchema],
            validate: {
                validator: function (val) {
                    return Array.isArray(val) && v.length >= 1;
                },
                message: "Members must have at least one member",
            },
        },
        deletedAt: {
            type: Date,
            default: null,
            expires: "60d",
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

// Khu vực cấu hình index
homeSchema.index({ name: "text" });
homeSchema.index({ "members.userId": 1 });
homeSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
homeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Home", homeSchema);
