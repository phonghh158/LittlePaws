//src/routes/v1/index.js
const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const speciesRoute = require("./species.route");
const userRoute = require("./user.route");

// API nhóm thú cưng
router.use("/species", speciesRoute);

module.exports = router;
