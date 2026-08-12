// src/models/pet-care-brand.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const petCareBrandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        logoUrl: {
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
petCareBrandSchema.index({ name: 1 });
petCareBrandSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
petCareBrandSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("PetCareBrand", petCareBrandSchema);
