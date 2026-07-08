// secret.js
const dayjs = require("dayjs");
const crypto = require("./src/utils/crypto");

const appName = "LittlePaws";
const now = dayjs().format("DD/MM/YYYY").toString();

let plainText = appName + now;
console.log("Plain Text:", plainText);

for (let i = 0; i < 9; i++) {
    const randomString = crypto.generateRandomString(4);
    plainText = crypto.shuffleString(plainText + randomString);

    const b64 = crypto.encodeBase64(plainText);
    const sha512 = crypto.hashSHA512(plainText, b64);

    console.log(`Cipher ${i + 1}: ${sha512}`);
}
