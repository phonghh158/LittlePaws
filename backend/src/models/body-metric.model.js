// src/models/body-metric.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const bodyMetricSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
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

// Khu vực plugin
bodyMetricSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("BodyMetric", bodyMetricSchema);
