const mongoose = require("mongoose");

/**
 * Room Model
 * Represents a hotel room with its type, pricing, status, and amenities.
 */
const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Room type is required"],
      enum: ["Single", "Double", "Suite", "Deluxe", "Presidential"],
    },
    floor: {
      type: Number,
      required: [true, "Floor number is required"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Cleaning", "Maintenance"],
      default: "Available",
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },
    amenities: {
      type: [String], // e.g. ["WiFi", "TV", "Mini Bar", "Jacuzzi"]
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String], // Array of image file paths/URLs
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
