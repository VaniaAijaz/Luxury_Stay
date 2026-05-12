const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  createServiceRequest,
  getAllServiceRequests,
  getMyServiceRequests,
  updateServiceRequest,
} = require("../controllers/serviceController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Validation rules for service requests
const serviceRules = [
  body("bookingId").notEmpty().withMessage("Booking ID is required"),
  body("serviceType")
    .isIn(["RoomService", "WakeUpCall", "Transportation", "Laundry", "Other"])
    .withMessage("Invalid service type"),
];

// All routes require authentication
router.use(protect);

// GET /api/services/my    — Guest: view own service requests
router.get("/my", getMyServiceRequests);

// GET /api/services       — Staff
router.get("/", authorize("Admin", "Manager", "Receptionist"), getAllServiceRequests);

// POST /api/services      — Guest, Receptionist
router.post(
  "/",
  authorize("Guest", "Receptionist", "Admin", "Manager"),
  serviceRules,
  validate,
  createServiceRequest
);

// PUT /api/services/:id   — Staff
router.put(
  "/:id",
  authorize("Admin", "Manager", "Receptionist"),
  updateServiceRequest
);

module.exports = router;
