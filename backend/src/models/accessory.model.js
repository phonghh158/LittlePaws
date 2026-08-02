// src/models/accessory.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const accessorySchema = new mongoose.Schema(
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

// Khu vực gọi plugin
accessorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Accessory", accessorySchema);
