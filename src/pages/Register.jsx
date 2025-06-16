import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import Loader from "../components/Loader";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
        setLoading(true);
        await api.post("/auth/register", form);
        setLoading(false);
        alert("OTP sent to your email.");
        localStorage.setItem("pendingEmail", form.email);       
        navigate("/otp", { state: { email: form.email } });
    } catch (error) {
        let message = "Registration failed.";

        if (error.response && typeof error.response.data === "string") {
            message = error.response.data;
        }
        alert(message);
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
