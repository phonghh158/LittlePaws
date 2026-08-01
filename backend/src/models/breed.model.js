//src/models/breed.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const breedSchema = new mongoose.Schema(
    {
        speciesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Species",
            required: true,
        },
        name: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 72,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            maxlength: 2048,
            trim: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Khu vực cấu hình index
breedSchema.index({ name: "text" });
breedSchema.index({ speciesId: 1 });
breedSchema.index({ deletedAt: 1 });
breedSchema.index({ speciesId: 1, name: 1 }, { unique: true });

// Khu vực gọi plugin phân trang
breedSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Breed", breedSchema);
