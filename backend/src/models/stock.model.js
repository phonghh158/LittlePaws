// src/models/stock.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const stockSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        itemRefId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        stockType: {
            type: String,
            enum: ["food", "hygiene", "accessory"],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index hỗ trợ tìm nhanh toàn bộ kho của một thú cưng
stockSchema.index({ petId: 1 });

// Compound index hỗ trợ phân loại kho
stockSchema.index({ petId: 1, stockType: 1 });

// Index hỗ trợ truy vấn ngược từ sản phẩm
stockSchema.index({ itemRefId: 1 });

// Khu vực gọi plugin
stockSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Stock", stockSchema);
