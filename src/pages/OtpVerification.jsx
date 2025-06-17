import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from 'react-toastify';

function OtpVerification() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/"); // or /admin based on role
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.warn("User data missing. Please re-register.");
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
    try {
        await api.post("/auth/verify-otp", { email, otp });
        toast.success("OTP verified! You can now log in.");
        navigate("/login");
    } catch (err) {
      toast.error("Invalid or expired OTP. Please try again.");
    }
  };

  const resendOtp = async () => {
    try {
      await api.post("/auth/register", {
        email, // Just email is enough since backend will update OTP if pending
      });
      toast.success("OTP resent to your email.");
      setCooldown(60); // Start 60 sec cooldown
    } catch (err) {
      toast.error("Failed to resend OTP. Please re-register.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Enter OTP</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full border px-4 py-2 mb-4 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Verify OTP
        </button>
      </form>

      {/* Cooldown & Resend OTP */}
      <div className="mt-4 text-center">
        {cooldown > 0 ? (
          <p className="text-gray-500 text-sm">
            You can resend OTP in {cooldown} second{cooldown !== 1 && "s"}...
          </p>
        ) : (
          <button
            onClick={resendOtp}
            className="text-sm text-blue-600 hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

export default OtpVerification;
