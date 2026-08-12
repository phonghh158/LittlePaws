// src/services/food.service.js
const dayjs = require("dayjs");
const Food = require("../models/food.model");
const FoodFlavor = require("../models/food-flavor.model");
const PetCareBrand = require("../models/pet-care-brand.model");

/**
 * CREATE
 * Tạo bản ghi thức ăn cho thú cưng
 * @param { Object } foodData - Dữ liệu bản ghi thức ăn
 * @param { Array } flavorsData - Dữ liệu mảng các mùi vị thức ăn
 * @returns Bản ghi thức ăn vừa tạo + mảng các mùi vị thức ăn
 */
async function createFood(foodData, flavorsData) {
    const { brandId } = foodData;

    const brand = await PetCareBrand.exists({
        _id: brandId,
        deletedAt: null,
    }).lean();

    if (!brand) {
        throw new Error("DataNotFound");
    }

    const food = await Food.create(foodData);

    try {
        let flavors = [];

        if (!flavorsData || flavorsData.length === 0) {
            const flavor = await FoodFlavor.create({
                foodId: food._id,
                name: "",
                description: "",
                imageUrl: foodData.imageUrl,
            });

            flavors.push(flavor);
        } else {
            const flavorsMap = flavorsData.map((flavor) => ({
                foodId: food._id,
                name: flavor.name,
                description: flavor.description,
                imageUrl: flavor.imageUrl,
            }));

            flavors = await FoodFlavor.insertMany(flavorsMap);
        }

        return {
            food: food,
            flavors: flavors,
        };
    } catch (error) {
        console.log("[ERROR]: Có lỗi trong quá trình tạo bản ghi thức ăn.", error.message);
        console.log("[ROLLBACK]: Hủy tạo bản ghi thức ăn và các mùi vị liên quan.");

        try {
            await Food.deleteOne({ _id: food._id });
            await FoodFlavor.deleteMany({ foodId: food._id });
        } catch (rollbackError) {
            console.log("[ROLLBACK ERROR]: Có lỗi với quá trình hủy tạo bản ghi.");
            console.log("[ROLLBACK ERROR]: Vui lòng thực hiện xóa thủ công. ID: ", food._id);

            throw rollbackError;
        }

        throw error;
    }
}

/**
 * GET ALL
 * Lấy danh sách bản ghi thức ăn thú cưng
 * @param { Object } query - query
 * @param { String } userId - ID người dùng hiện tại
 * @returns Danh sách bản ghi thức ăn
 */
async function getAllFoods(query, userId) {
    const { page = 1, limit = 10, sort } = query;
    const { species, brandIds, categories, ofUser } = query;

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

    if (ofUser) {
        filter.createdBy = userId;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sort ? sort : { createdAt: -1 },
        lean: true,
    };

    return await Food.paginate(filter, options);
}

/**
 * GET
 * Lấy bản ghi thức ăn theo ID
 * @param { String } foodId - ID bản ghi thức ăn
 * @returns Thông tin bản ghi thức ăn
 */
async function getFoodById(foodId) {
    const food = await Food.findById(foodId).populate("brandId", "name").lean();

    if (!food) {
        throw new Error("DataNotFound");
    }

    return food;
}

/**
 * GET
 * Lấy bản ghi hương vị thức ăn theo Food ID
 * @param { String } foodId - ID bản ghi thức ăn
 * @returns Thông tin bản ghi hương vị thức ăn
 */
async function getFlavorsByFoodId(foodId) {
    const food = await Food.findOne({ _id: foodId, deletedAt: null }).lean();

    if (!food) {
        const error = new Error("Không tìm thấy dữ liệu về đồ ăn.");
        error.status = 404;
        throw error;
    }

    const flavors = await FoodFlavor.find({ foodId: foodId, deletedAt: null }).lean();

    return {
        food: food,
        flavors: flavors,
    };
}

/**
 * UPDATE
 * Cập nhật bản ghi thức ăn cho thú cưng
 * @param { String } foodId - ID bản ghi thức ăn
 * @param { Object } updatedData - Dữ liệu bản ghi thức ăn
 * @returns Bản ghi thức ăn sau khi cập nhật
 */
