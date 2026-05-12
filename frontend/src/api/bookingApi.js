import API from "./axios";

/* GET ALL BOOKINGS */
export const getBookings = async () => {
  const res = await API.get("/bookings");
  return res.data?.bookings ?? res.data;
};

/* GET MY BOOKINGS */
export const getMyBookings = async () => {
  const res = await API.get("/bookings/my");
  return res.data?.bookings ?? res.data;
};

/* GET BOOKING BY ID */
export const getBookingById = async (id) => {
  const res = await API.get(`/bookings/${id}`);
  return res.data?.booking ?? res.data;
};

/* CREATE BOOKING */
export const createBooking = async (data) => {
  const res = await API.post("/bookings", data);
  return res.data?.booking ?? res.data;
};

/* UPDATE BOOKING */
export const updateBooking = async (id, data) => {
  const res = await API.put(`/bookings/${id}`, data);
  return res.data?.booking ?? res.data;
};

/* CANCEL BOOKING */
export const cancelBooking = async (id) => {
  const res = await API.delete(`/bookings/${id}`);
  return res.data;
};
