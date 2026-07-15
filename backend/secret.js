// secret.js
const dayjs = require("dayjs");
const crypto = require("./src/utils/crypto");

for (let i = 0; i < 9; i++) {
    const secret = crypto.generateSecretKey();

    console.log(`Cipher ${i + 1}: ${secret}`);
}
