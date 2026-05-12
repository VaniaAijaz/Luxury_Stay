const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Submit feedback / rating
 * @route   POST /api/feedback
 * @access  Guest
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { bookingId, rating, cleanliness, service, comfort, location, comment } = req.body;

    // Verify the booking belongs to this guest and is completed
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return next(new ErrorResponse("Booking not found", 404));

      if (booking.guest.toString() !== req.user._id.toString()) {
        return next(new ErrorResponse("Not authorized to review this booking", 403));
      }

      if (booking.status !== "CheckedOut") {
        return next(new ErrorResponse("Feedback can only be submitted after check-out", 400));
      }

      // Prevent duplicate feedback for same booking
      const existing = await Feedback.findOne({ booking: bookingId, guest: req.user._id });
      if (existing) {
        return next(new ErrorResponse("You have already submitted feedback for this booking", 400));
      }
    }

    const feedback = await Feedback.create({
      guest: req.user._id,
      booking: bookingId,
      rating,
      cleanliness,
      service,
      comfort,
      location,
      comment,
    });

    res.status(201).json({ success: true, message: "Feedback submitted. Thank you!", feedback });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback (public reviews)
 * @route   GET /api/feedback
 * @access  Public
 */
const getAllFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ isPublic: true })
      .populate("guest", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedback.length, feedback });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback (including private) — for staff
 * @route   GET /api/feedback/all
 * @access  Admin, Manager
 */
const getAllFeedbackAdmin = async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .populate("guest", "name email")
      .populate("booking", "checkInDate checkOutDate")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedback.length, feedback });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete feedback
 * @route   DELETE /api/feedback/:id
 * @access  Admin
 */
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return next(new ErrorResponse("Feedback not found", 404));

    res.status(200).json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitFeedback, getAllFeedback, getAllFeedbackAdmin, deleteFeedback };
