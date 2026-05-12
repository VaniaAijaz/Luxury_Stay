const MaintenanceRequest = require("../models/MaintenanceRequest");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Create a maintenance request
 * @route   POST /api/maintenance
 * @access  Any authenticated user
 */
const createRequest = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.create({
      ...req.body,
      reportedBy: req.user._id,
    });

    await request.populate([
      { path: "room", select: "roomNumber floor" },
      { path: "reportedBy", select: "name role" },
    ]);

    res.status(201).json({ success: true, message: "Maintenance request created", request });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all maintenance requests
 * @route   GET /api/maintenance
 * @access  Admin, Manager, Receptionist
 */
const getAllRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const requests = await MaintenanceRequest.find(filter)
      .populate("room", "roomNumber floor")
      .populate("reportedBy", "name role")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single maintenance request
 * @route   GET /api/maintenance/:id
 * @access  Private
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate("room", "roomNumber floor")
      .populate("reportedBy", "name role")
      .populate("assignedTo", "name email");

    if (!request) return next(new ErrorResponse("Maintenance request not found", 404));

    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a maintenance request (assign, change status, add notes)
 * @route   PUT /api/maintenance/:id
 * @access  Admin, Manager
 */
const updateRequest = async (req, res, next) => {
  try {
    // If resolving, set resolvedAt timestamp
    if (req.body.status === "Resolved" || req.body.status === "Closed") {
      req.body.resolvedAt = new Date();
    }

    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: "room", select: "roomNumber floor" },
      { path: "assignedTo", select: "name email" },
    ]);

    if (!request) return next(new ErrorResponse("Maintenance request not found", 404));

    res.status(200).json({ success: true, message: "Request updated", request });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a maintenance request
 * @route   DELETE /api/maintenance/:id
 * @access  Admin
 */
const deleteRequest = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findByIdAndDelete(req.params.id);
    if (!request) return next(new ErrorResponse("Maintenance request not found", 404));

    res.status(200).json({ success: true, message: "Maintenance request deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getAllRequests, getRequestById, updateRequest, deleteRequest };
