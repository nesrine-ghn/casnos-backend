const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes
router.get("/", verifyToken, isAdmin,  userController.getUsers);
router.get("/:id", verifyToken, isAdmin,  userController.getUser);
router.put("/:id", verifyToken, isAdmin, userController.updateUser);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

// Activation routes (admin only)
router.put("/:id/activate", verifyToken, isAdmin, userController.activateUser);
router.put("/:id/deactivate", verifyToken, isAdmin, userController.deactivateUser);


module.exports = router;