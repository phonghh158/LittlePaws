// src/middlewares/validation.middleware.js
const Joi = require("joi");
const { error } = require("../utils/response");
const { objectIdRule } = require("../validations/rules.validation");

/**
 * Middleware kiểm tra dữ liệu đầu vào dựa trên Joi Schema
 * @param {Joi.ObjectSchema} schema - Schema cần validate
 */
function validate(schema) {
    return function (req, res, next) {
        // abortEarly: false giúp lấy ra TẤT CẢ các lỗi thay vì dừng lại ở lỗi đầu tiên
        const { error: validationError } = schema.validate(req.body, { abortEarly: false });

        if (validationError) {
            // Lấy thông báo lỗi đầu tiên hoặc nối tất cả lại
            const errorMessage = validationError.details
                .map((detail) => detail.message)
                .join(", ");

            return error(res, errorMessage, 400); // 400 Bad Request
        }

        next();
    };
}

/**
 * Middleware kiểm tra ObjectId linh hoạt (từ params, body, hoặc query)
 * @param {string} fieldName - Tên trường chứa ID (vd: 'id', 'userId', 'productId')
 * @param {string} source - Nơi chứa ID: 'params' (mặc định), 'body', hoặc 'query'
 */
function validateObjectId(fieldName = "id", source = "params") {
    return function (req, res, next) {
        // Lấy giá trị dựa trên vị trí (mặc định lấy từ URL params)
        const value = req[source]?.[fieldName];

        // Gói giá trị vào một schema động để validate
        const dynamicSchema = Joi.object({
            [fieldName]: objectIdRule,
        });

        const { error: validationError } = dynamicSchema.validate({ [fieldName]: value });

        if (validationError) {
            const errorMessage = validationError.details
                .map((detail) => detail.message)
                .join(", ");
            return error(res, errorMessage, 400); // 400 Bad Request
        }

        next();
    };
}

module.exports = {
    validate,
    validateObjectId,
};
