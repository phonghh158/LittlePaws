const Joi = require("joi");

const createSpeciesSchema = Joi.object({
    name: Joi.string().trim().min(2).max(32).required().messages({
        "string.empty": "Tên giống loài không được để trống.",
        "string.min": "Tên giống loài phải có ít nhất 2 ký tự.",
        "string.max": "Tên giống loài không được vượt quá 32 ký tự.",
        "any.required": "Vui lòng nhập tên giống loài.",
    }),
    description: Joi.string().trim().max(2048).messages({
        "string.max": "Mô tả không được vượt quá 2048 ký tự.",
    }),
});

const updateSpeciesSchema = Joi.object({
    name: Joi.string().trim().min(2).max(32).messages({
        "string.min": "Tên giống loài phải có ít nhất 2 ký tự.",
        "string.max": "Tên giống loài không được vượt quá 32 ký tự.",
    }),
    description: Joi.string().trim().max(2048).messages({
        "string.max": "Mô tả không được vượt quá 1024 ký tự.",
    }),
});

const querySpeciesSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    keyword: Joi.string().trim().allow("").optional(),
    sort: Joi.string().trim().optional(),
    isDelete: Joi.string().valid("true", "false", "").optional(),
});

module.exports = {
    createSpeciesSchema,
    updateSpeciesSchema,
    querySpeciesSchema,
};
