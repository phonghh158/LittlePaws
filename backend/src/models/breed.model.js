// src/models/breed.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const breedSchema = new Schema(
    {
        speciesId: {
            type: Schema.Types.ObjectId,
            ref: "Species",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
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

// Index giúp tìm nhanh các giống thuộc một loài và chưa bị xóa
breedSchema.index({ speciesId: 1, deletedAt: 1 });

module.exports = mongoose.model("Breed", breedSchema);
