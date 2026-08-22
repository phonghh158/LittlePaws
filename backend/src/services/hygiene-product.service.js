// src/services/hygiene-product.service.js
const dayjs = require("dayjs");
const HygieneProduct = require("../models/hygiene-product.model");
const HygieneProductScent = require("../models/hygiene-product-scent.model");
const PetCareBrand = require("../models/pet-care-brand.model");

/**
 * CREATE
 * Tạo bản ghi sản phẩm vệ sinh cho thú cưng
 * @param { Object } productData - Dữ liệu bản ghi sản phẩm vệ sinh
 * @param { Array } scentsData - Dữ liệu mảng các mùi hương
 * @returns Bản ghi sản phẩm vừa tạo + mảng các mùi hương
 */
async function createHygieneProduct(productData, scentsData) {
    const { brandId } = productData;

    const brand = await PetCareBrand.exists({
        _id: brandId,
        deletedAt: null,
    }).lean();

    if (!brand) {
        throw new Error("DataNotFound");
    }

    const product = await HygieneProduct.create(productData);

    try {
        let scents = [];

        if (!scentsData || scentsData.length === 0) {
            const scent = await HygieneProductScent.create({
                hygieneProductId: product._id,
                name: "",
                description: "",
                imageUrl: productData.imageUrl,
            });

            scents.push(scent);
        } else {
            const scentsMap = scentsData.map((scent) => ({
                hygieneProductId: product._id,
                name: scent.name,
                description: scent.description,
                imageUrl: scent.imageUrl,
            }));

            scents = await HygieneProductScent.insertMany(scentsMap);
        }

        return {
            product: product,
            scents: scents,
        };
    } catch (error) {
        console.log(
            "[ERROR]: Có lỗi trong quá trình tạo bản ghi sản phẩm vệ sinh.",
            error.message,
        );
        console.log("[ROLLBACK]: Hủy tạo bản ghi sản phẩm vệ sinh và các mùi hương liên quan.");

        try {
            await HygieneProduct.deleteOne({ _id: product._id });
            await HygieneProductScent.deleteMany({ hygieneProductId: product._id });
        } catch (rollbackError) {
            console.log("[ROLLBACK ERROR]: Có lỗi với quá trình hủy tạo bản ghi.");
            console.log("[ROLLBACK ERROR]: Vui lòng thực hiện xóa thủ công. ID: ", product._id);

            throw rollbackError;
        }

        throw error;
    }
}

/**
 * GET ALL
 * Lấy danh sách bản ghi sản phẩm vệ sinh
 * @param { Object } query - query
 * @returns Danh sách bản ghi sản phẩm vệ sinh
 */
async function getAllHygieneProducts(query) {
    const { page = 1, limit = 10, sort } = query;
    const { species, brandIds, categories } = query;

    const filter = {
        deletedAt: null,
    };

    if (species) {
        const speciesArray = Array.isArray(species) ? species : [species];

        if (speciesArray.length > 0) {
            filter.species = { $in: speciesArray };
        }
    }

    if (brandIds) {
        const brandIdsArray = Array.isArray(brandIds) ? brandIds : [brandIds];

        if (brandIdsArray.length > 0) {
            filter.brandId = { $in: brandIdsArray };
        }
    }

    if (categories) {
        const categoriesArray = Array.isArray(categories) ? categories : [categories];

        if (categoriesArray.length > 0) {
            filter.category = { $in: categoriesArray };
        }
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort ? sort : { createdAt: -1 },
        lean: true,
    };

    return await HygieneProduct.paginate(filter, options);
}

/**
 * GET
 * Lấy bản ghi sản phẩm vệ sinh theo ID
 * @param { String } productId - ID bản ghi sản phẩm vệ sinh
 * @returns Thông tin bản ghi sản phẩm vệ sinh
 */
async function getHygieneProductById(productId) {
    const product = await HygieneProduct.findById(productId).populate("brandId", "name").lean();

    if (!product) {
        throw new Error("DataNotFound");
    }

    return product;
}

/**
 * GET
 * Lấy bản ghi mùi hương theo Product ID
 * @param { String } productId - ID bản ghi sản phẩm vệ sinh
 * @returns Thông tin bản ghi mùi hương
 */
async function getScentsByProductId(productId) {
    const product = await HygieneProduct.findOne({ _id: productId, deletedAt: null }).lean();

    if (!product) {
        const error = new Error("Không tìm thấy dữ liệu về sản phẩm vệ sinh.");
        error.status = 404;
        throw error;
    }

    const scents = await HygieneProductScent.find({
        hygieneProductId: productId,
        deletedAt: null,
    }).lean();

    return {
        product: product,
        scents: scents,
    };
}

