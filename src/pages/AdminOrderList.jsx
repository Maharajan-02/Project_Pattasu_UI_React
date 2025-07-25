// File: src/pages/AdminOrders.jsx

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts"; // <-- Add this import

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({});
  const [trackingUpdate, setTrackingUpdate] = useState({});

  const fetchOrders = async () => {
    try {
      const res = await api.get("order/allOrders", {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      setOrders(res.data || []);
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to load orders"
      );
    }
  };

  const handleUpdate = async (orderId) => {
    try {
      const status = statusUpdate[orderId];
      const trackingId = trackingUpdate[orderId];

      await api.put(
        "/order/update",
        {
          id: orderId,
          orderStatus: status,
          trackingId,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      showToast("success", "Order updated successfully");
      fetchOrders();
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to update order"
      );
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">All Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 mb-4 shadow transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  Order ID: <span className="text-blue-700">{order.id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => toggleExpand(order.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                {expandedOrderId === order.id ? "Hide Details" : "View Details"}
              </button>
            </div>

           {expandedOrderId === order.id && (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="font-semibold">User Info:</p>
                  <p className="text-gray-700 whitespace-pre-line">
                    <strong>Name :</strong> {order.userName}<br />
                    <strong>Email :</strong> {order.userEmail}<br />
                    <strong>Phone :</strong> {order.userPhone}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Delivery Address:</p>
                  <p className="text-gray-700 whitespace-pre-line">
                    {order.deliveryAddress}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Products:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {order.items?.map((item) => (
                      <li key={item.id}>
                        {item.product?.name} — Quantity: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block font-medium mb-1">
                      Order Status
                    </label>
                    <select
                      className="w-full border p-2 rounded"
                      value={statusUpdate[order.id] || order.orderStatus}
                      onChange={(e) =>
                        setStatusUpdate((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="PLACED">Placed</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="RETURNED">Returned</option>
                      <option value="REFUNDED">Refunded</option>
                      <option ption value="FAILED">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Tracking ID
                    </label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded"
                      placeholder="Tracking ID"
                      value={trackingUpdate[order.id] || order.trackingId || ""}
                      onChange={(e) =>
                        setTrackingUpdate((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleUpdate(order.id)}
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Update Order
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;
