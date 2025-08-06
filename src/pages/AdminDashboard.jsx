import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaClipboardList, FaInfoCircle } from "react-icons/fa";
import Cookies from "js-cookie";
import api from "../api/axios";
import { showToast } from "../context/showToasts";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("token");
        const response = await api.get("/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        showToast("error", "Failed to load dashboard stats");
        // Keep default values (0) if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const options = [
    {
      title: "Add Product",
      description: "Add new products to your inventory",
      icon: <FaPlus className="text-green-600" size={32} />,
      action: () => navigate("/admin/add-product"),
      bgColor: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-200",
    },
    {
      title: "Manage Products",
      description: "Edit, update, or remove existing products",
      icon: <FaEdit className="text-blue-600" size={32} />,
      action: () => navigate("/admin/manage-products"),
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      title: "View Orders",
      description: "Monitor and manage customer orders",
      icon: <FaClipboardList className="text-orange-500" size={32} />,
      action: () => navigate("/admin/orders"),
      bgColor: "bg-orange-50 hover:bg-orange-100",
      borderColor: "border-orange-200",
    },
    {
      title: "Contact Information",
      description: "Add or update store contact details",
      icon: <FaInfoCircle className="text-purple-600" size={32} />,
      action: () => navigate("/admin/contact"),
      bgColor: "bg-purple-50 hover:bg-purple-100",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your store efficiently with these quick actions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {options.map((opt, index) => (
            <div
              key={index}
              onClick={opt.action}
              className={`${opt.bgColor} ${opt.borderColor} border-2 rounded-xl p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">{opt.icon}</div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {opt.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Quick Stats
            </h3>
            {loading ? (
              <div className="text-gray-500">Loading stats...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalProducts}
                  </div>
                  <div className="text-gray-600">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalOrders}
                  </div>
                  <div className="text-gray-600">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.pendingOrders}
                  </div>
                  <div className="text-gray-600">Pending Orders</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

