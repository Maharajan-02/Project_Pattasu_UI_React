import axios from "axios";
import { toast } from "react-toastify";
import { loaderInstance } from "../utils/loaderSingleton";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // your API
  withCredentials: true,
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
    toast.error("Something went wrong");
    return Promise.reject(error);
  }
);

export default api;
