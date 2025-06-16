import axios from "axios";

const instance = axios.create({
//   baseURL: "https://project-pattasu.onrender.com/api",
    baseURL: "http://localhost:8080/api",
});

// Add the token to every request (if available)
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
