// src/models/pet.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const petSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            default: "Pet",
            trim: true,
            minlength: 1,
            maxlength: 72,
        },
        nickname: {
            type: String,
            default: "",
            trim: true,
            maxlength: 96,
        },
        breedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Breed",
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "unknown"],
        },
        dob: {
            type: Date,
            required: true,
            default: null,
        },
        adoptionDate: {
            type: Date,
            default: null,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        bloodType: {
            type: String,
            default: "Whole blood",
            trim: true,
        },
        isNeutered: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["alive", "lost", "gone", "other"],
            default: "alive",
        },
        deletedAt: {
            type: Date,
            default: null,
            expires: "60d",
        },
    },
    {
        timestamps: true,
    },
);

// Khu vực cấu hình index
petSchema.index({ name: "text" });
petSchema.index({ breedId: 1 });
petSchema.index({ status: 1 });
petSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
petSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Pet", petSchema);
