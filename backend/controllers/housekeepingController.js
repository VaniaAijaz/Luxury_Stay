const HousekeepingTask = require("../models/HousekeepingTask");
const Room = require("../models/Room");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Create a housekeeping task (assign room cleaning to staff)
 * @route   POST /api/housekeeping
 * @access  Admin, Manager
 */
const createTask = async (req, res, next) => {
  try {
    const task = await HousekeepingTask.create({
      ...req.body,
      assignedBy: req.user._id,
    });

    await task.populate([
      { path: "room", select: "roomNumber floor status" },
      { path: "assignedTo", select: "name email" },
    ]);

    res.status(201).json({ success: true, message: "Task assigned", task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all housekeeping tasks
 * @route   GET /api/housekeeping
 * @access  Admin, Manager, Housekeeping
 */
const getAllTasks = async (req, res, next) => {
  try {
    const filter = {};

    // Housekeeping staff only see their own tasks
    if (req.user.role === "Housekeeping") {
      filter.assignedTo = req.user._id;
    }

    if (req.query.status) filter.status = req.query.status;

    const tasks = await HousekeepingTask.find(filter)
      .populate("room", "roomNumber floor status")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status (e.g. mark cleaning complete)
 * @route   PUT /api/housekeeping/:id
 * @access  Housekeeping, Admin, Manager
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) return next(new ErrorResponse("Task not found", 404));

    // Housekeeping staff can only update their own tasks
    if (
      req.user.role === "Housekeeping" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorResponse("Not authorized to update this task", 403));
    }

    // If marking as completed, set completedAt and update room status to Available
    if (req.body.status === "Completed") {
      req.body.completedAt = new Date();
      await Room.findByIdAndUpdate(task.room, { status: "Available" });
    }

    const updated = await HousekeepingTask.findByIdAndUpdate(task._id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "room", select: "roomNumber floor status" },
      { path: "assignedTo", select: "name email" },
    ]);

    res.status(200).json({ success: true, message: "Task updated", task: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a housekeeping task
 * @route   DELETE /api/housekeeping/:id
 * @access  Admin, Manager
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await HousekeepingTask.findByIdAndDelete(req.params.id);
    if (!task) return next(new ErrorResponse("Task not found", 404));

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getAllTasks, updateTask, deleteTask };
