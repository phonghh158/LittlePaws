// src/models/bill.model.js
const mongoose = require("mongoose");

// Định nghĩa sub-schema cho các mặt hàng trong hóa đơn
const billItemSchema = new mongoose.Schema(
    {
        itemRefId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    { _id: false },
); // Tắt tự tạo _id cho từng item con để dữ liệu nhẹ hơn

// Định nghĩa schema chính cho hóa đơn
const billSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        purchaseDate: {
            type: Date,
            required: true,
        },
        discount: {
            type: Number,
            default: 0, // Số tiền giảm giá
        },
        note: {
            type: String,
            default: "",
            trim: true,
        },
        items: {
            type: [billItemSchema],
            validate: [(val) => val.length >= 1, "Hóa đơn phải có ít nhất một sản phẩm."],
        },
        deletedAt: {
            type: Date,
            default: null,
            expires: "45d",
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

// Index tìm kiếm hóa đơn theo thú cưng
billSchema.index({ petId: 1 });

// Index hỗ trợ thống kê chi tiêu theo thời gian
billSchema.index({ purchaseDate: 1 });

// Khu vực gọi plugin
billSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Bill", billSchema);
