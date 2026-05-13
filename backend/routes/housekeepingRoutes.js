const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/housekeepingController");
const { protect, authorize } = require("../middlewares/auth");

// All routes require authentication
router.use(protect);

// GET /api/housekeeping   — Admin, Manager, Housekeeping
router.get(
  "/",
  authorize("Admin", "Manager", "Housekeeping"),
  getAllTasks
);

// GET /api/housekeeping/:id — Admin, Manager, Housekeeping
router.get(
  "/:id",
  authorize("Admin", "Manager", "Housekeeping"),
  getTaskById
);

// POST /api/housekeeping  — Admin, Manager
router.post("/", authorize("Admin", "Manager"), createTask);

// PUT /api/housekeeping/:id — Admin, Manager, Housekeeping
router.put(
  "/:id",
  authorize("Admin", "Manager", "Housekeeping"),
  updateTask
);

// DELETE /api/housekeeping/:id — Admin, Manager
router.delete("/:id", authorize("Admin", "Manager"), deleteTask);

module.exports = router;
