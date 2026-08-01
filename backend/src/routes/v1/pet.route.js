// src/routes/v1/pet.route.js
const express = require("express");
const router = express.Router();

const petController = require("../../controllers/pet.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const { validate, validateObjectId } = require("../../middlewares/validation.middleware");
const { createPetSchema, updatePetSchema } = require("../../validations/pet.validation");

// API
/**
 * Tạo bản ghi thú cưng
 * Authenticate
 */
router.post("/", authenticate, validate(createPetSchema), petController.createPet);

/**
 * Lấy danh sách thú cưng
 * Authenticate, Just Admin
 */
router.get("/", authenticate, authorize("ADMIN"), petController.getAllPets);

/**
 * Cập nhật thông tin thú cưng
 * Authenticate, Just User
 */
router.put(
    "/:petId",
    authenticate,
    authorize("ADMIN"),
    validate(updatePetSchema),
    petController.updatePet,
);
router.delete(
    "/:petId",
    authenticate,
    authorize("ADMIN"),
    validateObjectId("petId", "params"),
    petController.deletePet,
);

module.exports = router;
