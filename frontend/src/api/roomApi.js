import API from "./axios";

/* GET ALL ROOMS */
export const getRooms = async () => {
  const res = await API.get("/rooms");
  return res.data?.rooms ?? res.data;
};

/* GET ROOM BY ID */
export const getRoomById = async (id) => {
  const res = await API.get(`/rooms/${id}`);
  return res.data?.room ?? res.data;
};

/* CHECK ROOM AVAILABILITY */
export const checkRoomAvailability = async (checkIn, checkOut) => {
  const res = await API.get(
    `/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}`
  );
  return res.data?.rooms ?? res.data;
};

/* CREATE ROOM */
export const createRoom = async (data) => {
  const res = await API.post("/rooms", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.room ?? res.data;
};

/* UPDATE ROOM */
export const updateRoom = async (id, data) => {
  const res = await API.put(`/rooms/${id}`, data);
  return res.data?.room ?? res.data;
};

/* DELETE ROOM */
export const deleteRoom = async (id) => {
  const res = await API.delete(`/rooms/${id}`);
  return res.data;
};
