const express = require("express");
const router = express.Router();

const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} = require("../controllers/maintenanceController");
const { protect, authorize } = require("../middlewares/auth");

// All routes require authentication
router.use(protect);

// GET /api/maintenance    — Admin, Manager, Receptionist
router.get("/", authorize("Admin", "Manager", "Receptionist"), getAllRequests);

// GET /api/maintenance/:id — Any authenticated user
router.get("/:id", getRequestById);

// POST /api/maintenance   — Any authenticated user can report an issue
router.post("/", createRequest);

// PUT /api/maintenance/:id — Admin, Manager
router.put("/:id", authorize("Admin", "Manager"), updateRequest);

// DELETE /api/maintenance/:id — Admin
router.delete("/:id", authorize("Admin"), deleteRequest);

module.exports = router;
