const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { register, login, getMe, logout, changePassword } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Validation rules for registration
const registerRules = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Validation rules for login
const loginRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// POST /api/auth/register  — public (Guest self-registration)
router.post("/register", registerRules, validate, register);

// POST /api/auth/register/staff  — Admin only (create staff accounts)
router.post("/register/staff", protect, registerRules, validate, register);

// POST /api/auth/login
router.post("/login", loginRules, validate, login);

// GET /api/auth/me  (protected)
router.get("/me", protect, getMe);

// PUT /api/auth/change-password  (protected)
router.put("/change-password", protect, changePassword);

// POST /api/auth/logout  (protected)
router.post("/logout", protect, logout);

module.exports = router;
