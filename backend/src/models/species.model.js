// src/models/species.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const speciesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
            minlength: 2,
            maxlength: 32,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            maxlength: 2048,
            trim: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Khu vực cấu hình index
speciesSchema.index({ deletedAt: 1 });

// Khu vực gọi phân trang
speciesSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Species", speciesSchema);
