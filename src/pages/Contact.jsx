import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { showToast } from "../context/showToasts";

function Contact() {
  const [contact, setContact] = useState({
    shopName: "",
    address: "",
    phoneNumner: "",
    mailId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchContact = async () => {
      try {
        const res = await api.get("/contact", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) setContact(res.data);
      } catch (err) {
        // If not found, keep fields empty for new entry
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [navigate]);

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = Cookies.get("token");
    try {
      await api.post("/contact/update", contact, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("success", "Contact information saved!");
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to save contact information."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Contact Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={contact.shopName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Address</label>
          <textarea
            name="address"
            value={contact.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phoneNumner"
            value={contact.phoneNumner}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Mail ID</label>
          <input
            type="email"
            name="mailId"
            value={contact.mailId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

export default Contact;