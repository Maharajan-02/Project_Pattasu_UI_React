import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaClipboardList, FaChartBar } from "react-icons/fa";
import Cookies from "js-cookie";

function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const options = [
    {
      title: "Add Product",
      icon: <FaPlus className="text-green-600" size={24} />,
      action: () => navigate("/admin/add-product"),
    },
    {
      title: "Edit / Delete Products",
      icon: <FaEdit className="text-blue-600" size={24} />,
      action: () => navigate("/admin/manage-products"),
    },
    {
      title: "View Orders",
      icon: <FaClipboardList className="text-orange-500" size={24} />,
      action: () => navigate("/admin/orders"),
    },
    {
      title: "Add/Update Contact Information",
      icon: <FaEdit className="text-purple-600" size={24} />,
      action: () => navigate("/admin/contact"),
    },
    // {
    //   title: "Analytics",
    //   icon: <FaChartBar className="text-purple-500" size={24} />,
    //   action: () => navigate("/admin/analytics"),
    // },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Admin Control Panel
      </h2>
      <div className="flex flex-col gap-6 min-h-[60vh] justify-center">
        {options.map((opt, index) => (
          <div
            key={index}
            onClick={opt.action}
            className="w-full border rounded-lg p-6 flex items-center gap-4 cursor-pointer shadow hover:shadow-lg transition"
          >
            {opt.icon}
            <h3 className="text-xl font-semibold">{opt.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;

