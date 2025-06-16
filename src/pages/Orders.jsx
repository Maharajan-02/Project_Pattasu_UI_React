import React, { useEffect, useState } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to view orders.");
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get("/order", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error("Error loading orders:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.clear();
          navigate("/login");
        } else {
          alert("Failed to load orders.");
        }
      }
    };

    fetchOrders();
  }, [navigate]);

  const toggleOrder = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/order/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download invoice", err);
      alert("Invoice download failed");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:max-w-5xl md:mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;

            return (
              <div key={order.orderId} className="border rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p><span className="font-semibold">Order ID:</span> {order.orderId}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(order.orderDate).toLocaleDateString("en-IN")}</p>
                    <p><span className="font-semibold">Items:</span> {order.numberOfItems}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-semibold">{order.status}</p>
                    <button onClick={() => toggleOrder(order.orderId)} className="text-sm text-gray-600 underline">
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {(order.orderItemDto || []).map((item, idx) => (
                        <div key={idx} className="border rounded p-2 flex items-start gap-4">
                          <img src={item.product?.imageUrl || ""} alt={item.product?.name} className="w-16 h-16 object-cover rounded" />
                          <div>
                            <p className="font-semibold">{item.product?.name}</p>
                            <p className="text-sm text-gray-600">₹{item.price?.toFixed(2)} × {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm mt-4"><span className="font-medium">Address:</span> {order.address}</p>
                    <button onClick={() => downloadInvoice(order.orderId)} className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-blue-700">
                      Download Invoice
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
