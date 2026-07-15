// src/utils/crypto.js
const crypto = require("crypto");
const dayjs = require("dayjs");

/**
 *  Băm chuỗi dữ liệu kết hợp Salt bằng SHA-512
 * @param {string} data - Dữ liệu cần băm
 * @param {string} salt - Chuỗi muối ngẫu nhiên để tăng tính bảo mật
 * @returns {string} Chuỗi băm SHA-512 định dạng hex
 */
function hashSHA512(data, salt = process.env.SHA512_SALT) {
    return crypto
        .createHash("sha512")
        .update(data + salt)
        .digest("hex");
}

/**
 * Xác thực dữ liệu băm bằng SHA-512
 * @param {string} plainText - Dữ liệu gốc người dùng nhập
 * @param {string} salt - Chuỗi muối lấy từ DB
 * @param {string} hashedData - Chuỗi băm lấy từ DB
 * @returns {boolean} Kết quả khớp hay không
 */
function verifySHA512(plainText, salt = process.env.SHA512_SALT, hashedData) {
    const newHash = hashSHA512(plainText, salt);
    return newHash === hashedData;
}

/**
 * Mã hóa một chuỗi văn bản sang định dạng Base64
 * @param {string} text - Văn bản gốc
 * @returns {string} Chuỗi đã mã hóa Base64
 */
function encodeBase64(text) {
    return Buffer.from(text, "utf-8").toString("base64");
}

/**
 * Giải mã chuỗi Base64 về lại văn bản gốc
 * @param {string} base64String - Chuỗi mã hóa Base64
 * @returns {string} Văn bản gốc ban đầu
 */
function decodeBase64(base64String) {
    return Buffer.from(base64String, "base64").toString("utf-8");
}

/**
 * Tạo chuỗi ngẫu nhiên an toàn bảo mật
 * @param {number} [length=32] - Số lượng bytes ngẫu nhiên cần tạo
 * @returns {string} Chuỗi ký tự ngẫu nhiên định dạng hex (độ dài thực tế bằng length * 2)
 */
function generateRandomString(length = 16) {
    return crypto.randomBytes(length).toString("hex");
}

/**
 * Xáo trộn một chuỗi bằng Thuật toán Fisher-Yates
 * @param {string} - Chuỗi gốc
 * @returns {string} Chuỗi sau khi xáo trộn
 */
function shuffleString(str) {
    let arr = str.split("");

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.join("");
}

/**
 * Tạo mã bí mật ngẫu nhiên và mã hóa nhiều lần
 * @returns {string} Mã bí mật
 */
function generateSecretKey() {
    const timestamp = dayjs().format("DD/MM/YYYY - HH:mm:ss.SSS").toString(); // Lấy mốc thời gian hiện tại
    const randomNumber = Math.floor(Math.random() * 9) + 4; // Random number from 4 to 12. Công thức: Math.floor(Math.random() * (max - min + 1)) + min
    const randomString = generateRandomString(randomNumber); // Chuỗi ngẫu nhiên randonNumber * 2 ký tự
    const appName = process.env.APP_NAME || "LittlePaws";
    const plainText = randomString + appName + timestamp;

    const b64 = encodeBase64(plainText);
    const salt = process.env.SHA512_SALT || shuffleString(plainText);
    const secret512 = hashSHA512(b64, salt);

    return secret512;
}

module.exports = {
    hashPassword,
    verifyPassword,
    hashSHA512,
    verifySHA512,
    encodeBase64,
    decodeBase64,
    generateRandomString,
    shuffleString,
    generateSecretKey,
};
