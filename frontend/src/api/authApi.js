import API from "./axios";

/* REGISTER */
export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

/* LOGIN */
export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

/* GET CURRENT USER */
export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

/* LOGOUT */
export const logoutUser = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};