// src/routes/v1/user.route.js
const express = require("express");
const userController = require("../../controllers/user.controller");
const userValidation = require("../../validations/user.validation");
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");

const router = express.Router();

// Quản lý hồ sơ cá nhân
router.get("/", authenticate, userController.getProfile);

router.patch(
    "/update",
    authenticate,
    validate(userValidation.updateProfileSchema),
    userController.updateProfile,
);

// Quản lý ảnh đại diện
router.patch(
    "/avatar",
    authenticate,
    // Middleware upload ảnh sẽ được thêm vào đây, ví dụ: upload.single("avatar")
    userController.updateAvatar,
);

router.delete("/avatar", authenticate, userController.deleteAvatar);

// Quản lý thông tin định danh (Username)
router.patch(
    "/username/update",
    authenticate,
    validate(userValidation.updateUsernameSchema),
    userController.updateUsername,
);

// Quản lý cập nhật Email
router.post(
    "/email/request",
    authenticate,
    validate(userValidation.requestUpdateEmailSchema),
    userController.requestUpdateEmail,
);

router.patch(
    "/email/update",
    authenticate,
    validate(userValidation.updateEmailSchema),
    userController.updateEmail,
);

// Quản lý cập nhật số điện thoại
router.post(
    "/phone-number/request",
    authenticate,
    validate(userValidation.requestUpdatePhoneNumberSchema),
    userController.requestUpdatePhoneNumber,
);

router.patch(
    "/phone-number/update",
    authenticate,
    validate(userValidation.updatePhoneNumberSchema),
    userController.updatePhoneNumber,
);

// Quản lý mật khẩu
router.post(
    "/password/reset",
    validate(userValidation.resetPasswordSchema),
    userController.resetPassword,
);

router.patch(
    "/password/update",
    authenticate,
    validate(userValidation.updatePasswordSchema),
    userController.updatePassword,
);

// Quản lý trạng thái tài khoản
router.delete("/account/delete", authenticate, userController.deleteAccountByUser);

router.patch("/account/restore", authenticate, userController.restoreAccountByUser);

// Lấy thông tin người dùng qua Username (Route động đặt cuối cùng để tránh xung đột)
router.get("/:username", userController.getProfileByUsername);

module.exports = router;
