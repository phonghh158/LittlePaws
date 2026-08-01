// src/controllers/pet.controller.js
const petService = require("../services/pet.service");
const { success } = require("../utils/response");

/**
 * CREATE: Tạo thú cưng
 */
async function createPet(req, res, next) {
    try {
        const userId = req.user.id;
        const { petData, relationship } = req.body;

        const newPet = await petService.createPet(req.user.id, petData, relationship);
        return success(res, "Tạo thú cưng thành công.", newPet, 201);
    } catch (error) {
        next(error);
    }
}

/**
 * GET: Lấy danh sách thú cưng
 */
async function getAllPets(req, res, next) {
    try {
        const { search, isDeleted } = req.query;
        const role = req.user?.role;

        const filter = {};

        // Phân quyền và xử lý bộ lọc deletedAt
        if (role === "admin") {
            if (isDeleted === "true") {
                filter.deletedAt = { $ne: null };
            } else if (isDeleted === "false") {
                filter.deletedAt = null;
            }
        } else filter.deletedAt = null;

        let petList;

        // Gọi hàm service tương ứng
        if (search) {
            petList = await petService.searchSpeciesByName(search, filter);
        } else {
            petList = await petService.getAllPets(filter);
        }

        return success(res, "Lấy danh sách thú cưng thành công.", petList, 200);
    } catch (error) {
        next(error);
    }
}

/**
 * GET: Lấy thú cưng theo id
 */
async function getPetById(req, res, next) {
    try {
        const pet = await petService.getPetById(req.params.id);
        return success(res, "Lấy thú cưng thành công.", pet, 200);
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH: Cập nhật thông tin thú cưng
 */
async function updatePet(req, res, next) {
    try {
        const petId = req.params.id;
        const updateData = req.body;

        const updatedPet = await petService.updatePet(petId, updateData);
        return success(res, "Cập nhật thú cưng thành công.", updatedPet, 200);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE: Xóa thú cưng
 */
async function deletePet(req, res, next) {
    try {
        const petId = req.params.id;
        const deletedPet = await petService.deletePet(petId, req.body.reason);
        return success(res, "Xóa thú cưng thành công.", deletedPet, 200);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE: Xóa toàn bộ thú cưng
 */
async function deleteAllPets(req, res, next) {
    try {
        const deletedPets = await petService.deleteAllPets();
        return success(res, "Xóa toàn bộ thú cưng thành công.", deletedPets, 200);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPet,
    getAllPets,
    getPetById,
    updatePet,
    deletePet,
    deleteAllPets,
};
