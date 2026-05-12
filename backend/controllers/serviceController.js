const ServiceRequest = require("../models/ServiceRequest");
const Booking = require("../models/Booking");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Create a service request (room service, wake-up call, transportation, etc.)
 * @route   POST /api/services
 * @access  Guest, Receptionist
 */
const createServiceRequest = async (req, res, next) => {
  try {
    const { bookingId, serviceType, description, scheduledTime, charge } = req.body;

    // Verify booking exists and guest is checked in
    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new ErrorResponse("Booking not found", 404));

    if (booking.status !== "CheckedIn") {
      return next(new ErrorResponse("Service requests are only available during active stay", 400));
    }

    // Guests can only request for their own booking
    if (
      req.user.role === "Guest" &&
      booking.guest.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorResponse("Not authorized", 403));
    }

    const serviceRequest = await ServiceRequest.create({
      guest: booking.guest,
      booking: bookingId,
      room: booking.room,
      serviceType,
      description,
      scheduledTime,
      charge: charge || 0,
    });

    await serviceRequest.populate([
      { path: "room", select: "roomNumber floor" },
      { path: "guest", select: "name phone" },
    ]);

    res.status(201).json({
      success: true,
      message: "Service request submitted",
      serviceRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all service requests
 * @route   GET /api/services
 * @access  Admin, Manager, Receptionist
 */
const getAllServiceRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.serviceType) filter.serviceType = req.query.serviceType;

    const requests = await ServiceRequest.find(filter)
      .populate("guest", "name phone")
      .populate("room", "roomNumber floor")
      .populate("handledBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get service requests for the logged-in guest
 * @route   GET /api/services/my
 * @access  Guest
 */
const getMyServiceRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ guest: req.user._id })
      .populate("room", "roomNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a service request status
 * @route   PUT /api/services/:id
 * @access  Admin, Manager, Receptionist
 */
const updateServiceRequest = async (req, res, next) => {
  try {
    const update = { ...req.body };

    // Assign the current staff member as handler
    if (!update.handledBy) update.handledBy = req.user._id;

    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "guest", select: "name phone" },
      { path: "room", select: "roomNumber" },
      { path: "handledBy", select: "name" },
    ]);

    if (!request) return next(new ErrorResponse("Service request not found", 404));

    res.status(200).json({ success: true, message: "Service request updated", request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getMyServiceRequests,
  updateServiceRequest,
};
