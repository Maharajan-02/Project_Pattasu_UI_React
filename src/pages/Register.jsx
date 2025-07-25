import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie"; // <-- Add this import
import { showToast } from "../context/showToasts"; // <-- Add this import


function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const token = Cookies.get("token"); // <-- Use Cookies here

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/"); // or /admin based on role
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);
      showToast("success", "OTP sent to your email.");
      localStorage.setItem("pendingEmail", form.email);
      navigate("/otp", { state: { email: form.email } });
    } catch (error) {
      showToast(
        "error",
        error?.response?.data?.message ||
          (typeof error.response?.data === "string" && error.response.data) ||
          error.message ||
          "Registration failed."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 shadow-md rounded w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>

        {["name", "email", "password", "phoneNumber"].map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium mb-1 capitalize">
              {field}
            </label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
