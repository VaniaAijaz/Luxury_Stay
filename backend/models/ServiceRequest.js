const mongoose = require("mongoose");

/**
 * ServiceRequest Model
 * Guests can request in-room services like room service, wake-up calls, transportation.
 */
const serviceRequestSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guest reference is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room reference is required"],
    },
    serviceType: {
      type: String,
      enum: ["RoomService", "WakeUpCall", "Transportation", "Laundry", "Other"],
      required: [true, "Service type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    // For wake-up calls: the requested time
    scheduledTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed", "Cancelled"],
      default: "Pending",
    },
    // Staff member handling this request
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Extra charge for the service (added to invoice)
    charge: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
