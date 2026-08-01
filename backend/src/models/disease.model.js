// src/models/disease.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const diseaseSchema = new Schema(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        speciesId: {
            type: Schema.Types.ObjectId,
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

module.exports = mongoose.model("Disease", diseaseSchema);
