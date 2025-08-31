import axios from "./axios";

export const registerRequest = async (user) => {
  const response = await axios.post("/register", user);
  if (response.data.token) {
    localStorage.setItem("authToken", response.data.token); // Guardar token
  }
  return response;
};

export const loginRequest = async (user) => {
  const response = await axios.post("/login", user);
  if (response.data.token) {
    localStorage.setItem("authToken", response.data.token); // Guardar token
  }
  return response;
};

export const logoutRequest = async () => {
  const response = await axios.post("/logout");
  localStorage.removeItem("authToken"); // Eliminar token del localStorage
  return response;
};

export const verifyTokenRequest = async () => {
  return axios.get("/verify");
};
