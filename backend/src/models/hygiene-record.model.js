const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hygieneRecordSchema = new Schema(
    {
        petId: {
            type: Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        type: {
            type: String,
            enum: ["bath", "nail_trim", "ear_clean", "teeth_clean", "grooming"],
            required: true,
        },
        executionDate: {
            type: Date,
            required: true,
        },
        productsUsed: [
            {
                type: Schema.Types.ObjectId,
                ref: "HygieneProduct",
                default: [],
            },
        ],
        cost: {
            type: Number,
            default: null,
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

// Index tìm kiếm toàn bộ lịch sử vệ sinh của một thú cưng
hygieneRecordSchema.index({ petId: 1 });

// Index lọc theo loại hình vệ sinh (ví dụ: chỉ xem lịch sử cắt móng)
hygieneRecordSchema.index({ type: 1 });

// Index hỗ trợ sắp xếp và lọc theo ngày thực hiện (mới nhất xếp trước)
hygieneRecordSchema.index({ executionDate: -1 });

// Index hỗn hợp để truy vấn nhanh một loại vệ sinh của một bé cụ thể
hygieneRecordSchema.index({ petId: 1, type: 1 });

module.exports = mongoose.model("HygieneRecord", hygieneRecordSchema);
