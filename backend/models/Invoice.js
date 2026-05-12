const mongoose = require("mongoose");

/**
 * Invoice Model
 * Generated when a guest checks out. Includes room charges + additional services.
 */
const invoiceSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guest reference is required"],
    },
    // Breakdown of charges
    roomCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    // Additional services added to the bill (e.g. room service, laundry)
    additionalCharges: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    taxRate: {
      type: Number,
      default: 0.1, // 10% tax
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online", "Other"],
    },
    notes: {
      type: String,
      trim: true,
    },
    // Staff who generated the invoice
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
