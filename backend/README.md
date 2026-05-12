# 🏨 LuxuryStay Hospitality — Backend API

A clean, modular MERN Stack backend for a Hotel Management System built with Node.js, Express.js, MongoDB, and Mongoose.

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, Login, Logout, Me
│   ├── userController.js      # User CRUD & role management
│   ├── roomController.js      # Room CRUD & availability
│   ├── bookingController.js   # Reservations
│   ├── checkInOutController.js# Check-in / Check-out
│   ├── invoiceController.js   # Billing & invoices
│   ├── housekeepingController.js # Housekeeping tasks
│   ├── maintenanceController.js  # Maintenance requests
│   ├── feedbackController.js  # Guest feedback & ratings
│   └── serviceController.js   # Room service, wake-up, transport
├── middlewares/
│   ├── auth.js                # JWT protect + role authorize
│   ├── errorHandler.js        # Global error handler
│   ├── validate.js            # express-validator result handler
│   └── upload.js              # Multer file upload config
├── models/
│   ├── User.js
│   ├── Room.js
│   ├── Booking.js
│   ├── Invoice.js
│   ├── Feedback.js
│   ├── MaintenanceRequest.js
│   ├── ServiceRequest.js
│   └── HousekeepingTask.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── roomRoutes.js
│   ├── bookingRoutes.js
│   ├── checkInOutRoutes.js
│   ├── invoiceRoutes.js
│   ├── housekeepingRoutes.js
│   ├── maintenanceRoutes.js
│   ├── feedbackRoutes.js
│   └── serviceRoutes.js
├── utils/
│   ├── generateToken.js       # JWT token generator
│   └── errorResponse.js       # Custom error class
├── uploads/                   # Uploaded room images
├── .env                       # Environment variables
├── .gitignore
├── server.js                  # App entry point
└── package.json
```

---

## ⚙️ Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Edit .env with your MongoDB URI and JWT secret

# 3. Start development server
npm run dev

# 4. Start production server
npm start
```

---

## 🔐 Environment Variables (.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/luxurystay
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=10
```

---

## 👥 User Roles

| Role          | Description                              |
|---------------|------------------------------------------|
| Admin         | Full access to everything                |
| Manager       | Manage rooms, bookings, staff tasks      |
| Receptionist  | Handle check-in/out, bookings, invoices  |
| Housekeeping  | View and update assigned cleaning tasks  |
| Guest         | Book rooms, request services, feedback   |

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /api/auth/register    | Public  | Register user        |
| POST   | /api/auth/login       | Public  | Login & get token    |
| GET    | /api/auth/me          | Private | Get own profile      |
| POST   | /api/auth/logout      | Private | Logout               |

### Users
| Method | Endpoint                    | Access        | Description         |
|--------|-----------------------------|---------------|---------------------|
| GET    | /api/users                  | Admin/Manager | Get all users       |
| GET    | /api/users/:id              | Admin/Manager | Get user by ID      |
| PUT    | /api/users/:id              | Admin/Own     | Update user         |
| DELETE | /api/users/:id              | Admin         | Deactivate user     |
| PATCH  | /api/users/:id/activate     | Admin         | Reactivate user     |

### Rooms
| Method | Endpoint                        | Access        | Description              |
|--------|---------------------------------|---------------|--------------------------|
| GET    | /api/rooms                      | Public        | Get all rooms            |
| GET    | /api/rooms/availability         | Public        | Check availability       |
| GET    | /api/rooms/:id                  | Public        | Get room by ID           |
| POST   | /api/rooms                      | Admin/Manager | Create room              |
| PUT    | /api/rooms/:id                  | Admin/Manager | Update room              |
| DELETE | /api/rooms/:id                  | Admin         | Delete room              |

### Bookings
| Method | Endpoint              | Access              | Description           |
|--------|-----------------------|---------------------|-----------------------|
| GET    | /api/bookings         | Staff               | Get all bookings      |
| GET    | /api/bookings/my      | Guest               | Get own bookings      |
| GET    | /api/bookings/:id     | Private             | Get booking by ID     |
| POST   | /api/bookings         | Private             | Create booking        |
| PUT    | /api/bookings/:id     | Staff               | Update booking        |
| DELETE | /api/bookings/:id     | Private             | Cancel booking        |

### Check-In / Check-Out
| Method | Endpoint                  | Access              | Description     |
|--------|---------------------------|---------------------|-----------------|
| POST   | /api/checkin/:bookingId   | Staff               | Check in guest  |
| POST   | /api/checkout/:bookingId  | Staff               | Check out guest |

### Invoices
| Method | Endpoint                      | Access  | Description              |
|--------|-------------------------------|---------|--------------------------|
| GET    | /api/invoices                 | Staff   | Get all invoices         |
| GET    | /api/invoices/:id             | Private | Get invoice by ID        |
| POST   | /api/invoices                 | Staff   | Generate invoice         |
| PATCH  | /api/invoices/:id/payment     | Staff   | Update payment status    |

### Housekeeping
| Method | Endpoint                  | Access              | Description         |
|--------|---------------------------|---------------------|---------------------|
| GET    | /api/housekeeping         | Staff/Housekeeping  | Get all tasks       |
| POST   | /api/housekeeping         | Admin/Manager       | Assign task         |
| PUT    | /api/housekeeping/:id     | Staff/Housekeeping  | Update task status  |
| DELETE | /api/housekeeping/:id     | Admin/Manager       | Delete task         |

### Maintenance
| Method | Endpoint                  | Access        | Description              |
|--------|---------------------------|---------------|--------------------------|
| GET    | /api/maintenance          | Staff         | Get all requests         |
| GET    | /api/maintenance/:id      | Private       | Get request by ID        |
| POST   | /api/maintenance          | Private       | Create request           |
| PUT    | /api/maintenance/:id      | Admin/Manager | Update request           |
| DELETE | /api/maintenance/:id      | Admin         | Delete request           |

### Feedback
| Method | Endpoint              | Access        | Description              |
|--------|-----------------------|---------------|--------------------------|
| GET    | /api/feedback         | Public        | Get public reviews       |
| GET    | /api/feedback/all     | Admin/Manager | Get all reviews          |
| POST   | /api/feedback         | Guest         | Submit feedback          |
| DELETE | /api/feedback/:id     | Admin         | Delete feedback          |

### Services
| Method | Endpoint              | Access        | Description              |
|--------|-----------------------|---------------|--------------------------|
| GET    | /api/services         | Staff         | Get all service requests |
| GET    | /api/services/my      | Guest         | Get own requests         |
| POST   | /api/services         | Guest/Staff   | Create service request   |
| PUT    | /api/services/:id     | Staff         | Update service request   |

---

## 🔒 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Validation**: express-validator
- **File Upload**: Multer
- **Logging**: Morgan
