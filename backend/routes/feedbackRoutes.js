const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  submitFeedback,
  getAllFeedback,
  getAllFeedbackAdmin,
  deleteFeedback,
} = require("../controllers/feedbackController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// Validation rules for feedback submission
const feedbackRules = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

// GET /api/feedback       — Public (shows only public reviews)
router.get("/", getAllFeedback);

// GET /api/feedback/all   — Admin, Manager (all reviews including private)
router.get(
  "/all",
  protect,
  authorize("Admin", "Manager"),
  getAllFeedbackAdmin
);

// POST /api/feedback      — Guest only
router.post(
  "/",
  protect,
  authorize("Guest"),
  feedbackRules,
  validate,
  submitFeedback
);

// DELETE /api/feedback/:id — Admin
router.delete("/:id", protect, authorize("Admin"), deleteFeedback);

module.exports = router;
