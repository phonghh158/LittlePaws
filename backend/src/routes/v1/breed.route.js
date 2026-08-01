// src/routes/v1/breed.route.js
const express = require("express");
const router = express.Router();

const breedController = require("../../controllers/breed.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const { validate, validateObjectId } = require("../../middlewares/validation.middleware");
const { createBreedSchema, updateBreedSchema } = require("../../validations/breed.validation");

// API
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createBreedSchema),
    breedController.createBreed,
);
router.get("/", authenticate, authorize("ADMIN"), breedController.getAllBreeds);
router.patch(
    "/:breedId",
    authenticate,
    authorize("ADMIN"),
    validate(updateBreedSchema),
    breedController.updateBreed,
);

router.delete(
    "/:breedId",
    authenticate,
    authorize("ADMIN"),
    validateObjectId("breedId", "params"),
    breedController.deleteBreed,
);

router.delete("/", authenticate, authorize("ADMIN"), breedController.deleteAllBreeds);

module.exports = router;
