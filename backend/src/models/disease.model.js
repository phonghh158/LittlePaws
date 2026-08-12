// src/models/disease.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { PET_SPECIES } = require("../constants/pet-species");

const diseaseSchema = new mongoose.Schema(
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
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        symptoms: {
            type: [String],
            default: [],
        },
        severity: {
            type: String,
            enum: ["mild", "observation", "severe"],
        },
        isContagious: {
            type: Boolean,
            default: false,
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
diseaseSchema.index({ species: 1 });
diseaseSchema.index({ slug: 1 });
diseaseSchema.index({ name: "text" });
diseaseSchema.index({ creatorId: 1 });
diseaseSchema.index({ isContagious: 1 });
diseaseSchema.index({ deletedAt: 1 });

// Khu vực gọi plugin
diseaseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Disease", diseaseSchema);
