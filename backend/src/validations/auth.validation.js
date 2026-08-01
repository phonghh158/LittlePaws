// src/validations/auth.validation.js
const Joi = require("joi");
const {
    objectIdRule,
    emailRule,
    phoneRule,
    usernameRule,
    passwordRule,
} = require("./rules.validation");
const { generateAccessToken } = require("../utils/jwt");

const registerSchema = Joi.object({
    username: usernameRule,
    email: emailRule.optional(),
    phoneNumber: phoneRule.optional(),
    fullName: Joi.string().min(2).max(50).required().messages({
        "string.empty": "Họ và tên không được để trống.",
        "string.min": "Họ và tên quá ngắn.",
        "any.required": "Vui lòng nhập họ và tên.",
    }),
    gender: Joi.string().valid("male", "female", "unknown").required().messages({
        "any.only": "Giới tính không hợp lệ.",
        "any.required": "Vui lòng nhập giới tính.",
    }),
    avatarUrl: Joi.string().uri().optional(),
    role: Joi.string().valid("USER", "ADMIN").required().messages({
        "any.only": "Role không hợp lệ.",
    }),
    status: Joi.string().valid("ACTIVE", "BANNED").required().messages({
        "any.only": "Trạng thái không hợp lệ.",
    }),
    password: passwordRule,
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Mật khẩu nhập lại không khớp.",
        "any.required": "Vui lòng xác nhận mật khẩu.",
    }),
});

const loginSchema = Joi.object({
    identity: Joi.string().required().messages({
        "string.empty": "Tài khoản không được để trống.",
        "any.required": "Vui lòng nhập username, email hoặc số điện thoại.",
    }),
    password: Joi.string().required().messages({
        "string.empty": "Mật khẩu không được để trống.",
        "any.required": "Vui lòng nhập mật khẩu.",
    }),
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        "string.empty": "Refresh token không được để trống.",
        "any.required": "Vui lòng cung cấp refresh token.",
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
};
