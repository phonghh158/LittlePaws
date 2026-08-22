// src/models/stock.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const stockSchema = new mongoose.Schema(
    {
        // Id nhóm thú cưng sở hữu kho
        familyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Family",
            required: true,
        },
        itemRefId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        stockType: {
            type: String,
            enum: ["food", "hygiene-product"],
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

// Index hỗ trợ tìm nhanh toàn bộ kho của một gia đình
stockSchema.index({ familyId: 1 });

// Compound index hỗ trợ phân loại kho
stockSchema.index({ familyId: 1, stockType: 1 });

// Index hỗ trợ truy vấn ngược từ sản phẩm
stockSchema.index({ itemRefId: 1 });

// Index hỗ trợ set unique cho một famId - itemRefId
stockSchema.index({ familyId: 1, itemRefId: 1 }, { unique: true });

// Khu vực gọi plugin
stockSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Stock", stockSchema);
