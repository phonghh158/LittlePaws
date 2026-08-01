// src/models/food.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodSchema = new Schema(
    {
        speciesIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Species",
            },
        ],
        ownerId: {
            type: Schema.Types.ObjectId,
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
            enum: ["dry_food", "wet_food", "treat", "supplement"],
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
foodSchema.index({ name: "text", brand: "text" });
foodSchema.index({ slug: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ ownerId: 1 });
foodSchema.index({ speciesIds: 1 });
foodSchema.index({ deletedAt: 1 });

module.exports = mongoose.model("Food", foodSchema);
