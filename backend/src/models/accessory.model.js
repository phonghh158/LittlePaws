// src/models/accessory.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessorySchema = new Schema(
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
            enum: ["collar", "leash", "clothes", "toy", "bowl", "bed"],
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
accessorySchema.index({ name: "text", brand: "text" });
accessorySchema.index({ category: 1 });
accessorySchema.index({ slug: 1 });
accessorySchema.index({ ownerId: 1 });
accessorySchema.index({ speciesIds: 1 });
accessorySchema.index({ deletedAt: 1 });

module.exports = mongoose.model("Accessory", accessorySchema);
