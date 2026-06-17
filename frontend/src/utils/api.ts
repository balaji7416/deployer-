import axios from "axios";
const base_url = "http://localhost:3000/api";

const api = axios.create({
  baseURL: base_url,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
