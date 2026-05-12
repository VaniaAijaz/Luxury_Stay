import API from "./axios";

/* GET ALL REQUESTS */
export const getMaintenanceRequests = async () => {
  const res = await API.get("/maintenance");
  return res.data?.requests ?? res.data;
};

/* GET REQUEST BY ID */
export const getMaintenanceRequestById = async (id) => {
  const res = await API.get(`/maintenance/${id}`);
  return res.data?.request ?? res.data;
};

/* CREATE REQUEST */
export const createMaintenanceRequest = async (data) => {
  const res = await API.post("/maintenance", data);
  return res.data?.request ?? res.data;
};

/* UPDATE REQUEST */
export const updateMaintenanceRequest = async (id, data) => {
  const res = await API.put(`/maintenance/${id}`, data);
  return res.data?.request ?? res.data;
};

/* DELETE REQUEST */
export const deleteMaintenanceRequest = async (id) => {
  const res = await API.delete(`/maintenance/${id}`);
  return res.data;
};
