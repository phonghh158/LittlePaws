// src/models/preventive-care.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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
            trim: true,
        },
        executionDate: {
            type: Date,
            default: null,
            required: true,
        },
        appointmentDate: {
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

// Khu vực gọi plugin
preventativeCareSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("PreventativeCare", preventativeCareSchema);
