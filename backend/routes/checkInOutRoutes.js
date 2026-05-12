const express = require("express");
const router = express.Router();

const { checkIn, checkOut } = require("../controllers/checkInOutController");
const { protect, authorize } = require("../middlewares/auth");

// All routes require authentication and staff role
router.use(protect, authorize("Admin", "Manager", "Receptionist"));

// POST /api/checkin/:bookingId
router.post("/:bookingId", checkIn);

module.exports = router;

// Separate router for checkout (mounted at /api/checkout)
const checkOutRouter = express.Router();
checkOutRouter.use(protect, authorize("Admin", "Manager", "Receptionist"));
checkOutRouter.post("/:bookingId", checkOut);

module.exports = { checkInRouter: router, checkOutRouter };
