// src/utils/response.js
// Hàm trả về khi xử lý thành công
function success(res, data = null, message = "Thành công", statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
    });
}

// Hàm trả về khi có lỗi xảy ra
function error(res, message = "Đã xảy ra lỗi", statusCode = 500, errorDetails = null) {
    const responseBody = {
        success: false,
        message: message,
    };

    if (errorDetails) {
        responseBody.error = errorDetails;
    }

    return res.status(statusCode).json(responseBody);
}

module.exports = {
    success,
    error,
};
