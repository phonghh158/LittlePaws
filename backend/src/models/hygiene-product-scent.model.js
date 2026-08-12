// src/models/hygiene-product-scent.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const hygieneProductScentSchema = new mongoose.Schema(
    {
        hygieneProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HygieneProduct",
            required: true,
        },
        name: {
            type: String,
            required: true,
            default: "",
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        imageUrl: {
            type: String,
            default: "",
            trim: true,
        },
        deletedAt: {
            type: Date,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Khu vực cấu hình index
hygieneProductScentSchema.index({ hygieneProductId: 1 });
hygieneProductScentSchema.index({ name: 1 });
hygieneProductScentSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
hygieneProductScentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("HygieneProductScent", hygieneProductScentSchema);
