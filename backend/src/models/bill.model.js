// src/models/bill.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// Sub-schema cho các mặt hàng trong hóa đơn
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
        // Giá của một sản phẩm, tổng giá không cần lưu trong db, sẽ được tính ở service.
        price: {
            type: Number,
            required: true,
        },
    },
    { _id: false },
);

// Schema chính cho hóa đơn
const billSchema = new mongoose.Schema(
    {
        // Người tạo hóa đơn
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Nhóm thú cưng
        familyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Family",
            required: true,
        },
        items: {
            type: [billItemSchema],
            validate: [(val) => val.length >= 1, "Hóa đơn phải có ít nhất một sản phẩm."],
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

// Index tìm kiếm hóa đơn theo gia đình
billSchema.index({ familyId: 1 });

// Index tìm kiếm hóa đơn theo người tạo
billSchema.index({ userId: 1 });

// Index hỗ trợ thống kê chi tiêu theo thời gian
billSchema.index({ purchaseDate: 1 });

// Khu vực gọi plugin
billSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Bill", billSchema);
