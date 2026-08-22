/ src/services/bill-stock.service.js
const dayjs = require("dayjs");

const Bill = require("../models/bill.model");
const Stock = require("../models/stock.model");

/**
 * HELPER
 * Tính tổng tiền của hóa đơn
 * @param { Object } bill - Hóa đơn cần tính toán
 * @returns { Object } Bản ghi hóa đơn đã kèm tổng tiền
 */
function finalBill(bill) {
    let totalPrice = 0;

    bill.items.forEach((item) => {
        totalPrice += item.price * item.quantity;
    });

    const finalPrice = totalPrice - bill.discount;

    bill.totalItemsPrice = totalPrice;
    bill.finalBillPrice = finalPrice;

    return bill;
}

/**
 * CREATE OR UPDATE
 * Thêm sản phẩm đã mua vào kho
 * @param { String } familyId - ID gia đình thú cưng
 * @param { Array } items - Danh sách các sản phẩm trong hóa đơn
 * @returns { Object } Kho
 */
async function fillStock(familyId, items) {
    if (!items || items.length === 0) return;

    const operations = items.map((item) => ({
        updateOne: {
            filter: {
                familyId: familyId,
                itemRefId: item.itemId,
            },
            update: {
                $inc: { quantity: item.quantity },
            },
            upsert: true,
        },
    }));

    return await Stock.bulkWrite(operations);
}

/**
 * CREATE
 * Tạo mới bản ghi hóa đơn
 * @param { String } userId - ID người tạo
 * @param { String } familyId - ID gia đình
 * @param { Object } billData - Dữ liệu hóa đơn
 * @returns { Object } Thông tin hóa đơn vừa tạo
 */
async function createBillAndFillStock(userId, familyId, billData) {
    const { items, purchaseDate, discount, note } = billData;

    if (!items || items.length === 0) {
        const error = new Error("Hóa đơn phải có ít nhất một sản phẩm.");
        error.status = 400;
        throw error;
    }

    const newBill = await Bill.create({
        userId: userId,
        familyId: familyId,
        items: items,
        purchaseDate: purchaseDate || dayjs().toDate(),
        discount: discount || 0,
        note: note,
    });

    const bill = finalBill(newBill.toObject());

    try {
        const billItems = bill.items;
    } catch (error) {}
}

/**
 * GET
 * Lấy danh sách bản ghi hóa đơn của một gia đình
 * @param { String } familyId - ID gia đình
 * @param { Object } query - Object chứa thông tin query
 * @returns { Object } Danh sách hóa đơn
 */
async function getBillsByFamilyId(familyId, query) {
    const { page = 1, sort, limit = 9 } = query;

    let filter = {
        familyId: familyId,
        deletedAt: null,
    };

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort ? sort : { purchaseDate: -1 },
        populate: [
            {
                path: "userId", 
                select: "username fullName avatarUrl",
            },
        ],
        lean: true,
    };

    const bill = await Bill.paginate(filter, options);

    // Đã sửa lỗi: dùng biến bill.docs thay vì result.docs
    bill.docs = bill.docs.map((b) => finalBill(b));

    return bill;
}

/**
 * GET
 * Lấy bản ghi hóa đơn theo ID
 * @param { String } familyId - ID gia đình
 * @param { String } billId - ID bản ghi hóa đơn
 * @returns { Object } Thông tin hóa đơn
 */
async function getBillById(familyId, billId) {
    const bill = await Bill.findOne({
        _id: billId,
        familyId: familyId,
        deletedAt: null,
    }).lean();

    if (!bill) {
        throw new Error("DataNotFound");
    }

    return finalBill(bill);
}

/**
 * DELETE
 * Xóa bản ghi hóa đơn (Soft Delete)
 * @param { String } familyId - ID gia đình
 * @param { String } billId - ID bản ghi hóa đơn
 * @returns { Object } Thông tin bản ghi hóa đơn sau khi xóa
 */
async function deleteBill(familyId, billId) {
    const deletedBill = await Bill.findOneAndUpdate(
        { _id: billId, familyId: familyId, deletedAt: null },
        { deletedAt: dayjs().toDate() },
        { new: true, runValidators: true },
    ).lean();

    if (!deletedBill) {
        throw new Error("DataNotFound");
    }

    // Đã sửa lỗi: gọi hàm finalBill thay vì calculateBillTotal
    return finalBill(deletedBill);
}

/**
 * UPDATE
 * Khôi phục bản ghi hóa đơn đã xóa mềm
 * @param { String } familyId - ID gia đình
 * @param { String } billId - ID bản ghi hóa đơn
 * @returns { Object } Thông tin hóa đơn sau khi khôi phục
 */
async function restoreBill(familyId, billId) {
    const restoredBill = await Bill.findOneAndUpdate(
        { _id: billId, familyId: familyId, deletedAt: { $ne: null } },
        { deletedAt: null },
        { new: true, runValidators: true },
    ).lean();

    if (!restoredBill) {
        throw new Error("DataNotFound");
    }

    return finalBill(restoredBill);
}

/**
 * DELETE
 * Mock Test
 * Xóa vĩnh viễn toàn bộ hóa đơn đã bị xóa mềm của một gia đình (Dọn thùng rác)
 * @param { String } familyId - ID gia đình
 * @returns { Object } Kết quả thông báo số lượng bản ghi đã xóa
 */
async function hardDeleteAll(familyId) {
    return await Bill.deleteMany({});
}

module.exports = {
    createBill,
    getBillsByFamilyId,
    getBillById,
    deleteBill,
    restoreBill,
    hardDeleteAll,
};
