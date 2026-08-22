// src/services/pet.service.js
const dayjs = require("dayjs");

const User = require("../models/user.model");
const Pet = require("../models/pet.model");
const Home = require("../models/home.model");

const { PET_AVATAR } = require("../constants/default-avatar");

/**
 * CREATE
 * Tạo mới bản ghi thú cưng
 * @param { String } ownerId - ID người dùng
 * @param { String } homeId - ID gia đình
 * @param { Object } petData - Dữ liệu thú cưng
 * @returns Thông tin thú cưng vừa tạo
 */
async function addPet(ownerId, homeId, petData) {
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
        let family;
        if (familyId) {
            family = await Family.findOneAndUpdate(
                { _id: familyId, deletedAt: null },
                { $push: { petIds: pet._id } },
                { new: true },
            );
        } else {
            family = await Family.create({
                name: `Gia đình của ${pet.name}`,
                petIds: [pet._id],
                ownership: [{ userId: ownerId, role: "owner" }],
            });
        }

        return {
            pet: pet,
            family: family,
        };
    } catch (error) {
        console.log("[ERROR]: Lỗi trong quá trình tạo/cập nhật bản ghi Family: ", error);
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
    const families = await Family.find(
        { "ownership.userId": ownerId, deletedAt: null },
        "petIds",
    ).lean();

    const { keyword = "", page = 1, sort } = query;

    const petIdList = families.flatMap((family) => family.petIds);

    if (petIdList.length === 0) {
        return {
            docs: [],
            totalDocs: 0,
            limit: 5,
            page: parseInt(page, 10),
            totalPages: 0,
        };
    }

    let filter = {
        _id: { $in: petIdList },
        deletedAt: null,
    };

    if (keyword) {
        filter.name = { $regex: keyword, $options: "i" };
    }

    const options = {
        page: parseInt(page, 10),
        limit: 5,
        sort: sort ? sort : { createdAt: -1 },
        populate: [
            {
                path: "breedId",
                select: "species name",
            },
        ],
    };

    return await Pet.paginate(filter, options);
}

/**
 * GET
 * Lấy bản ghi thú cưng theo ID
 */
async function getPetById(petId) {
    const pet = await Pet.findOne({
        _id: petId,
        deletedAt: null,
    })
        .populate({
            path: "breedId",
            select: "species name",
        })
        .lean();

    if (!pet) {
        throw new Error("DataNotFound");
    }

    return pet;
}

/**
 * UPDATE
 * Cập nhật bản ghi thú cưng
 */
async function updatePet(petId, updateData) {
    const updatedPet = await Pet.findOneAndUpdate({ _id: petId, deletedAt: null }, updateData, {
        new: true,
        runValidators: true,
    })
        .populate({
            path: "breedId",
            select: "species name",
        })
        .lean();

    if (!updatedPet) {
        throw new Error("DataNotFound");
    }

    return updatedPet;
}

/**
 * UPDATE
 * Thay đổi giống loài của bạn pet.
 */
async function updatePetBreed(petId, breedId) {
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
            select: "species name",
        })
        .select("name breedId")
        .lean();

    if (!updatedPet) {
        throw new Error("DataNotFound");
    }

    return updatedPet;
}

/**
 * UPDATE
 * Cập nhật nhanh trạng thái của thú cưng
 */
async function updatePetStatus(petId, newStatus) {
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
        throw new Error("DataNotFound");
    }

    return updatedPet;
}

/**
 * DELETE
 * Xóa bản ghi thú cưng
 */
async function deletePet(petId) {
    const deletedPet = await Pet.findOneAndUpdate(
        { _id: petId, deletedAt: null },
        { deletedAt: dayjs().toDate() },
        { new: true, runValidators: true },
    ).lean();

    if (!deletedPet) {
        throw new Error("DataNotFound");
    }

    return deletedPet;
}

/**
 * UPDATE
 * Khôi phục thú cưng đã bị xóa mềm
 */
async function restorePet(petId) {
    const restoredPet = await Pet.findOneAndUpdate(
        { _id: petId, deletedAt: { $ne: null } },
        { deletedAt: null },
        {
            new: true,
            runValidators: true,
        },
    ).lean();

    if (!restoredPet) {
        throw new Error("DataNotFound");
    }

    return restoredPet;
}

module.exports = {
    addPet,
    getAllPets,
    getPetById,
    updatePet,
    updatePetBreed,
    updatePetStatus,
    deletePet,
    restorePet,
};
