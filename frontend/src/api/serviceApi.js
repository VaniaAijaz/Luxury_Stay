import API from "./axios";

/* GET ALL SERVICES */
export const getServiceRequests = async () => {
  const res = await API.get("/services");
  return res.data?.requests ?? res.data?.serviceRequests ?? res.data;
};

/* GET MY SERVICES */
export const getMyServiceRequests = async () => {
  const res = await API.get("/services/my");
  return res.data?.requests ?? res.data?.serviceRequests ?? res.data;
};

/* CREATE SERVICE REQUEST */
export const createServiceRequest = async (data) => {
  const res = await API.post("/services", data);
  return res.data?.serviceRequest ?? res.data;
};

/* UPDATE SERVICE REQUEST */
export const updateServiceRequest = async (id, data) => {
  const res = await API.put(`/services/${id}`, data);
  return res.data?.serviceRequest ?? res.data;
};
