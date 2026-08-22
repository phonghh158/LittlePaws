// src/middlewares/pet-ownership.middleware.js
const Pet = require("../models/pet.model");
const Home = require("../models/home.model");
const { error } = require("../utils/response");

async function authenticateHomeMember(req, res, next) {
    try {
        const userId = req.user.sub;
        const homeId = req.params.homeId || req.body.homeId;

        if (!homeId) {
            return error(res, "Không tìm thấy dữ liệu quyền sở hữu.", 404);
        }

        const home = await Home.findOne({
            _id: homeId,
            "members.userId": userId,
            deletedAt: null,
        }).lean();

        if (!home) {
            return error(res, "Không tìm thấy bản ghi quyền sở hữu.", 404);
        }

        const currentMember = home.members.find(
            (member) => member.userId.toString() === userId.toString(),
        );

        req.memberRole = currentMember.role;

        next();
    } catch (err) {
        return next(err);
    }
}

async function authenticatePetOwner(req, res, next) {
    try {
        const userId = req.user.sub;
        const petId = req.params.petId || req.body.petId;

        if (!petId) {
            return error(res, "Không tìm thấy dữ liệu thú cưng.", 404);
        }

        const pet = await Pet.findOne({
            _id: petId,
            deletedAt: null,
        }).lean();

        if (!pet) {
            return error(res, "Không tìm thấy bản ghi thú cưng.", 404);
        }

        const home = await Home.findOne(
            {
                _id: pet.homeId,
                "members.userId": userId,
                deletedAt: null,
            },
            { members: 1 },
        ).lean();

        if (!home) {
            return error(res, "Không tìm thấy thông tin quyền sở hữu thú cưng.", 404);
        }

        const currentMember = home.members.find(
            (member) => member.userId.toString() === userId.toString(),
        );

        req.memberRole = currentMember.role;

        next();
    } catch (err) {
        return next(err);
    }
}

async function authorizeHomeOwner(req, res, next) {
    try {
        if (req.memberRole !== "OWNER") {
            return error(res, "Không có quyền thực hiện hành động này.", 403);
        }

        next();
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    authenticateHomeMember,
    authenticatePetOwner,
    authorizeHomeOwner,
};
