// src/models/disease.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const diseaseSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        speciesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Species",
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        symptoms: {
            type: [String],
            default: [],
        },
        severity: {
            type: String,
            enum: ["mild", "observation", "severe"],
        },
        isContagious: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Khu vực cấu hình index
diseaseSchema.index({ speciesId: 1 });
diseaseSchema.index({ slug: 1 });
diseaseSchema.index({ name: "text" });
diseaseSchema.index({ ownerId: 1 });
diseaseSchema.index({ isContagious: 1 });
diseaseSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
diseaseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Disease", diseaseSchema);
