import { useEffect } from "react";
import api from "../api/axios";
import { showToast } from "../context/showToasts";

const AuthValidator = () => {
  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        // No need to manually attach token; browser sends HttpOnly cookie automatically
        await api.get("/auth/validate", {
          withCredentials: true, // Ensure cookies are sent if backend is on a different domain
        });
      } catch (err) {
        showToast(
          "warn",
          err?.response?.data?.message ||
            err?.response?.data ||
            err.message ||
            "Session expired. Please log in again."
        );
        window.location.href = "/login";
      }
    };

    checkTokenValidity();
  }, []);

  return null;
};

export default AuthValidator;
