// src/services/species.service.js
// Service for user
const dayjs = require("dayjs");

const User = require("../models/user.model");
const Pet = require("../models/pet.model");
const PetOwner = require("../models/pet-owner.model");

const PetOwnerHelper = require("../services/helper/pet-owner.helper");

const { PET_AVATAR } = require("../constants/default-avatar");

/**
 * CREATE
 * Tạo mới bản ghi thú cưng
 * @param { Object } ownerData - Dữ liệu của chủ sở hữu
 * @param { Object } petData - Dữ liệu thú cưng
 * @returns Thông tin thú cưng vừa tạo
 */
async function addPet(ownerData, petData) {
    let { ownerId, relationship } = ownerData;
    let { name, nickname, breedId, gender, dob, adoptionDate, avatarUrl } = petData;

    const owner = await User.findOne({ _id: ownerId, deletedAt: null }).select(
        "username fullName gender avatarUrl",
    );
    if (!owner) {
        const error = new Error("Không tìm thấy người dùng.");
        error.status = 404;
        throw error;
    }

    if (!avatarUrl) {
        const randomNumber = Math.floor(Math.random() * PET_AVATAR.length);
        avatarUrl = PET_AVATAR[randomNumber];
    }

    const pet = await Pet.create({
        name: name,
        nickname: nickname,
        breedId: breedId,
        gender: gender,
        dob: dob,
        adoptionDate: adoptionDate,
        avatarUrl: avatarUrl,
    });

    try {
        if (!relationship) {
            if (owner.gender === "male") {
                relationship = "Anh";
            } else if (owner.gender === "female") {
                relationship = "Chị";
            } else {
                relationship = "Loài người";
            }
        }

        const petOwner = await PetOwner.create({
            userId: ownerId,
            petId: pet._id,
            relationship: relationship,
            role: "owner",
        });

        return {
            pet: pet,
            petOwner: {
                owner: owner,
                relationship: petOwner.relationship,
                role: petOwner.role,
            },
        };
    } catch (error) {
        console.log("[ERROR]: Lỗi trong quá trình tạo bản ghi PetOwner: ", error);
        console.log("[ROLLBACK]: Tiến hành rollback. Xóa bản ghi Pet đã tạo.");

        try {
            await Pet.deleteOne({ _id: pet._id });
            console.log("[ROLLBACK]: Xóa bản ghi Pet thành công.");
        } catch (error) {
            console.log("[ERROR]: Lỗi trong quá trình xóa bản ghi Pet: ", error);
            console.log("[ERROR]: Cần thực hiện xóa dữ liệu thủ công.");
            console.log("[ERROR]: Orphan Pet Id: ", pet._id);
        }

        throw error;
    }
}

/**
 * GET
 * Lấy danh sách bản ghi thú cưng
 * @param { String } ownerId - ID của chủ sở hữu
 * @param { Object } query - Object chứa thông tin query
 * @returns Danh sách thú cưng
 */
