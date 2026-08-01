// src/utils/pagination.js
/**
 * Hàm phân trang dùng chung cho mọi Mongoose Model
 * @param { Object } model - Mongoose Model
 * @param { Object } filterQuery - Điều kiện lọc
 * @param { Object } options - Tham số từ req.query (chứa page, limit, sort, select...)
 * @returns { Object } - JSON chứa items và meta data
 */
async function paginate(model, filterQuery = {}, options = {}) {
    // Tính toán phân trang
    const page = Math.max(parseInt(options.page, 10) || 1, 1);
    const limit = Math.max(parseInt(options.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    // Build truy vấn
    let query = model.find(filterQuery).lean();

    // Hỗ trợ thêm các tuỳ chọn nâng cao nếu service cần
    if (options.sort) query = query.sort(options.sort);
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);

    // Thêm skip và limit
    query = query.skip(skip).limit(limit);

    // Thực thi song song
    const [totalRecords, items] = await Promise.all([
        model.countDocuments(filterQuery),
        query.exec(), // Thực thi query đã build ở trên
    ]);

    // Đóng gói kết quả
    const totalPages = Math.ceil(totalRecords / limit);

    return {
        items,
        meta: {
            totalRecords,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

module.exports = { paginate };
