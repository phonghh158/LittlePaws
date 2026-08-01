// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { success } = require("./utils/response");
const { notFoundHandler, globalErrorHandler } = require("./middlewares/error-handler");
const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
    const appName = process.env.APP_NAME || "Little Paws";
    return success(res, `Chào mừng đến với API của ${appName}`);
});

// Khai báo routes
app.use("/api", routes);

app.use(notFoundHandler); // Middleware xử lý lỗi 404
app.use(globalErrorHandler); // Middleware xử lý lỗi tổng phải được đặt ở vị trí cuối cùng của ứng dụng

module.exports = app;
