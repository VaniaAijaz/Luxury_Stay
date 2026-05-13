const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (Guests) | Admin can register staff
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, idProof } = req.body;

    // Only Admin can create staff accounts
    const staffRoles = ["Admin", "Manager", "Receptionist", "Housekeeping"];
    if (staffRoles.includes(role)) {
      // If no token / not admin, deny staff registration
      if (!req.user || req.user.role !== "Admin") {
        return next(new ErrorResponse("Only Admin can create staff accounts", 403));
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse("Email already registered", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Guest",
      phone,
      address,
      idProof,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user and return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse("Please provide email and password", 400));
    }

    // Find user and explicitly include password field (it's select:false by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    if (!user.isActive) {
      return next(new ErrorResponse("Your account has been deactivated", 403));
    }

    // Compare entered password with hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout (client-side: just discard the token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  // JWT is stateless — logout is handled on the client by deleting the token.
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

/**
 * @desc    Change password for logged-in user
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse("Please provide current and new password", 400));
    }

    if (newPassword.length < 6) {
      return next(new ErrorResponse("New password must be at least 6 characters", 400));
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return next(new ErrorResponse("User not found", 404));

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse("Current password is incorrect", 401));
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout, changePassword };
