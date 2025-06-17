import { useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const AuthValidator = () => {
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await api.get("/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.warning("Session expired. Please log in again.");
        window.location.href = "/login"; // redirect before rendering anything else
      }
    };

    checkTokenValidity();
  }, []);

  return null; // No UI to render
};

export default AuthValidator;
