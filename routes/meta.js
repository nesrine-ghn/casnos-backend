const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const roleController = require("../controllers/roleController");

router.get("/departments", departmentController.getDepartments);
router.get("/roles", roleController.getRoles);

module.exports = router;