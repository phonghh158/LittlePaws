// src/routes/v1/species.route.js
const express = require("express");
const router = express.Router();

const speciesController = require("../../controllers/species.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const { validate, validateObjectId } = require("../../middlewares/validation.middleware");
const {
    createSpeciesSchema,
    updateSpeciesSchema,
    querySpeciesSchema,
} = require("../../validations/species.validation");

// API create
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createSpeciesSchema),
    speciesController.createSpecies,
);

// API get
router.get("/", authenticate, validate(querySpeciesSchema), speciesController.getAllSpecies);

router.get(
    "/:speciesId",
    authenticate,
    validateObjectId("speciesId"),
    speciesController.getSpecies,
);

// API update
router.patch(
    "/:speciesId",
    authenticate,
    authorize("ADMIN"),
    validate(updateSpeciesSchema),
    speciesController.updateSpecies,
);

// API delete
router.delete(
    "/:speciesId",
    authenticate,
    authorize("ADMIN"),
    validateObjectId("speciesId"),
    speciesController.deleteSpecies,
);

router.delete("/", authenticate, authorize("ADMIN"), speciesController.deleteAllSpecies);

// API restore
router.patch(
    "/restore/:speciesId",
    authenticate,
    authorize("ADMIN"),
    validateObjectId("speciesId"),
    speciesController.restoreSpecies,
);

module.exports = router;
