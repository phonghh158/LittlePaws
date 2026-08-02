// src/models/hygiene-record.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const hygieneRecordSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
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
                type: mongoose.Schema.Types.ObjectId,
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
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index tìm kiếm nhanh
hygieneRecordSchema.index({ petId: 1 });
hygieneRecordSchema.index({ type: 1 });
hygieneRecordSchema.index({ executionDate: -1 });
hygieneRecordSchema.index({ petId: 1, type: 1 });

// Khu vực gọi plugin
hygieneRecordSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("HygieneRecord", hygieneRecordSchema);
