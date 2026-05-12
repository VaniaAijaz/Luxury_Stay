const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");

// Validation rules for creating a room
const roomRules = [
  body("roomNumber").notEmpty().withMessage("Room number is required"),
  body("type")
    .isIn(["Single", "Double", "Suite", "Deluxe", "Presidential"])
    .withMessage("Invalid room type"),
  body("floor").isNumeric().withMessage("Floor must be a number"),
  body("pricePerNight").isNumeric().withMessage("Price must be a number"),
  body("capacity").isNumeric().withMessage("Capacity must be a number"),
];

// GET /api/rooms/availability?checkIn=&checkOut=  (public)
router.get("/availability", checkAvailability);

// GET /api/rooms          (public)
router.get("/", getAllRooms);

// GET /api/rooms/:id      (public)
router.get("/:id", getRoomById);

// POST /api/rooms         — Admin, Manager (supports image upload)
router.post(
  "/",
  protect,
  authorize("Admin", "Manager"),
  upload.array("images", 5),
  roomRules,
  validate,
  createRoom
);

// PUT /api/rooms/:id      — Admin, Manager
router.put("/:id", protect, authorize("Admin", "Manager"), updateRoom);

// DELETE /api/rooms/:id   — Admin only
router.delete("/:id", protect, authorize("Admin"), deleteRoom);

module.exports = router;
