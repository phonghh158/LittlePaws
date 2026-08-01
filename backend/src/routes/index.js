//src/routes/index.js
const express = require("express");
const router = express.Router();

const v1Routes = require("./v1");
const adminRoutes = require("./admin");

router.use("/v1", v1Routes);
router.use("/admin", adminRoutes);

module.exports = router;
