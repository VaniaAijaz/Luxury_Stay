const express = require("express");
const router = express.Router();

const {
  generateInvoice,
  getAllInvoices,
  getInvoiceById,
  updatePaymentStatus,
} = require("../controllers/invoiceController");
const { protect, authorize } = require("../middlewares/auth");

// All routes require authentication
router.use(protect);

// GET /api/invoices       — Staff
router.get("/", authorize("Admin", "Manager", "Receptionist"), getAllInvoices);

// GET /api/invoices/:id   — Any authenticated user (controller handles ownership)
router.get("/:id", getInvoiceById);

// POST /api/invoices      — Staff
router.post("/", authorize("Admin", "Manager", "Receptionist"), generateInvoice);

// PATCH /api/invoices/:id/payment — Staff
router.patch(
  "/:id/payment",
  authorize("Admin", "Manager", "Receptionist"),
  updatePaymentStatus
);

module.exports = router;
