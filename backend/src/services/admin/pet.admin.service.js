// src/services/pet.admin.service.js
// Service for admin
const dayjs = require("dayjs");

const Pet = require("../models/pet.model");
const PetOwner = require("../models/pet-owner.model");

/**
 * GET
 * Lấy danh sách toàn bộ bản ghi thú cưng trong hệ thống dành cho Admin
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách thú cưng
 */
async function getAllPets(query) {
    const { keyword = "", status, isDeleted, page = 1, sort } = query;
    const limit = 10; // Admin thường cần xem danh sách dài hơn

    let filter = {};

    // Tìm kiếm theo tên
    if (keyword) {
        filter.name = { $regex: keyword, $options: "i" };
    }

    // Lọc theo trạng thái
    if (status) {
        filter.status = status;
    }

    // Lọc theo trạng thái xóa mềm
    if (isDeleted === "true") {
        filter.deletedAt = { $ne: null };
    } else if (isDeleted === "false") {
        filter.deletedAt = null;
    }

    const options = {
        page: parseInt(page, 10),
        limit: limit,
        sort: sort ? sort : { createdAt: -1 },
        populate: [
            {
                path: "breedId",
                select: "name",
                populate: { path: "speciesId", select: "name" },
            },
        ],
    };

    return await Pet.paginate(filter, options);
}

/**
 * GET
 * Lấy thông tin chi tiết bản ghi thú cưng theo ID dành cho Admin
 * Không cần kiểm tra quyền sở hữu, trả về kèm danh sách chủ sở hữu
 * @param { String } petId - ID bản ghi thú cưng
 * @returns Thông tin chi tiết thú cưng
 */
async function getPetById(petId) {
    const pet = await Pet.findById(petId)
        .populate({
            path: "breedId",
            select: "name",
            populate: {
                path: "speciesId",
                select: "name",
            },
        })
        .lean();

    if (!pet) {
        const error = new Error("Không tìm thấy thú cưng.");
        error.status = 404;
        throw error;
    }

    // Admin cần xem được ai đang là chủ của bé pet này
    const owners = await PetOwner.find({ petId: petId })
        .populate("userId", "username fullName email avatarUrl")
        .lean();

    const speciesName = pet.breedId?.speciesId?.name || null;
    const breedName = pet.breedId?.name || null;

    delete pet.breedId;

    return {
        pet: pet,
        species: speciesName,
        breed: breedName,
        owners: owners,
    };
}

/**
 * UPDATE
 * Cập nhật thông tin bản ghi thú cưng (Admin force update)
 * @param { String } petId - ID bản ghi thú cưng
 * @param { Object } updateData - Dữ liệu cập nhật
 * @returns Thông tin bản ghi thú cưng sau khi cập nhật
 */
async function updatePet(petId, updateData) {
    const updatedPet = await Pet.findByIdAndUpdate(petId, updateData, {
        new: true,
        runValidators: true,
    })
        .populate({
            path: "breedId",
            select: "name",
            populate: {
                path: "speciesId",
                select: "name",
            },
        })
        .lean();

    if (!updatedPet) {
        const error = new Error("Không tìm thấy thông tin thú cưng.");
        error.status = 404;
        throw error;
    }

    const speciesName = updatedPet.breedId?.speciesId?.name || null;
    const breedName = updatedPet.breedId?.name || null;

    delete updatedPet.breedId;

    return {
        pet: updatedPet,
        species: speciesName,
        breed: breedName,
    };
}

/**
 * DELETE
 * Xóa mềm bản ghi thú cưng (Admin force delete)
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } reason - Lý do xóa từ Admin
 * @returns Thông tin bản ghi thú cưng sau khi xóa
 */
