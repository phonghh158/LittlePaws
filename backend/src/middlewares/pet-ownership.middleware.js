// src/pet-ownership.middleware.js
const PetOwnership = require("../models/pet-ownership.model");
const { error } = require("../utils/response");

async function authenticatePetOwner(req, res, next) {
    try {
        const userId = req.user.sub;
        const petId = req.params.petId || req.body.petId;

        if (!petId) return error(res, "Không tìm thấy bản ghi thú cưng.", 404);

        const petOwnershipRecord = await PetOwnership.findOne({
            petId: petId,
            userId: userId,
            deletedAt: null,
        }).lean();

        if (!petOwnershipRecord) {
            return error(res, "Không tìm thấy bản ghi chủ sở hữu thú cưng.", 404);
        }

        req.petOwnerRole = petOwnershipRecord.role;

        next();
    } catch (error) {
        return next(error);
    }
}

async function authorizePetOwner(req, res, next) {
    try {
        if (req.petOwnerRole !== "owner") {
            return error(res, "Không có quyền truy cập thông tin.", 403);
        }

        next();
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    authenticatePetOwner,
    authorizePetOwner,
};
