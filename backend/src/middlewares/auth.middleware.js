// src/middlewares/auth.middleware.js
const { verifyAccessToken } = require("../utils/jwt");
const { error } = require("../utils/response");

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return error(res, "Không tìm thấy token xác thực hoặc sai định dạng", 401);
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyAccessToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        return next(err);
    }
}

function authorize(...roles) {
    return function (req, res, next) {
        if (!req.user || !req.user.role) {
            return error(res, "Không thể xác định quyền truy cập của người dùng", 403);
        }

        if (!roles.includes(req.user.role)) {
            return error(res, "Bạn không có quyền thực hiện hành động này", 403);
        }

        next();
    };
}

module.exports = {
    authenticate,
    authorize,
};
