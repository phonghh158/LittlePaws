// src/models/food.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { PET_SPECIES } = require("../constants/pet-species");

const foodSchema = new mongoose.Schema(
    {
        species: {
            type: [
                {
                    type: String,
                    enum: Object.values(PET_SPECIES),
                },
            ],
            required: true,
            validate: {
                validator: function (val) {
                    if (val.includes(PET_SPECIES.OTHER)) {
                        return val.length === 1;
                    }
                    return val.length > 0;
                },
                message:
                    "Nếu chọn loại 'Khác', chỉ được phép có duy nhất giá trị này. Mảng cũng không được để rỗng.",
            },
        },
        brandId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PetCareBrand",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["dry_food", "wet_food", "treat"],
            required: true,
        },
        packaging: {
            type: {
                type: String,
                enum: ["bottle", "pack", "piece", "box", "bag", "can"],
                required: true,
            },
            value: {
                type: Number,
                required: true,
            },
            unit: {
                type: String,
                enum: ["g", "kg", "ml", "L"],
                required: true,
            },
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
foodSchema.index({ name: 1 });
foodSchema.index({ brandId: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ createdBy: 1 });
foodSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
foodSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Food", foodSchema);
