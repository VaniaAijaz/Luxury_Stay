const mongoose = require("mongoose");

/**
 * HousekeepingTask Model
 * Tracks room cleaning assignments for housekeeping staff.
 */
const housekeepingTaskSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room reference is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Must be a Housekeeping role user
      required: [true, "Assigned staff is required"],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    taskType: {
      type: String,
      enum: ["Cleaning", "Turndown", "DeepCleaning", "Inspection"],
      default: "Cleaning",
    },
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed"],
      default: "Pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HousekeepingTask", housekeepingTaskSchema);
