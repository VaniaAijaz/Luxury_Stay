/**
 * Seed Script — Create first Admin user
 * =======================================
 * Run: node seed.js
 *
 * Yeh script ek Admin user create karta hai agar pehle se exist na kare.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");

const ADMIN = {
  name: "Super Admin",
  email: "admin@luxurystay.com",
  password: "Admin@123",
  role: "Admin",
  phone: "03001234567",
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN.email });

    if (existing) {
      console.log(`⚠️  Admin already exists: ${ADMIN.email}`);
      process.exit(0);
    }

    // Create admin (pre-save hook will hash the password automatically)
    await User.create(ADMIN);

    console.log("🎉 Admin user created successfully!");
    console.log("─────────────────────────────────");
    console.log(`   Email   : ${ADMIN.email}`);
    console.log(`   Password: ${ADMIN.password}`);
    console.log(`   Role    : ${ADMIN.role}`);
    console.log("─────────────────────────────────");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
