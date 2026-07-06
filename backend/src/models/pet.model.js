// src/models/pet.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        nickname: {
            type: String,
            default: "",
        },
        speciesId: {
            type: Schema.Types.ObjectId,
            ref: "Species",
            required: true,
        },
        breedId: {
            type: Schema.Types.ObjectId,
            ref: "Breed",
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "unknown"],
            required: true,
        },
        dob: {
            type: Date,
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
            default: "",
        },
        isNeutered: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["alive", "lost", "gone"],
            default: "alive",
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Các index hỗ trợ truy vấn và lọc danh sách thú cưng
petSchema.index({ speciesId: 1 });
petSchema.index({ breedId: 1 });
petSchema.index({ status: 1 });
petSchema.index({ deletedAt: 1 });

module.exports = mongoose.model("Pet", petSchema);
