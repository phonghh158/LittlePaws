// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { success } = require("./utils/response");
const { notFoundHandler, globalErrorHandler } = require("./middlewares/error-handler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    const appName = process.env.APP_NAME || "Little Paws";
    return success(res, `Chào mừng đến với API của ${appName}`);
});

// Gọi các middleware xử lý lỗi ở cuối cùng
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
