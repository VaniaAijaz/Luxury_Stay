const Booking = require("../models/Booking");
const Room = require("../models/Room");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Helper: calculate total amount for a booking
 */
const calcTotal = (checkIn, checkOut, pricePerNight) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / msPerDay);
  return nights * pricePerNight;
};

/**
 * @desc    Create a new booking / reservation
 * @route   POST /api/bookings
 * @access  Private (Guest, Receptionist, Admin, Manager)
 */
const createBooking = async (req, res, next) => {
  try {
    const { room: roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

    // Validate dates
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      return next(new ErrorResponse("Check-out must be after check-in", 400));
    }

    // Check room exists and is available
    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return next(new ErrorResponse("Room not found", 404));
    }

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      room: roomId,
      status: { $in: ["Confirmed", "CheckedIn"] },
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) },
    });

    if (overlap) {
      return next(new ErrorResponse("Room is not available for the selected dates", 409));
    }

    // Guests book for themselves; staff can book on behalf of a guest
    const guestId =
      req.user.role === "Guest" ? req.user._id : req.body.guest || req.user._id;

    const totalAmount = calcTotal(checkInDate, checkOutDate, room.pricePerNight);

    const booking = await Booking.create({
      guest: guestId,
      room: roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
      totalAmount,
      status: "Confirmed",
      handledBy: req.user._id,
    });

    await booking.populate(["guest", "room"]);

    res.status(201).json({ success: true, message: "Booking created", booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/bookings
 * @access  Admin, Manager, Receptionist
 */
const getAllBookings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter)
      .populate("guest", "name email phone")
      .populate("room", "roomNumber type floor")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings for the logged-in guest
 * @route   GET /api/bookings/my
 * @access  Guest
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate("room", "roomNumber type floor pricePerNight")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("guest", "name email phone")
      .populate("room", "roomNumber type floor pricePerNight");

    if (!booking) return next(new ErrorResponse("Booking not found", 404));

    // Guests can only view their own bookings
    if (
      req.user.role === "Guest" &&
      booking.guest._id.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorResponse("Not authorized", 403));
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a booking (dates, guests, special requests)
 * @route   PUT /api/bookings/:id
 * @access  Admin, Manager, Receptionist
 */
const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) return next(new ErrorResponse("Booking not found", 404));

    if (["CheckedOut", "Cancelled"].includes(booking.status)) {
      return next(new ErrorResponse("Cannot update a completed or cancelled booking", 400));
    }

    // Recalculate total if dates changed
    const checkIn = req.body.checkInDate || booking.checkInDate;
    const checkOut = req.body.checkOutDate || booking.checkOutDate;
    req.body.totalAmount = calcTotal(checkIn, checkOut, booking.room.pricePerNight);

    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(["guest", "room"]);

    res.status(200).json({ success: true, message: "Booking updated", booking: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   DELETE /api/bookings/:id
 * @access  Private (Guest cancels own | Staff cancels any)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new ErrorResponse("Booking not found", 404));

    // Guests can only cancel their own bookings
    if (
      req.user.role === "Guest" &&
      booking.guest.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorResponse("Not authorized", 403));
    }

    if (booking.status === "CheckedIn") {
      return next(new ErrorResponse("Cannot cancel an active check-in", 400));
    }

    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking cancelled", booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
};
