import axios from "axios";

const base_url = "/api";

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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status === 401) {
      window.dispatchEvent(new Event("unauthorized"));
    }
    return Promise.reject(err);
  },
);

export default api;
