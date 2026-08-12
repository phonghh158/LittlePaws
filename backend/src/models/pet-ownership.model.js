// src/models/pet-ownership.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const petOwnershipSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        relationship: {
            type: String,
            required: true,
            default: "co-owner",
            trim: true,
        },
        role: {
            type: String,
            enum: ["owner", "co-owner"],
            default: "co-owner",
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

// Index
petOwnershipSchema.index({ userId: 1, petId: 1 }, { unique: true });
petOwnershipSchema.index({ petId: 1 });

// plugin
petOwnershipSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("PetOwnership", petOwnershipSchema);
