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
