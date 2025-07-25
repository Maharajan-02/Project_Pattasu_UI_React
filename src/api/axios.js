import axios from "axios";
import { showToast } from "../context/showToasts"; // <-- Use your toast utility
import { loaderInstance } from "../utils/loaderSingleton";
import BASE_URL from "../config";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
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
    showToast(
      "error",
      error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Something went wrong"
    );
    return Promise.reject(error);
  }
);

export default api;
