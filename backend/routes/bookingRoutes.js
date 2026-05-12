const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// All booking routes require authentication
router.use(protect);

// Validation rules for creating a booking
const bookingRules = [
  body("room").notEmpty().withMessage("Room ID is required"),
  body("checkInDate").isISO8601().withMessage("Valid check-in date is required"),
  body("checkOutDate").isISO8601().withMessage("Valid check-out date is required"),
  body("numberOfGuests")
    .isInt({ min: 1 })
    .withMessage("Number of guests must be at least 1"),
];

// GET /api/bookings/my    — Guest: view own bookings
router.get("/my", getMyBookings);

// GET /api/bookings       — Staff: view all bookings
router.get("/", authorize("Admin", "Manager", "Receptionist"), getAllBookings);

// GET /api/bookings/:id   — Any authenticated user (controller handles ownership check)
router.get("/:id", getBookingById);

// POST /api/bookings      — Any authenticated user
router.post("/", bookingRules, validate, createBooking);

// PUT /api/bookings/:id   — Staff only
router.put("/:id", authorize("Admin", "Manager", "Receptionist"), updateBooking);

// DELETE /api/bookings/:id — Guest (own) or Staff
router.delete("/:id", cancelBooking);

module.exports = router;
