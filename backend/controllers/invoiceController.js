const Invoice = require("../models/Invoice");
const Booking = require("../models/Booking");
const ServiceRequest = require("../models/ServiceRequest");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Generate an invoice for a booking
 * @route   POST /api/invoices
 * @access  Receptionist, Admin, Manager
 */
const generateInvoice = async (req, res, next) => {
  try {
    const { bookingId, additionalCharges, paymentMethod, notes } = req.body;

    const booking = await Booking.findById(bookingId).populate("room");
    if (!booking) return next(new ErrorResponse("Booking not found", 404));

    if (booking.status !== "CheckedOut") {
      return next(new ErrorResponse("Invoice can only be generated after check-out", 400));
    }

    // Check if invoice already exists for this booking
    const existing = await Invoice.findOne({ booking: bookingId });
    if (existing) {
      return next(new ErrorResponse("Invoice already exists for this booking", 400));
    }

    // Calculate room charges based on actual stay duration
    const msPerDay = 1000 * 60 * 60 * 24;
    const checkIn = booking.actualCheckIn || booking.checkInDate;
    const checkOut = booking.actualCheckOut || booking.checkOutDate;
    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / msPerDay));
    const roomCharges = nights * booking.room.pricePerNight;

    // Fetch any service request charges for this booking
    const serviceRequests = await ServiceRequest.find({
      booking: bookingId,
      status: "Completed",
    });
    const serviceCharges = serviceRequests.map((s) => ({
      description: `${s.serviceType} service`,
      amount: s.charge,
    }));

    // Merge with any manually added charges
    const allAdditional = [...serviceCharges, ...(additionalCharges || [])];
    const additionalTotal = allAdditional.reduce((sum, c) => sum + c.amount, 0);

    const TAX_RATE = 0.1; // 10%
    const subtotal = roomCharges + additionalTotal;
    const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

    const invoice = await Invoice.create({
      booking: bookingId,
      guest: booking.guest,
      roomCharges,
      additionalCharges: allAdditional,
      taxRate: TAX_RATE,
      taxAmount,
      totalAmount,
      paymentMethod,
      notes,
      generatedBy: req.user._id,
    });

    await invoice.populate([
      { path: "guest", select: "name email phone" },
      { path: "booking", select: "checkInDate checkOutDate room" },
    ]);

    res.status(201).json({ success: true, message: "Invoice generated", invoice });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all invoices
 * @route   GET /api/invoices
 * @access  Admin, Manager, Receptionist
 */
const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("guest", "name email")
      .populate("booking", "checkInDate checkOutDate")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("guest", "name email phone")
      .populate({ path: "booking", populate: { path: "room", select: "roomNumber type" } });

    if (!invoice) return next(new ErrorResponse("Invoice not found", 404));

    // Guests can only view their own invoices
    if (
      req.user.role === "Guest" &&
      invoice.guest._id.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorResponse("Not authorized", 403));
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment status of an invoice
 * @route   PATCH /api/invoices/:id/payment
 * @access  Receptionist, Admin, Manager
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true, runValidators: true }
    );

    if (!invoice) return next(new ErrorResponse("Invoice not found", 404));

    res.status(200).json({ success: true, message: "Payment status updated", invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateInvoice, getAllInvoices, getInvoiceById, updatePaymentStatus };