async function getAllPets(ownerId, query) {
    const petIdList = await PetOwner.find({ userId: ownerId, deletedAt: null }, "petId");

    const { keyword = "", page = 1, sort } = query;
    const limit = 5;

    if (petIdList.length === 0) {
        return {
            docs: [],
            totalDocs: 0,
            limit: limit,
            page: parseInt(page, 10),
            totalPages: 0,
        };
    }

    let filter = {
        _id: { $in: petIdList.map((item) => item.petId) },
        deletedAt: null,
    };

    if (keyword) {
        filter.name = { $regex: keyword, $options: "i" };
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
 * Lấy bản ghi thú cưng theo ID
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID người dùng
 * @returns Thông tin thú cưng
 */
async function getPetById(petId, ownerId) {
    await PetOwnerHelper.isPetOwnership(petId, ownerId);

    const pet = await Pet.findOne({
        _id: petId,
        deletedAt: null,
    })
        .populate({
            path: "breedId",
            select: "name",
            populate: {
                path: "speciesId",
                select: "name",
            },
        })
        .select("-deletedAt")
        .lean();

    if (!pet) {
        const error = new Error("Không tìm thấy thú cưng.");
        error.status = 404;
        throw error;
    }

    const speciesName = pet.breedId.speciesId.name;
    const breedName = pet.breedId.name;

    delete pet.breedId;

    return {
        pet: pet,
        species: speciesName,
        breed: breedName,
    };
}

/**
 * UPDATE
 * Cập nhật bản ghi thú cưng
 * Không cho phép cập nhật deletedAt, isNeutered, status, breedId
 * @param { String } ownerId - ID chủ sở hữu
 * @param { String } petId - ID bản ghi thú cưng
 * @param { Object } updateData - Dữ liệu cập nhật
 * @returns Thông tin bản ghi thú cưng sau khi cập nhật
 */
async function updatePet(ownerId, petId, updateData) {
    await PetOwnerHelper.isPetOwner(petId, ownerId);

    const updatedPet = await Pet.findOneAndUpdate({ _id: petId, deletedAt: null }, updateData, {
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
        .select("-deletedAt")
        .lean();

    if (!updatedPet) {
        const error = new Error("Không tìm thấy thông tin thú cưng.");
        error.status = 404;
        throw error;
    }

    const speciesName = updatedPet.breedId.speciesId.name;
    const breedName = updatedPet.breedId.name;

    delete updatedPet.breedId;

    return {
        pet: updatedPet,
        species: speciesName,
        breed: breedName,
    };
}

/**
 * UPDATE
 * Thay đổi giống loài của bạn pet.
 * @param { String } petId - ID thú cưng
 * @param { String } ownerId - ID chủ sở hữu thực hiện thao tác
 * @param { String } breedId - ID Breed
 * @returns Thông tin thú cưng sau khi cập nhật
 */
async function updatePetBreed(petId, ownerId, breedId) {
    await PetOwnerHelper.isPetOwner(petId, ownerId);

    const updatedPet = await Pet.findOneAndUpdate(
        { _id: petId, deletedAt: null },
        { breedId: breedId },
        {
            new: true,
            runValidators: true,
        },
    )
        .populate({
            path: "breedId",
            select: "name",
            populate: {
                path: "speciesId",
                select: "name",
            },
        })
        .select("name breedId")
        .lean();

    if (!updatedPet) {
        const error = new Error("Không tìm thấy thông tin thú cưng.");
        error.status = 404;
        throw error;
    }

    return updatedPet;
}

/**
 * UPDATE
 * Cập nhật nhanh trạng thái của thú cưng (alive, lost, gone, other)
 * @param { String } petId - ID thú cưng
 * @param { String } ownerId - ID chủ sở hữu thực hiện thao tác
 * @param { String } newStatus - Trạng thái mới cần cập nhật
 * @returns Thông tin thú cưng sau khi cập nhật
 */
async function updatePetStatus(petId, ownerId, newStatus) {
    await PetOwnerHelper.isPetOwner(petId, ownerId);

    const updatedPet = await Pet.findOneAndUpdate(
        { _id: petId, deletedAt: null },
        { status: newStatus },
        {
            new: true,
            runValidators: true,
        },
    )
        .select("name status")
        .lean();

    if (!updatedPet) {
        const error = new Error("Không tìm thấy thông tin thú cưng.");
        error.status = 404;
        throw error;
    }

    return updatedPet;
}

/**
 * DELETE
 * Xóa bản ghi thú cưng
 * Soft Delete
 * @param { String } petId - ID bản ghi thú cưng
 * @param { String } ownerId - ID chủ sở hữu thực hiện thao tác
 * @param { String } reason - Lý do xóa
 * @returns Thông tin bản ghi thú cưng sau khi xóa
 */
async function deletePet(ownerId, petId, reason) {
    await PetOwnerHelper.isPetOwner(petId, ownerId);

    const deletedPet = await Pet.findOneAndUpdate(
        { _id: petId, deletedAt: null },
        { deletedAt: dayjs().toDate(), status: reason },
        { new: true, runValidators: true },
    ).lean();

    if (!deletedPet) {
        throw new Error("Lỗi xử lý khi xóa bản ghi thú cưng.");
    }

    try {
        await PetOwner.updateMany(
            { petId: petId, deletedAt: null },
            { deletedAt: dayjs().toDate() },
        );
    } catch (error) {
        console.log("[ERROR]: Có lỗi trong quá trình xóa bản ghi chủ sở hữu thú cưng.");
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
 * Khôi phục thú cưng đã bị xóa mềm
 * @param { String } petId - ID thú cưng
 * @param { String } ownerId - ID chủ sở hữu thực hiện thao tác
 * @returns Thông tin thú cưng sau khi khôi phục
 */
async function restorePet(petId, ownerId) {
    await PetOwnerHelper.isPetOwner(petId, ownerId);s

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
        console.log("[ERROR]: Có lỗi trong quá trình khôi phục bản ghi chủ sở hữu thú cưng.");
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

module.exports = {
    addPet,
    getAllPets,
    getPetById,
    updatePet,
    deletePet,
    restorePet,
};
