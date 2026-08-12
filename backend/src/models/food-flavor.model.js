// src/models/food-flavor.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const foodFlavorSchema = new mongoose.Schema(
    {
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
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
foodFlavorSchema.index({ foodId: 1 });
foodFlavorSchema.index({ name: 1 });
foodFlavorSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
foodFlavorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("FoodFlavor", foodFlavorSchema);