async function updateFood(foodId, updatedData) {
    const updatedFood = await Food.findOneAndUpdate(
        { _id: foodId, deletedAt: null },
        updatedData,
        {
            new: true,
            runValidators: true,
        },
    )
        .populate("brandId", "name")
        .lean();

    if (!updatedFood) {
        throw new Error("DataNotFound");
    }

    return updatedFood;
}

/**
 * UPDATE
 * Cập nhật bản ghi hương vị thức ăn cho thú cưng
 * @param { String } flavorId - ID bản ghi hương vị thức ăn
 * @param { Object } updatedData - Dữ liệu bản ghi thức ăn
 */
async function updateFoodFlavor(flavorId, updatedData) {
    const updatedFlavor = await FoodFlavor.findOneAndUpdate(
        { _id: flavorId, deletedAt: null },
        updatedData,
        { new: true },
    );

    if (!updatedFlavor) {
        throw new Error("DataNotFound");
    }

    return updatedFlavor;
}

/**
 * DELETE
 * Xóa bản ghi thức ăn cho thú cưng
 * @param { String } foodId - ID bản ghi thức ăn
 * @returns Bản ghi thức ăn sau khi xóa
 */
async function deleteFood(foodId) {
    const deletedRecord = await Food.findOneAndUpdate(
        { _id: foodId, deletedAt: null },
        { deletedAt: dayjs() },
        { new: true },
    )
        .populate("brandId", "name")
        .lean();

    if (!deletedRecord) {
        throw new Error("DataNotFound");
    }

    try {
        await FoodFlavor.updateMany(
            { foodId: foodId, deletedAt: null },
            { deletedAt: dayjs() },
        );
    } catch (error) {
        console.log("[ERROR]: Có lỗi khi xóa các hương vị của món ăn.", error.message);
        console.log("[ROLLBACK]: Khôi phục lại trạng thái của món ăn.");

        try {
            await Food.findOneAndUpdate({ _id: foodId }, { deletedAt: null });
        } catch (rollbackError) {
            console.log("[ROLLBACK ERROR]: Không thể khôi phục trạng thái món ăn.");
            console.log("[ROLLBACK ERROR]: Vui lòng cập nhật thủ công. ID: ", foodId);
            throw rollbackError;
        }

        throw error;
    }

    return deletedRecord;
}

/**
 * UPDATE
 * Khôi phục bản ghi đã xóa mềm
 * @param { String } foodId - ID bản ghi thức ăn
 * @returns Bản ghi thức ăn sau khi khôi phục
 */
async function restoreFood(foodId) {
    const food = await Food.findOne({ _id: foodId, deletedAt: { $ne: null } }).lean();

    if (!food) {
        throw new Error("DataNotFound");
    }

    const restoredFood = await Food.findOneAndUpdate(
        { _id: foodId },
        { deletedAt: null },
        { new: true },
    )
        .populate("brandId", "name")
        .lean();

    try {
        await FoodFlavor.updateMany(
            { foodId: foodId, deletedAt: { $ne: null } },
            { deletedAt: null },
        );
    } catch (error) {
        console.log("[ERROR]: Có lỗi khi khôi phục các hương vị của món ăn.", error.message);
        console.log("[ROLLBACK]: Hủy khôi phục trạng thái của món ăn.");

        try {
            await Food.findOneAndUpdate({ _id: foodId }, { deletedAt: food.deletedAt });
        } catch (rollbackError) {
            console.log("[ROLLBACK ERROR]: Không thể hoàn tác việc khôi phục món ăn.");
            console.log("[ROLLBACK ERROR]: Vui lòng cập nhật thủ công. ID: ", foodId);
            throw rollbackError;
        }

        throw error;
    }

    return restoredFood;
}

/**
 * DELETE
 * Hard Delete tất cả bản ghi thức ăn
 * Mock Test - Run Seed
 */
async function hardDeleteAll() {
    await FoodFlavor.deleteMany({});
    return await Food.deleteMany({});
}

module.exports = {
    createFood,
    getAllFoods,
    getFoodById,
    getFlavorsByFoodId,
    updateFood,
    updateFoodFlavor,
    deleteFood,
    restoreFood,
    hardDeleteAll,
};
