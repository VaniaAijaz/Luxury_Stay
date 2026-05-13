import API from "./axios";

/* GET ALL TASKS */
export const getHouseKeepingTasks = async () => {
  const res = await API.get("/housekeeping");
  return res.data?.tasks ?? res.data;
};

/* GET TASK BY ID */
export const getHouseKeepingTaskById = async (id) => {
  const res = await API.get(`/housekeeping/${id}`);
  return res.data?.task ?? res.data;
};

/* CREATE TASK */
export const createHouseKeepingTask = async (data) => {
  const res = await API.post("/housekeeping", data);
  return res.data?.task ?? res.data;
};

/* UPDATE TASK */
export const updateHouseKeepingTask = async (id, data) => {
  const res = await API.put(`/housekeeping/${id}`, data);
  return res.data?.task ?? res.data;
};

/* DELETE TASK */
export const deleteHouseKeepingTask = async (id) => {
  const res = await API.delete(`/housekeeping/${id}`);
  return res.data;
};
