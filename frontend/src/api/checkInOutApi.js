import API from "./axios";

/**
 * Check in a guest
 * @route  POST /api/checkin/:bookingId
 * @access Receptionist, Admin, Manager
 */
export const checkInGuest = async (bookingId) => {
  const res = await API.post(`/checkin/${bookingId}`);
  return res.data;
};

/**
 * Check out a guest
 * @route  POST /api/checkout/:bookingId
 * @access Receptionist, Admin, Manager
 */
export const checkOutGuest = async (bookingId) => {
  const res = await API.post(`/checkout/${bookingId}`);
  return res.data;
};
