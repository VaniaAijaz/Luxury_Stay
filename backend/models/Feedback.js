const mongoose = require("mongoose");

/**
 * Feedback Model
 * Guests can submit ratings and comments after their stay.
 */
const feedbackSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guest reference is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    // Overall rating out of 5
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    // Category-specific ratings (optional)
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    isPublic: {
      type: Boolean,
      default: true, // Whether to show on public reviews
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
