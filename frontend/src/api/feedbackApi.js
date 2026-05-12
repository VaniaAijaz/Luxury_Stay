import API from "./axios";

/* GET PUBLIC FEEDBACK */
export const getFeedbacks = async () => {
  const res = await API.get("/feedback");
  return res.data?.feedbacks ?? res.data;
};

/* GET ALL FEEDBACK (ADMIN) */
export const getAllFeedbacksAdmin = async () => {
  const res = await API.get("/feedback/all");
  return res.data?.feedbacks ?? res.data;
};

/* SUBMIT FEEDBACK */
export const submitFeedback = async (data) => {
  const res = await API.post("/feedback", data);
  return res.data?.feedback ?? res.data;
};

/* DELETE FEEDBACK */
export const deleteFeedback = async (id) => {
  const res = await API.delete(`/feedback/${id}`);
  return res.data;
};
