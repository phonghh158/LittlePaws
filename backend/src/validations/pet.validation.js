// src/validations/pet.validation.js
const Joi = require("joi");

const createPetSchema = Joi.object({
    petData: Joi.object({
        name: Joi.string().trim().min(1).max(55).required().messages({
            "string.empty": "Tên thú cưng không được để trống.",
            "string.min": "Tên thú cưng phải có ít nhất 1 ký tự.",
            "string.max": "Tên thú cưng không được vượt quá 55 ký tự.",
            "any.required": "Vui lòng nhập tên thú cưng.",
        }),
        nickname: Joi.string().trim().max(55).allow("").messages({
            "string.max": "Biệt danh không được vượt quá 55 ký tự.",
        }),
        breedId: Joi.string().required().messages({
            "string.empty": "Mã giống loài (breedId) không được để trống.",
            "any.required": "Vui lòng chọn giống loài cho thú cưng.",
        }),
        gender: Joi.string().valid("male", "female", "unknown").messages({
            "any.only": "Giới tính chỉ hợp lệ khi là 'male', 'female', hoặc 'unknown'.",
        }),
        dob: Joi.date().iso().messages({
            "date.format": "Ngày sinh không đúng định dạng chuẩn ISO.",
        }),
        adoptionDate: Joi.date().iso().messages({
            "date.format": "Ngày nhận nuôi không đúng định dạng chuẩn ISO.",
        }),
        avatarUrl: Joi.string().uri().allow("").messages({
            "string.base": "Đường dẫn ảnh đại diện phải là chuỗi.",
        }),
        bloodType: Joi.string().trim().allow("").messages({
            "string.base": "Nhóm máu phải là chuỗi.",
        }),
    })
        .required()
        .messages({
            "any.required": "Vui lòng cung cấp đầy đủ thông tin thú cưng (petData).",
        }),
    relationship: Joi.string().required().messages({
        "string.empty": "Mối quan hệ với thú cưng không được để trống.",
        "any.required": "Vui lòng nhập mối quan hệ giữa người nuôi và thú cưng.",
    }),
});

const updatePetSchema = Joi.object({
    name: Joi.string().trim().min(1).max(55).messages({
        "string.empty": "Tên thú cưng không được để trống.",
        "string.min": "Tên thú cưng phải có ít nhất 1 ký tự.",
        "string.max": "Tên thú cưng không được vượt quá 55 ký tự.",
    }),
    nickname: Joi.string().trim().max(55).allow("").messages({
        "string.max": "Biệt danh không được vượt quá 55 ký tự.",
    }),
    breedId: Joi.string().messages({
        "string.empty": "Mã giống loài (breedId) không được để trống.",
    }),
    gender: Joi.string().valid("male", "female", "unknown").messages({
        "any.only": "Giới tính chỉ hợp lệ khi là 'male', 'female', hoặc 'unknown'.",
    }),
    dob: Joi.date().iso().messages({
        "date.format": "Ngày sinh không đúng định dạng chuẩn ISO.",
    }),
    adoptionDate: Joi.date().iso().messages({
        "date.format": "Ngày nhận nuôi không đúng định dạng chuẩn ISO.",
    }),
    avatarUrl: Joi.string().uri().allow("").messages({
        "string.base": "Đường dẫn ảnh đại diện phải là chuỗi.",
    }),
    bloodType: Joi.string().trim().allow("").messages({
        "string.base": "Nhóm máu phải là chuỗi.",
    }),
    status: Joi.string().valid("alive", "lost", "gone", "other").messages({
        "any.only": "Trạng thái chỉ hợp lệ khi là 'alive', 'lost', 'gone', hoặc 'other'.",
    }),
});

const deletePetSchema = Joi.object({
    reason: Joi.string().valid("alive", "lost", "gone", "other").required().messages({
        "any.only": "Lý do xóa chỉ hợp lệ khi là 'alive', 'lost', 'gone', hoặc 'other'.",
        "string.empty": "Lý do xóa không được để trống.",
        "any.required": "Vui lòng cung cấp lý do xóa thú cưng.",
    }),
});

module.exports = {
    createPetSchema,
    updatePetSchema,
    deletePetSchema,
};
