import { useEffect } from "react";
import api from "../api/axios";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts"; // <-- Import your toast utility

const AuthValidator = () => {
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        await api.get("/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        Cookies.remove("token");
        Cookies.remove("role");
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

  return null; // No UI to render
};

export default AuthValidator;
