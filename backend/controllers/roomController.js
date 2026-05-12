const Room = require("../models/Room");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Get all rooms (with optional filters)
 * @route   GET /api/rooms
 * @access  Public
 */
const getAllRooms = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by status: /api/rooms?status=Available
    if (req.query.status) filter.status = req.query.status;

    // Filter by type: /api/rooms?type=Suite
    if (req.query.type) filter.type = req.query.type;

    // Filter by max price: /api/rooms?maxPrice=200
    if (req.query.maxPrice) filter.pricePerNight = { $lte: Number(req.query.maxPrice) };

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single room by ID
 * @route   GET /api/rooms/:id
 * @access  Public
 */
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new ErrorResponse("Room not found", 404));
    }
    res.status(200).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check room availability between two dates
 * @route   GET /api/rooms/availability?checkIn=&checkOut=
 * @access  Public
 */
const checkAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return next(new ErrorResponse("Please provide checkIn and checkOut dates", 400));
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return next(new ErrorResponse("Check-out must be after check-in", 400));
    }

    // Find bookings that overlap with the requested dates
    const Booking = require("../models/Booking");
    const bookedRoomIds = await Booking.find({
      status: { $in: ["Confirmed", "CheckedIn"] },
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
    }).distinct("room");

    // Return rooms that are NOT in the booked list and are active
    const availableRooms = await Room.find({
      _id: { $nin: bookedRoomIds },
      status: "Available",
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: availableRooms.length,
      availableRooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Admin, Manager
 */
const createRoom = async (req, res, next) => {
  try {
    // If images were uploaded via multer, attach their paths
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((f) => f.path);
    }

    const room = await Room.create(req.body);
    res.status(201).json({ success: true, message: "Room created", room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a room
 * @route   PUT /api/rooms/:id
 * @access  Admin, Manager
 */
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) return next(new ErrorResponse("Room not found", 404));

    res.status(200).json({ success: true, message: "Room updated", room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hard delete a room from database
 * @route   DELETE /api/rooms/:id
 * @access  Admin
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) return next(new ErrorResponse("Room not found", 404));

    res.status(200).json({ success: true, message: "Room permanently deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
};
