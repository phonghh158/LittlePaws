const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hygieneProductSchema = new Schema(
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
        },
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["litter", "shampoo", "cleaning_solution", "deodorizer"],
            required: true,
        },
        unit: {
            type: String,
            enum: ["bottle", "pack", "piece", "box", "bag", "can"],
            required: true,
        },
        measurementValue: {
            type: Number,
            required: true,
        },
        measurementUnit: {
            type: String,
            enum: ["g", "kg", "ml", "L"],
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

hygieneProductSchema.index({ speciesIds: 1 });
hygieneProductSchema.index({ ownerId: 1 });
hygieneProductSchema.index({ category: 1 });
hygieneProductSchema.index({ deletedAt: 1 });

module.exports = mongoose.model("HygieneProduct", hygieneProductSchema);