async function deletePet(petId, reason) {
    const deletedPet = await Pet.findOneAndUpdate(
        { _id: petId, deletedAt: null },
        { deletedAt: dayjs().toDate(), status: reason || "Bị xóa bởi hệ thống" },
        { new: true, runValidators: true },
    ).lean();

    if (!deletedPet) {
        const error = new Error("Không tìm thấy thông tin thú cưng hoặc thú cưng đã bị xóa.");
        error.status = 404;
        throw error;
    }

    try {
        await PetOwner.updateMany(
            { petId: petId, deletedAt: null },
            { deletedAt: dayjs().toDate() },
        );
    } catch (error) {
        console.log(
            "[ERROR]: Có lỗi trong quá trình xóa bản ghi chủ sở hữu thú cưng bởi Admin.",
        );
        console.log("[ROLLBACK]: Khôi phục bản ghi thú cưng.");
        try {
            await Pet.updateOne({ _id: petId }, { deletedAt: null, status: "alive" });
        } catch (rollbackError) {
            console.log("[ERROR]: Có lỗi trong quá trình rollback bản ghi thú cưng.");
            console.log("[ERROR]: Thông tin lỗi", rollbackError);
            console.log(
                "[ROLLBACK]: Vui lòng cập nhật thủ công để tránh gây gián đoạn hệ thống.",
            );
            console.log("[ROLLBACK]: Id bản ghi thú cưng: ", petId);
        }

        throw error;
    }

    return deletedPet;
}

/**
 * UPDATE
 * Khôi phục thú cưng đã bị xóa mềm (Admin force restore)
 * @param { String } petId - ID thú cưng
 * @returns Thông tin thú cưng sau khi khôi phục
 */
async function restorePet(petId) {
    const restoredPet = await Pet.findOneAndUpdate(
        { _id: petId, deletedAt: { $ne: null } },
        { deletedAt: null, status: "alive" },
        {
            new: true,
            runValidators: true,
        },
    ).lean();

    if (!restoredPet) {
        const error = new Error("Không tìm thấy thông tin thú cưng hoặc thú cưng chưa bị xóa.");
        error.status = 404;
        throw error;
    }

    try {
        await PetOwner.updateMany(
            { petId: petId, deletedAt: { $ne: null } },
            { deletedAt: null },
        );
    } catch (error) {
        console.log(
            "[ERROR]: Có lỗi trong quá trình khôi phục bản ghi chủ sở hữu thú cưng bởi Admin.",
        );
        console.log(
            "[ROLLBACK]: Hủy bỏ khôi phục, đưa bản ghi thú cưng về lại trạng thái xóa mềm.",
        );

        try {
            await Pet.updateOne(
                { _id: petId },
                { deletedAt: dayjs().toDate(), status: "deleted" },
            );
        } catch (rollbackError) {
            console.log("[ERROR]: Có lỗi trong quá trình rollback bản ghi thú cưng.");
            console.log("[ERROR]: Thông tin lỗi", rollbackError);
            console.log(
                "[ROLLBACK]: Vui lòng cập nhật thủ công để tránh gây gián đoạn hệ thống.",
            );
            console.log("[ROLLBACK]: Id bản ghi thú cưng: ", petId);
        }

        throw error;
    }

    return restoredPet;
}

/**
 * DELETE
 * Xóa vĩnh viễn (Hard Delete) bản ghi thú cưng và các bản ghi liên quan
 * Dành riêng cho Admin dọn rác hệ thống
 * @param { String } petId - ID bản ghi thú cưng
 * @returns Trạng thái xóa
 */
async function hardDeletePet(petId) {
    const pet = await Pet.findById(petId);

    if (!pet) {
        const error = new Error("Không tìm thấy thú cưng.");
        error.status = 404;
        throw error;
    }

    try {
        // Thực hiện xóa PetOwner trước, sau đó xóa Pet
        await PetOwner.deleteMany({ petId: petId });
        await Pet.deleteOne({ _id: petId });

        return { message: "Xóa vĩnh viễn thú cưng và các dữ liệu liên quan thành công." };
    } catch (error) {
        console.log("[ERROR]: Lỗi trong quá trình hard delete thú cưng bởi Admin: ", error);
        throw new Error("Lỗi hệ thống khi xóa vĩnh viễn dữ liệu thú cưng.");
    }
}

/**
 * DELETE
 * Xóa vĩnh viễn (Hard Delete) bản ghi thú cưng và các bản ghi liên quan
 * Dành riêng cho Admin dọn rác hệ thống
 * Mock Test - Run Seed
 * Không được sử dụng trong thuật toán hệ thống.
 */
async function deleteAllPets() {
    await Pet.deleteMany({});
    await PetOwner.deleteMany({});

    return true;
}

module.exports = {
    getAllPets,
    getPetById,
    updatePet,
    deletePet,
    restorePet,
    hardDeletePet,
    deleteAllPets,
};
