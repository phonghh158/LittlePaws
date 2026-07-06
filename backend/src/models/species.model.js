// src/models/species.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const speciesSchema = new Schema(
    {
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

// Index phục vụ việc tìm kiếm loài chưa bị xóa mềm
speciesSchema.index({ deletedAt: 1 });

module.exports = mongoose.model("Species", speciesSchema);