/**
 * UPDATE
 * Cập nhật bản ghi sản phẩm vệ sinh
 * @param { String } productId - ID bản ghi sản phẩm
 * @param { Object } updatedData - Dữ liệu bản ghi sản phẩm
 * @returns Bản ghi sản phẩm sau khi cập nhật
 */
async function updateHygieneProduct(productId, updatedData) {
    const updatedProduct = await HygieneProduct.findOneAndUpdate(
        { _id: productId, deletedAt: null },
        updatedData,
        {
            new: true,
            runValidators: true,
        },
    )
        .populate("brandId", "name")
        .lean();

    if (!updatedProduct) {
        throw new Error("DataNotFound");
    }

    return updatedProduct;
}

/**
 * UPDATE
 * Cập nhật bản ghi mùi hương
 * @param { String } scentId - ID bản ghi mùi hương
 * @param { Object } updatedData - Dữ liệu bản ghi mùi hương
 */
async function updateHygieneProductScent(scentId, updatedData) {
    const updatedScent = await HygieneProductScent.findOneAndUpdate(
        { _id: scentId, deletedAt: null },
        updatedData,
        { new: true },
    );

    if (!updatedScent) {
        throw new Error("DataNotFound");
    }

    return updatedScent;
}

/**
 * DELETE
 * Xóa bản ghi sản phẩm vệ sinh
 * @param { String } productId - ID bản ghi sản phẩm
 * @returns Bản ghi sản phẩm sau khi xóa
 */
async function deleteHygieneProduct(productId) {
    const deletedRecord = await HygieneProduct.findOneAndUpdate(
        { _id: productId, deletedAt: null },
        { deletedAt: dayjs() },
        { new: true },
    )
        .populate("brandId", "name")
        .lean();

    if (!deletedRecord) {
        throw new Error("DataNotFound");
    }

    try {
        await HygieneProductScent.updateMany(
            { hygieneProductId: productId, deletedAt: null },
            { deletedAt: dayjs() },
        );
    } catch (error) {
        console.log("[ERROR]: Có lỗi khi xóa các mùi hương của sản phẩm.", error.message);
        console.log("[ROLLBACK]: Khôi phục lại trạng thái của sản phẩm.");

        try {
            await HygieneProduct.findOneAndUpdate({ _id: productId }, { deletedAt: null });
        } catch (rollbackError) {
            console.log("[ROLLBACK ERROR]: Không thể khôi phục trạng thái sản phẩm.");
            console.log("[ROLLBACK ERROR]: Vui lòng cập nhật thủ công. ID: ", productId);
            throw rollbackError;
        }

        throw error;
    }

    return deletedRecord;
}

/**
 * UPDATE
 * Khôi phục bản ghi đã xóa mềm
 * @param { String } productId - ID bản ghi sản phẩm
 * @returns Bản ghi sản phẩm sau khi khôi phục
 */
async function restoreHygieneProduct(productId) {
    const product = await HygieneProduct.findOne({
        _id: productId,
        deletedAt: { $ne: null },
    }).lean();

    if (!product) {
        throw new Error("DataNotFound");
    }

    const restoredProduct = await HygieneProduct.findOneAndUpdate(
        { _id: productId },
        { deletedAt: null },
        { new: true },
    )
        .populate("brandId", "name")
        .lean();

    try {
        await HygieneProductScent.updateMany(
            { hygieneProductId: productId, deletedAt: { $ne: null } },
            { deletedAt: null },
        );
    } catch (error) {
        console.log("[ERROR]: Có lỗi khi khôi phục các mùi hương của sản phẩm.", error.message);
        console.log("[ROLLBACK]: Hủy khôi phục trạng thái của sản phẩm.");

        try {
            await HygieneProduct.findOneAndUpdate(
                { _id: productId },
                { deletedAt: product.deletedAt },
            );
        } catch (rollbackError) {
            console.log("[ROLLBACK ERROR]: Không thể hoàn tác việc khôi phục sản phẩm.");
            console.log("[ROLLBACK ERROR]: Vui lòng cập nhật thủ công. ID: ", productId);
            throw rollbackError;
        }

        throw error;
    }

    return restoredProduct;
}

/**
 * DELETE
 * Hard Delete tất cả bản ghi
 * Mock Test - Run Seed
 */
async function hardDeleteAll() {
    await HygieneProductScent.deleteMany({});
    return await HygieneProduct.deleteMany({});
}

module.exports = {
    createHygieneProduct,
    getAllHygieneProducts,
    getHygieneProductById,
    getScentsByProductId,
    updateHygieneProduct,
    updateHygieneProductScent,
    deleteHygieneProduct,
    restoreHygieneProduct,
    hardDeleteAll,
};
