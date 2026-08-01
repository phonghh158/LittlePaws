// src/controllers/species.controller.js
const speciesService = require("../services/species.service");
const { success } = require("../utils/response");

/**
 * POST
 * Tạo mới loài thú cưng (Just Admin)
 */
async function createSpecies(req, res, next) {
    try {
        const data = req.body;
        const newSpecies = await speciesService.createSpecies(data);
        return success(res, newSpecies, "Tạo loài thú cưng thành công", 201);
    } catch (error) {
        next(error);
    }
}

/**
 * GET
 * Lấy danh sách loài thú cưng
 */
async function getAllSpecies(req, res, next) {
    try {
        const query = req.query;
        const role = req.user?.role || "USER";

        let isDelete = "false";

        if (role === "ADMIN") isDelete = query.isDelete;

        const result = await speciesService.getAllSpecies(query, isDelete);
        return success(res, result, "Lấy danh sách loài thú cưng thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * GET
 * Lấy một loài bằng id
 */
async function getSpeciesById(req, res, next) {
    try {
        const { id } = req.params;
        const role = req.user?.role || "USER";

        const isUser = role === "USER";

        const species = await speciesService.getSpeciesById(id, isUser);

        return success(res, species, "Lấy thông tin loài thú cưng thành công.");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Cập nhật thông tin loài (Just Admin)
 */
async function updateSpecies(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedSpecies = await speciesService.updateSpecies(id, updateData);

        return success(res, updatedSpecies, "Cập nhật loài thú cưng thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE
 * Xóa mềm loài thú cưng (Just Admin)
 */
async function deleteSpecies(req, res, next) {
    try {
        await speciesService.deleteSpecies(req.params.id);
        return success(res, null, "Xóa loài thú cưng thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH
 * Khôi phục loài thú cưng đã xóa mềm (Just Admin)
 */
async function restoreSpecies(req, res, next) {
    try {
        await speciesService.restoreSpecies(req.params.id);
        return success(res, null, "Khôi phục loài thú cưng thành công");
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE
 * Xóa cứng toàn bộ dữ liệu loài (Just Admin)
 */
async function deleteAllSpecies(req, res, next) {
    try {
        await speciesService.deleteAllSpecies();
        return success(res, null, "Đã xóa toàn bộ dữ liệu loài thú cưng");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createSpecies,
    getAllSpecies,
    getSpeciesById,
    updateSpecies,
    deleteSpecies,
    restoreSpecies,
    deleteAllSpecies,
};
