// src/validations/user.validation.js
const Joi = require("joi");
const { emailRule, phoneRule, usernameRule, passwordRule } = require("./rules.validation");

const getProfileByUsernameSchema = Joi.object({
    username: usernameRule,
});

const updateUsernameSchema = Joi.object({
    currentPassword: passwordRule,
    newUsername: usernameRule,
});

const requestUpdateEmailSchema = Joi.object({
    currentPassword: passwordRule,
    newEmail: emailRule,
});

const requestUpdatePhoneNumberSchema = Joi.object({
    currentPassword: passwordRule,
    newPhoneNumber: phoneRule,
});

const resetPasswordSchema = Joi.object({
    identifier: Joi.string().required().messages({
        "string.empty": "Vui lòng nhập email hoặc số điện thoại.",
        "any.required": "Vui lòng nhập thông tin để đặt lại mật khẩu.",
    }),
});

const updatePasswordSchema = Joi.object({
    currentPassword: passwordRule,
    newPassword: passwordRule,
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
        "any.only": "Mật khẩu xác nhận không khớp với mật khẩu mới.",
        "any.required": "Vui lòng nhập mật khẩu xác nhận.",
        "string.empty": "Mật khẩu xác nhận không được để trống.",
    }),
});

const updateEmailSchema = Joi.object({
    newEmail: emailRule,
});

const updatePhoneNumberSchema = Joi.object({
    newPhoneNumber: phoneRule,
});

const updateProfileSchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(50).required().messages({
        "string.empty": "Họ và tên không được để trống.",
        "string.min": "Họ và tên phải có ít nhất 3 ký tự.",
        "string.max": "Họ và tên không được vượt quá 50 ký tự.",
        "any.required": "Vui lòng nhập họ và tên.",
    }),
    gender: Joi.string().valid("male", "female", "unknown").required().messages({
        "any.only": "Giới tính không hợp lệ.",
        "any.required": "Vui lòng chọn giới tính.",
        "string.empty": "Giới tính không được để trống.",
    }),
});

module.exports = {
    getProfileByUsernameSchema,
    updateUsernameSchema,
    requestUpdateEmailSchema,
    requestUpdatePhoneNumberSchema,
    resetPasswordSchema,
    updatePasswordSchema,
    updateEmailSchema,
    updatePhoneNumberSchema,
    updateProfileSchema,
};
