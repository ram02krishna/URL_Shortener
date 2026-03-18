import api from "./api";

// LOGIN
export const loginUser = (data) => {
  return api.post("/user/login", data);
};

// REGISTER
export const registerUser = (data) => {
  return api.post("/user/signup", data);
};

// VERIFY EMAIL
export const verifyEmail = (data) => {
  return api.post("/user/verify-email", data);
};

// FORGOT PASSWORD
export const forgotPassword = (data) => {
  return api.post("/user/forgot-password", data);
};

// RESET PASSWORD
export const resetPassword = (data) => {
  return api.post("/user/reset-password", data);
};

// CHANGE PASSWORD
export const changePassword = (data) => {
  return api.post("/user/change-password", data);
};
