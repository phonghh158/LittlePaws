// src/models/pet-owner.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petOwnerSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        petId: {
            type: Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        relationship: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index hỗ trợ tìm kiếm hai chiều từ phía người dùng hoặc từ phía thú cưng
petOwnerSchema.index({ userId: 1 });
petOwnerSchema.index({ petId: 1 });

// Compound index đảm bảo một người không bị tạo trùng lặp mối quan hệ với cùng một bé thú cưng
petOwnerSchema.index({ userId: 1, petId: 1 }, { unique: true });

module.exports = mongoose.model("PetOwner", petOwnerSchema);
