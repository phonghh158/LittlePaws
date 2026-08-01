// src/models/body-metric.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bodyMetricSchema = new Schema(
    {
        petId: {
            type: Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        weight: {
            type: Number,
            default: null, // Đơn vị: kg
        },
        recordedAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index tìm kiếm theo thú cưng
bodyMetricSchema.index({ petId: 1 });

// Index hỗ trợ truy vấn lịch sử cân nặng theo thời gian (mới nhất xếp trước)
bodyMetricSchema.index({ petId: 1, recordedAt: -1 });

module.exports = mongoose.model("BodyMetric", bodyMetricSchema);
