const mongoose = require("mongoose");

/**
 * Booking Model
 * Represents a reservation made by a guest for a specific room.
 */
const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guest is required"],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
    },
    // Actual check-in/check-out timestamps (set when guest physically arrives/leaves)
    actualCheckIn: {
      type: Date,
    },
    actualCheckOut: {
      type: Date,
    },
    numberOfGuests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: 1,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "CheckedIn", "CheckedOut", "Cancelled"],
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    // Staff member who handled the booking
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
