//src/validations/rules.validation.js
const Joi = require("joi");

const objectIdRule = Joi.string().hex().length(24).required().messages({
    "string.empty": "ID không được để trống.",
    "string.hex": "Định dạng ID không hợp lệ (phải là chuỗi hexa).",
    "string.length": "ID phải có đúng 24 ký tự.",
    "any.required": "Vui lòng nhập ID.",
});

const emailRule = Joi.string().email().lowercase().empty("").default(null).messages({
    "string.email": "Định dạng email không hợp lệ.",
    "any.required": "Vui lòng nhập email.",
});

const phoneRule = Joi.string()
    .pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)
    .empty("")
    .default(null)
    .messages({
        "string.pattern.base": "Số điện thoại không hợp lệ.",
        "any.required": "Vui lòng nhập số điện thoại.",
    });

const usernameRule = Joi.string().min(3).max(16).required().messages({
    "string.empty": "Tên đăng nhập không được để trống.",
    "string.min": "Tên đăng nhập phải có ít nhất 3 ký tự.",
    "string.max": "Tên đăng nhập không được vượt quá 16 ký tự.",
    "any.required": "Vui lòng nhập Username.",
});

const passwordRule = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .required()
    .messages({
        "string.empty": "Mật khẩu không được để trống.",
        "string.min": "Mật khẩu phải có ít nhất 8 ký tự.",
        "string.pattern.base":
            "Mật khẩu phải bao gồm ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt.",
        "any.required": "Vui lòng nhập mật khẩu.",
    });

module.exports = {
    objectIdRule,
    emailRule,
    phoneRule,
    usernameRule,
    passwordRule,
};
