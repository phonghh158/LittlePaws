const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = new Schema(
    {
        petId: {
            type: Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        itemRefId: {
            type: Schema.Types.ObjectId,
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

module.exports = mongoose.model("Stock", stockSchema);
