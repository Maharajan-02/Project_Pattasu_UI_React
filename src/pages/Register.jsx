import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const token = Cookies.get("token");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Validation functions
  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    return password === confirmPassword;
  };

  // Handle input changes with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value) error = "Name is required";
        else if (!validateName(value)) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!validateEmail(value)) error = "Please enter a valid email address";
        break;
      case "phoneNumber":
        if (!value) error = "Phone number is required";
        else if (!validatePhone(value)) error = "Please enter a valid 10-digit mobile number";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (!validatePassword(value)) error = "Password must be at least 6 characters";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (!validateConfirmPassword(formData.password, value)) error = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Check if form is valid
  const isFormValid = () => {
    const { name, email, phoneNumber, password, confirmPassword } = formData;
    return (
      name &&
      email &&
      phoneNumber &&
      password &&
      confirmPassword &&
      validateName(name) &&
      validateEmail(email) &&
      validatePhone(phoneNumber) &&
      validatePassword(password) &&
      validateConfirmPassword(password, confirmPassword) &&
      Object.values(errors).every(error => !error)
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    if (!isFormValid()) {
      showToast("error", "Please fix all validation errors");
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      };

      await api.post("/auth/register", registerData);
      showToast("success", "OTP sent to your email.");
      localStorage.setItem("pendingEmail", formData.email);
      navigate("/otp", { state: { email: formData.email } });
    } catch (error) {
      console.error("Registration error:", error);
      showToast(
        "error",
        error?.response?.data?.message ||
          (typeof error.response?.data === "string" && error.response.data) ||
          error.message ||
          "Registration failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 shadow-md rounded w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>

        {/* Name Field */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Enter your full name"
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Enter your email"
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Phone Field */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            className={`w-full p-2 border rounded ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            required
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>

        {/* Password Field with Eye Icon */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={`w-full p-2 pr-10 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? (
                <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password Field with Eye Icon */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className={`w-full p-2 pr-10 border rounded ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex="-1"
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Submit Button - Only enabled when form is valid */}
        <button
          type="submit"
          className={`w-full py-2 rounded font-medium transition-colors ${
            isFormValid() && !isLoading
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline"
              disabled={isLoading}
            >
              Login
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}

export default Register;
