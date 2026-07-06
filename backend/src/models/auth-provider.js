// src/models/auth-provider.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authProviderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        provider: {
            type: String,
            enum: ["google", "facebook", "apple"],
            required: true,
        },
        providerIdToken: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index để tìm kiếm nhanh các nhà cung cấp xác thực theo người dùng
authProviderSchema.index({ userId: 1 });

// Compound Index đảm bảo một token định danh của một nhà cung cấp là duy nhất
authProviderSchema.index({ provider: 1, providerIdToken: 1 }, { unique: true });

module.exports = mongoose.model("AuthProvider", authProviderSchema);
