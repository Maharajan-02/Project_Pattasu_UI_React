import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";

function OtpVerification() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = Cookies.get("token");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      showToast("warn", "User data missing. Please re-register.");
      navigate("/register");
    }
  }, [navigate]);

  // Cooldown timer countdown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.post("/auth/verify-otp", { email, otp });
      showToast("success", "OTP verified! You can now log in.");
      localStorage.removeItem("pendingEmail"); // Clean up
      navigate("/login");
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post("/auth/register", { email });
      showToast("success", "OTP resent to your email.");
      setCooldown(60);
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to resend OTP. Please re-register."
      );
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaEnvelope className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 text-sm">
            We've sent a verification code to
          </p>
          <p className="font-medium text-gray-800">{email}</p>
        </div>

        {/* Check Mail Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-blue-600 text-lg mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium text-sm mb-1">
                Check your email inbox
              </p>
              <p className="text-blue-700 text-xs">
                Please check your email (including spam folder) for the 6-digit verification code.
              </p>
            </div>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              required
              className="w-full text-center text-2xl tracking-widest border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
          {cooldown > 0 ? (
            <p className="text-gray-500 text-sm">
              You can resend OTP in {cooldown} second{cooldown !== 1 && "s"}
            </p>
          ) : (
            <button
              onClick={resendOtp}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Back to Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              localStorage.removeItem("pendingEmail");
              navigate("/register");
            }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;
