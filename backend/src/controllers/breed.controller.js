// src/controllers/breed.controller.js
const breedService = require("../services/breed.service");
const { success } = require("../utils/response");

/**
 * POST
 * Tạo mới bản ghi giống thú cưng
 */
async function createBreed(req, res, next) {
    try {
        const newBreed = await breedService.createBreed(req.body);
        return success(res, "Tạo giống thú cưng thành công.", newBreed, 201);
    } catch (error) {
        next(error);
    }
}

/**
 * GET: Lấy toàn bộ dữ liệu (có filter và phân quyền)
 */
async function getAllBreeds(req, res, next) {
    try {
        const query = req.query;
        const role = req.user?.role || "USER";

        let isDelete = "false";

        if (role === "ADMIN") isDelete = query.isDelete;

        const breedList = await breedService.getAllBreeds(query, isDelete);

        return success(res, breedList, "Lấy danh sách giống thú cưng thành công.", 201);
    } catch (error) {
        next(error);
    }
}

/**
 * GET
 * Lấy bản ghi giống thú cưng bằng id
 */
async function getBreedById(req, res, next) {
    try {
        const { id } = req.params;
        const role = req.user?.role || "USER";

        const isUser = role === "USER";

        const breed = await breedService.getBreedById(id, isUser);

        return success(res, breed, "Lấy thông tin giống thú cưng thành công.");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Cập nhật giống thú cưng
 */
async function updateBreed(req, res, next) {
    try {
        const { id } = req.params;

        const updatedBreed = await breedService.updateBreed(id, req.body);
        return success(res, updatedBreed, "Cập nhật giống thú cưng thành công.");
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE
 * Xóa bản ghi giống thú cưng
 */
async function deleteBreed(req, res, next) {
    try {
        await breedService.deleteBreed(req.params.id);
        return success(res, null, "Xóa giống thú cưng thành công.");
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE
 * Xóa toàn bộ dữ liệu
 */
async function deleteAllBreeds(req, res, next) {
    try {
        const deletedBreed = await breedService.deleteAllBreeds();
        return success(res, null, "Xóa toàn bộ giống thú cưng thành công.");
    } catch (error) {
        next(error);
    }
}

/**
 * Patch
 * Khôi phục bản ghi giống thú cưng
 */
async function restoreBreed(req, res, next) {
    try {
        await breedService.restoreBreed(req.params.id);
        return success(res, null, "Khôi phục bản ghi giống thú cưng.");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createBreed,
    getAllBreeds,
    getBreedById,
    updateBreed,
    deleteBreed,
    deleteAllBreeds,
    restoreBreed,
};
