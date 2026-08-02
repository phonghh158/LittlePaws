// src/pet-owner.middleware.js
const PetOwner = require("../models/pet-owner.model");
const { error } = require("../utils/response");

async function authenticatePetOwner(req, res, next) {
    try {
        const userId = req.user.sub;
        const petId = req.params.petId || req.body.petId;

        if (!petId) return error(res, "Không tìm thấy bản ghi thú cưng.", 404);

        const petOwnerRecord = await PetOwner.findOne({
            petId: petId,
            userId: userId,
            deletedAt: null,
        }).lean();

        if (!petOwnerRecord) {
            return error(res, "Không tìm thấy bản ghi chủ sở hữu thú cưng.", 404);
        }

        next();
    } catch (error) {
        return next(error);
    }
}

async function authorizePetOwner(req, res, next) {
    try {
        const userId = req.user.sub;
        const petId = req.params.petId || req.body.petId;

        if (!petId) return error(res, "Không tìm thấy bản ghi thú cưng.", 404);

        const petOwnerRecord = await PetOwner.findOne({
            petId: petId,
            userId: userId,
            deletedAt: null,
        }).lean();

        if (!petOwnerRecord) {
            return error(res, "Không tìm thấy bản ghi chủ sở hữu thú cưng.", 404);
        }

        if (petOwnerRecord.role !== "owner") {
            return error(res, "Không có quyền truy cập thông tin.", 403);
        }

        next();
    } catch (error) {
        return next(error);
    }
}
