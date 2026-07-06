// src/models/preventice-care.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const preventativeCareSchema = new Schema(
    {
        petId: {
            type: Schema.Types.ObjectId,
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
        veterinarian: {
            type: String,
            default: "",
        },
        clinic: {
            type: String,
            default: "",
        },
        note: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

// Index tìm kiếm lịch sử phòng bệnh của một thú cưng cụ thể
preventativeCareSchema.index({ petId: 1 });

// Index lọc theo loại phòng bệnh (ví dụ: chỉ xem lịch sử tẩy giun)
preventativeCareSchema.index({ petId: 1, type: 1 });

// Index hỗ trợ tìm kiếm các lịch hẹn sắp tới (nhắc lịch tiêm, nhỏ gáy...)
preventativeCareSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model("PreventativeCare", preventativeCareSchema);
