// src/models/hygiene-product.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const hygieneProductSchema = new mongoose.Schema(
    {
        speciesIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Species",
            },
        ],
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["litter", "shampoo", "cleaning_solution", "deodorizer"],
            required: true,
        },
        unit: {
            type: String,
            enum: ["bottle", "pack", "piece", "box", "bag", "can"],
            required: true,
        },
        measurementValue: {
            type: Number,
            required: true,
        },
        measurementUnit: {
            type: String,
            enum: ["g", "kg", "ml", "L"],
            required: true,
        },
        description: {
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
hygieneProductSchema.index({ speciesIds: 1 });
hygieneProductSchema.index({ slug: 1 });
hygieneProductSchema.index({ name: "text", brand: "text" });
hygieneProductSchema.index({ category: 1 });
hygieneProductSchema.index({ ownerId: 1 });
hygieneProductSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
hygieneProductSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("HygieneProduct", hygieneProductSchema);
