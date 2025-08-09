import axios from "axios";
import { showToast } from "../context/showToasts"; // <-- Use your toast utility
import { loaderInstance } from "../utils/loaderSingleton";
import BASE_URL from "../config";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    loaderInstance.set(true);
    return config;
  },
  (error) => {
    loaderInstance.set(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    loaderInstance.set(false);
    return response;
  },
  (error) => {
    loaderInstance.set(false);
    
    // Only redirect on authentication errors, not all errors
    if (error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("role");
      window.location.href = "/login";
    } else {
      // Show toast for other errors
      showToast(
        "error",
        error?.response?.data?.message ||
          error?.response?.data ||
          error.message ||
          "Something went wrong"
      );
    }
    
    return Promise.reject(error);
  }
);

export default api;
