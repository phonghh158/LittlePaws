// src/routes/v1/auth.route.js
const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate, validateObjectId } = require("../../middlewares/validation.middleware");
const {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} = require("../../validations/auth.validation");

// Khu vực API không yêu cầu xác thực
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/rotate-token", validate(refreshTokenSchema), authController.rotateToken);
router.post(
    "/issue-device-id",
    validateObjectId("userId", "body"),
    authController.issueNewDeviceId,
);

// Khu vực API yêu cầu xác thực
router.post("/logout", authenticate, validate(refreshTokenSchema), authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);

module.exports = router;
