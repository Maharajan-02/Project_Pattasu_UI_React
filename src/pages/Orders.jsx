import React, { useEffect, useState } from "react";
import api from "../axios";
import Loader from "../components/Loader";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/order", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOrders(res.data || []);
      } catch (err) {
        alert("Failed to load orders. Please log in.");
        console.error(err);
      }
    };

    fetchOrders();
  }, []);

  const downloadInvoice = async (orderId) => {
    try {
        setLoadig (true);
        const res = await api.get(`/order/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
        });
        setLoadig (false);
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
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="border border-gray-300 rounded-lg shadow-sm p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-600">
                    Order ID: <span className="font-medium">{order.orderId}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) : "N/A"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {order.status || "Pending"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {(order.orderItemDto || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-2 flex items-start gap-4"
                  >
                    <img
                      src={item.product?.imageUrl || ""}
                      alt={item.product?.name || "Product image"}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold">{item.product?.name || "Unnamed product"}</p>
                      <p className="text-sm text-gray-600">
                        ₹{typeof item.price === "number" ? item.price.toFixed(2) : "0.00"} × {item.quantity || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm">
                  <span className="font-medium">Address:</span> {order.address || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Items:</span> {order.numberOfItems || 0}
                </p>
                <button
                  onClick={() => downloadInvoice(order.orderId)}
                  className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-blue-700"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
