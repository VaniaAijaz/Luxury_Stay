import API from "./axios";

/* GET ALL USERS */
export const getUsers = async () => {
  const res = await API.get("/users");
  return res.data?.users ?? res.data;
};

/* GET USER BY ID */
export const getUserById = async (id) => {
  const res = await API.get(`/users/${id}`);
  return res.data?.user ?? res.data;
};

/* CREATE STAFF (Admin only — protected route) */
export const createStaff = async (data) => {
  const res = await API.post("/users", data);
  return res.data?.user ?? res.data;
};

/* UPDATE USER */
export const updateUser = async (id, data) => {
  const res = await API.put(`/users/${id}`, data);
  return res.data?.user ?? res.data;
};

/* DEACTIVATE USER */
export const deactivateUser = async (id) => {
  const res = await API.delete(`/users/${id}`);
  return res.data;
};

/* ACTIVATE USER */
export const activateUser = async (id) => {
  const res = await API.patch(`/users/${id}/activate`);
  return res.data;
};
