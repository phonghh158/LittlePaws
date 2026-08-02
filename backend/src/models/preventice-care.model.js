// src/models/preventice-care.model.js
const mongoose = require("mongoose");

const preventativeCareSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        type: {
            type: String,
            enum: ["vaccine", "deworm", "rabies", "flea_tick"],
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        appointmentDate: {
            type: Date,
            default: null,
        },
        executionDate: {
            type: Date,
            default: null,
        },
        clinic: {
            type: String,
            default: "",
            trim: true,
        },
        veterinarian: {
            type: String,
            default: "",
            trim: true,
        },
        note: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index tìm kiếm lịch sử phòng bệnh của một thú cưng cụ thể
preventativeCareSchema.index({ petId: 1 });

// Index lọc theo loại phòng bệnh
preventativeCareSchema.index({ petId: 1, type: 1 });

// Index hỗ trợ tìm kiếm các lịch hẹn sắp tới
preventativeCareSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model("PreventativeCare", preventativeCareSchema);
