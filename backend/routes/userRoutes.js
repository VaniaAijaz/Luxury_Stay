const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/auth");

// All routes require authentication
router.use(protect);

// GET /api/users          — Admin, Manager
router.get("/", authorize("Admin", "Manager"), getAllUsers);

// GET /api/users/:id      — Admin, Manager
router.get("/:id", authorize("Admin", "Manager"), getUserById);

// PUT /api/users/:id      — Admin or own profile (handled in controller)
router.put("/:id", updateUser);

// DELETE /api/users/:id   — Admin only (soft delete)
router.delete("/:id", authorize("Admin"), deactivateUser);

// PATCH /api/users/:id/activate — Admin only
router.patch("/:id/activate", authorize("Admin"), activateUser);

module.exports = router;
