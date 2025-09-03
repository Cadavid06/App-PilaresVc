import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

// AÑADE ESTO:
// Este interceptor intercepta cada solicitud antes de que se envíe.
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // Obtiene el token del almacenamiento local
  if (token) {
    // Si el token existe, lo añade al encabezado de la solicitud
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; // Devuelve la configuración para que la solicitud continúe
});

export default instance;
