// server.js

require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 1111;

connectDB()
    .then(() => {
        // Chỉ khởi động server khi đã kết nối DB thành công
        app.listen(PORT, () => {
            console.log(`\n🚀  Server [${process.env.APP_NAME}] đang khởi chạy...`);
            console.log(`⚙️   Chế độ: ${process.env.NODE_ENV}`);
            console.log(`🌐  Địa chỉ: http://localhost:${PORT}\n`);
        });
    })
    .catch((err) => {
        console.error(`💥 Không thể khởi động server:`, err);
    });
