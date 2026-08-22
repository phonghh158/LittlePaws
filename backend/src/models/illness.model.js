// src/models/illness-record.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const illnessSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        diseaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Disease",
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            default: null,
        },
        cost: {
            type: Number,
            default: null,
        },
        clinic: {
            type: String,
            default: null,
            trim: true,
        },
        veterinarian: {
            type: String,
            default: null,
            trim: true,
        },
        note: {
            type: String,
            default: "",
            trim: true,
        },
        deletedAt: {
            type: Date,
            default: null,
            expires: "45d",
        },
    },
    {
        timestamps: true,
    },
);

// Khu vực cấu hình index
illnessRecordSchema.index({ petId: 1 });
illnessRecordSchema.index({ diseaseName: "text" });
illnessRecordSchema.index({ startDate: 1 });
illnessRecordSchema.index({ endDate: 1 });

// Khu vực gọi plugin
illnessRecordSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Illness", illnessRecordSchema);
