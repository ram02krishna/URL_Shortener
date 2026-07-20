import api from "./api";

export const loginUser = (data) => {
  return api.post("/user/login", data);
};

export const registerUser = (data) => {
  return api.post("/user/signup", data);
};

export const verifyEmail = (data) => {
  return api.post("/user/verify-email", data);
};

export const forgotPassword = (data) => {
  return api.post("/user/forgot-password", data);
};

export const resetPassword = (data) => {
  return api.post("/user/reset-password", data);
};

export const changePassword = (data) => {
  return api.post("/user/change-password", data);
};
