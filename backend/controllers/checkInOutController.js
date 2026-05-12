const Booking = require("../models/Booking");
const Room = require("../models/Room");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Check in a guest (set room to Occupied)
 * @route   POST /api/checkin/:bookingId
 * @access  Receptionist, Admin, Manager
 */
const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("room");

    if (!booking) return next(new ErrorResponse("Booking not found", 404));

    if (booking.status !== "Confirmed") {
      return next(
        new ErrorResponse(`Cannot check in. Booking status is '${booking.status}'`, 400)
      );
    }

    // Mark booking as checked in
    booking.status = "CheckedIn";
    booking.actualCheckIn = new Date();
    await booking.save();

    // Update room status to Occupied
    await Room.findByIdAndUpdate(booking.room._id, { status: "Occupied" });

    res.status(200).json({
      success: true,
      message: `Guest checked in to Room ${booking.room.roomNumber}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check out a guest (set room to Cleaning)
 * @route   POST /api/checkout/:bookingId
 * @access  Receptionist, Admin, Manager
 */
const checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("room");

    if (!booking) return next(new ErrorResponse("Booking not found", 404));

    if (booking.status !== "CheckedIn") {
      return next(
        new ErrorResponse(`Cannot check out. Booking status is '${booking.status}'`, 400)
      );
    }

    // Mark booking as checked out
    booking.status = "CheckedOut";
    booking.actualCheckOut = new Date();
    await booking.save();

    // Room needs cleaning after checkout
    await Room.findByIdAndUpdate(booking.room._id, { status: "Cleaning" });

    res.status(200).json({
      success: true,
      message: `Guest checked out from Room ${booking.room.roomNumber}. Room marked for cleaning.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkIn, checkOut };
