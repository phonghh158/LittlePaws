const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessorySchema = new Schema(
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
            enum: ["collar", "leash", "clothes", "toy", "bowl", "bed"],
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

accessorySchema.index({ speciesIds: 1 });
accessorySchema.index({ ownerId: 1 });
accessorySchema.index({ category: 1 });
accessorySchema.index({ deletedAt: 1 });

module.exports = mongoose.model("Accessory", accessorySchema);
