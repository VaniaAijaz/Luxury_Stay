const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin, Manager
 */
const getAllUsers = async (req, res, next) => {
  try {
    // Support filtering by role via query param: /api/users?role=Housekeeping
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single user by ID
 * @route   GET /api/users/:id
 * @access  Admin, Manager
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorResponse("User not found", 404));

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user
 * @route   PUT /api/users/:id
 * @access  Admin | Own profile
 */
const updateUser = async (req, res, next) => {
  try {
    // Non-admin users can only update their own profile
    if (req.user.role !== "Admin" && req.user._id.toString() !== req.params.id) {
      return next(new ErrorResponse("Not authorized to update this user", 403));
    }

    // Prevent password update through this route
    const { password, ...updateData } = req.body;

    // Only Admin can change roles
    if (updateData.role && req.user.role !== "Admin") {
      return next(new ErrorResponse("Only Admin can change user roles", 403));
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) return next(new ErrorResponse("User not found", 404));

    res.status(200).json({ success: true, message: "User updated", user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate (soft delete) a user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) return next(new ErrorResponse("User not found", 404));

    res.status(200).json({ success: true, message: "User deactivated", user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reactivate a user
 * @route   PATCH /api/users/:id/activate
 * @access  Admin
 */
const activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!user) return next(new ErrorResponse("User not found", 404));

    res.status(200).json({ success: true, message: "User activated", user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deactivateUser, activateUser };

/**
 * @desc    Create a new user — Admin only
 * @route   POST /api/users
 * @access  Admin
 */
async function createUser(req, res, next) {
  try {
    const { name, email, password, role, phone, address, idProof } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorResponse("Name, email and password are required", 400));
    }

    const existing = await User.findOne({ email });
    if (existing) return next(new ErrorResponse("Email already registered", 400));

    const user = await User.create({
      name, email, password,
      role: role || "Guest",
      phone, address, idProof,
    });

    res.status(201).json({ success: true, message: "User created", user });
  } catch (error) {
    next(error);
  }
}
