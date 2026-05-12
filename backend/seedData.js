/**
 * Full Demo Seed — Rooms + Bookings + Invoices + Staff
 * =====================================================
 * Run: node seedData.js
 * Creates realistic demo data for presentation.
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const User        = require("./models/User");
const Room        = require("./models/Room");
const Booking     = require("./models/Booking");
const Invoice     = require("./models/Invoice");
const HousekeepingTask = require("./models/HousekeepingTask");
const ServiceRequest   = require("./models/ServiceRequest");

/* ─── helpers ─── */
const daysAgo  = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);
const rand     = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected\n");

  /* ── 1. Clear old demo data ── */
  await Promise.all([
    Room.deleteMany({}),
    Booking.deleteMany({}),
    Invoice.deleteMany({}),
    HousekeepingTask.deleteMany({}),
    ServiceRequest.deleteMany({}),
    User.deleteMany({ role: { $ne: "Admin" } }),   // keep Admin
  ]);
  console.log("🗑  Old demo data cleared");

  /* ── 2. Staff users ── */
  const staffData = [
    { name: "Sarah Manager",    email: "manager@luxurystay.com",     password: "Manager@123",     role: "Manager"      },
    { name: "John Receptionist",email: "reception@luxurystay.com",   password: "Reception@123",   role: "Receptionist" },
    { name: "Maria Housekeeping",email:"housekeeping@luxurystay.com", password: "Housekeeping@123",role: "Housekeeping"  },
  ];
  const staff = await User.create(staffData);
  console.log(`👥 ${staff.length} staff users created`);

  /* ── 3. Guest users ── */
  const guestNames = [
    ["Alexander Thompson", "alex.thompson@email.com"],
    ["Sarah Mitchell",     "sarah.mitchell@email.com"],
    ["James Wilson",       "james.wilson@email.com"],
    ["Emma Davis",         "emma.davis@email.com"],
    ["Robert Clark",       "robert.clark@email.com"],
    ["Olivia Brown",       "olivia.brown@email.com"],
    ["William Johnson",    "william.j@email.com"],
    ["Sophia Martinez",    "sophia.m@email.com"],
  ];
  const guests = await User.create(
    guestNames.map(([name, email]) => ({
      name, email, password: "Guest@123", role: "Guest",
      phone: `+1${randInt(2000000000, 9999999999)}`,
    }))
  );
  console.log(`🧑‍🤝‍🧑 ${guests.length} guest users created`);

  /* ── 4. Rooms ── */
  const roomTypes = [
    { type: "Single",       price: 120, capacity: 1 },
    { type: "Double",       price: 180, capacity: 2 },
    { type: "Suite",        price: 350, capacity: 3 },
    { type: "Deluxe",       price: 280, capacity: 2 },
    { type: "Presidential", price: 800, capacity: 4 },
  ];
  const amenitiesByType = {
    Single:       ["WiFi", "TV", "AC"],
    Double:       ["WiFi", "TV", "AC", "Mini Bar"],
    Suite:        ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi", "Balcony"],
    Deluxe:       ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
    Presidential: ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi", "Balcony", "Butler Service", "Private Pool"],
  };

  const roomsData = [];
  let roomNum = 101;
  for (let floor = 1; floor <= 5; floor++) {
    for (const rt of roomTypes) {
      roomsData.push({
        roomNumber: String(roomNum++),
        type:       rt.type,
        floor,
        pricePerNight: rt.price,
        capacity:   rt.capacity,
        amenities:  amenitiesByType[rt.type],
        status:     rand(["Available", "Available", "Available", "Occupied", "Cleaning"]),
        description: `Comfortable ${rt.type} room on floor ${floor} with stunning views.`,
      });
    }
  }
  const rooms = await Room.create(roomsData);
  console.log(`🛏  ${rooms.length} rooms created`);

  /* ── 5. Bookings ── */
  const admin = await User.findOne({ role: "Admin" });
  const receptionist = staff.find(s => s.role === "Receptionist");

  const bookingsData = [];

  // Past bookings (checked out) — for revenue charts
  for (let i = 0; i < 30; i++) {
    const guest  = rand(guests);
    const room   = rand(rooms);
    const nights = randInt(1, 7);
    const checkIn  = daysAgo(randInt(10, 90));
    const checkOut = new Date(checkIn.getTime() + nights * 86400000);
    bookingsData.push({
      guest:          guest._id,
      room:           room._id,
      checkInDate:    checkIn,
      checkOutDate:   checkOut,
      actualCheckIn:  checkIn,
      actualCheckOut: checkOut,
      numberOfGuests: randInt(1, room.capacity),
      status:         "CheckedOut",
      totalAmount:    nights * room.pricePerNight,
      handledBy:      receptionist._id,
    });
  }

  // Current check-ins (active)
  for (let i = 0; i < 5; i++) {
    const guest  = guests[i];
    const room   = rooms[i * 3];
    const nights = randInt(2, 5);
    const checkIn  = daysAgo(randInt(1, 3));
    const checkOut = daysAhead(nights);
    bookingsData.push({
      guest:         guest._id,
      room:          room._id,
      checkInDate:   checkIn,
      checkOutDate:  checkOut,
      actualCheckIn: checkIn,
      numberOfGuests: randInt(1, 2),
      status:        "CheckedIn",
      totalAmount:   nights * room.pricePerNight,
      handledBy:     receptionist._id,
    });
  }

  // Upcoming confirmed bookings
  for (let i = 0; i < 6; i++) {
    const guest  = rand(guests);
    const room   = rand(rooms);
    const nights = randInt(2, 6);
    const checkIn  = daysAhead(randInt(1, 14));
    const checkOut = new Date(checkIn.getTime() + nights * 86400000);
    bookingsData.push({
      guest:         guest._id,
      room:          room._id,
      checkInDate:   checkIn,
      checkOutDate:  checkOut,
      numberOfGuests: randInt(1, room.capacity),
      status:        "Confirmed",
      totalAmount:   nights * room.pricePerNight,
      handledBy:     receptionist._id,
    });
  }

  // Today's check-ins
  for (let i = 0; i < 3; i++) {
    const guest  = rand(guests);
    const room   = rand(rooms);
    const nights = randInt(2, 4);
    bookingsData.push({
      guest:         guest._id,
      room:          room._id,
      checkInDate:   new Date(),
      checkOutDate:  daysAhead(nights),
      numberOfGuests: 1,
      status:        "Confirmed",
      totalAmount:   nights * room.pricePerNight,
      handledBy:     receptionist._id,
    });
  }

  const bookings = await Booking.create(bookingsData);
  console.log(`📅 ${bookings.length} bookings created`);

  /* ── 6. Invoices (for checked-out bookings) ── */
  const checkedOut = bookings.filter(b => b.status === "CheckedOut");
  const invoicesData = checkedOut.map(b => {
    const room       = rooms.find(r => r._id.equals(b.room));
    const roomCharges = b.totalAmount;
    const extra       = rand([0, 0, 50, 80, 120]);
    const subtotal    = roomCharges + extra;
    const taxAmount   = parseFloat((subtotal * 0.1).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));
    return {
      booking:    b._id,
      guest:      b.guest,
      roomCharges,
      additionalCharges: extra > 0 ? [{ description: "Room Service", amount: extra }] : [],
      taxRate:    0.1,
      taxAmount,
      totalAmount,
      paymentStatus: rand(["Paid", "Paid", "Paid", "Pending"]),
      paymentMethod: rand(["Card", "Cash", "Online"]),
      generatedBy: receptionist._id,
    };
  });
  const invoices = await Invoice.create(invoicesData);
  console.log(`🧾 ${invoices.length} invoices created`);

  /* ── 7. Housekeeping tasks ── */
  const hkStaff = staff.find(s => s.role === "Housekeeping");
  const cleaningRooms = rooms.filter(r => r.status === "Cleaning").slice(0, 4);
  const tasksData = cleaningRooms.map((room, i) => ({
    room:       room._id,
    assignedTo: hkStaff._id,
    assignedBy: admin._id,
    taskType:   rand(["Cleaning", "Turndown", "DeepCleaning", "Inspection"]),
    status:     rand(["Pending", "InProgress", "Completed"]),
    notes:      `Post checkout cleaning for Room ${room.roomNumber}`,
  }));
  if (tasksData.length > 0) {
    await HousekeepingTask.create(tasksData);
    console.log(`🧹 ${tasksData.length} housekeeping tasks created`);
  }

  /* ── 8. Service requests ── */
  const activeBookings = bookings.filter(b => b.status === "CheckedIn");
  const serviceTypes   = ["RoomService", "WakeUpCall", "Transportation", "Laundry"];
  const servicesData   = activeBookings.slice(0, 4).map(b => ({
    guest:       b.guest,
    booking:     b._id,
    room:        b.room,
    serviceType: rand(serviceTypes),
    description: "Guest requested service",
    status:      rand(["Pending", "InProgress", "Completed"]),
    charge:      rand([0, 25, 50, 75]),
  }));
  if (servicesData.length > 0) {
    await ServiceRequest.create(servicesData);
    console.log(`🛎  ${servicesData.length} service requests created`);
  }

  /* ── Summary ── */
  console.log("\n🎉 Demo data seeded successfully!");
  console.log("─────────────────────────────────────────");
  console.log("  LOGIN CREDENTIALS:");
  console.log("  Admin       → admin@luxurystay.com     / Admin@123");
  console.log("  Manager     → manager@luxurystay.com   / Manager@123");
  console.log("  Receptionist→ reception@luxurystay.com / Reception@123");
  console.log("  Housekeeping→ housekeeping@luxurystay.com / Housekeeping@123");
  console.log("  Guest       → alex.thompson@email.com  / Guest@123");
  console.log("─────────────────────────────────────────");

  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
