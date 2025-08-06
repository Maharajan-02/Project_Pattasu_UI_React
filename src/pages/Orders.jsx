import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";
import Cookies from "js-cookie";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
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
          Cookies.remove("token");
          Cookies.remove("role");
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
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
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
                      {(order.orderItemDto || []).map((item, idx) => {
                        const product = item.product || {};
                        const hasDiscount = product.discount && product.discount > 0;
                        const itemPrice = item.price || product.finalPrice || product.price || 0;
                        const originalPrice = product.price || 0;
                        const quantity = item.quantity || 0;

                        return (
                          <div key={idx} className="border rounded p-2 flex items-start gap-4">
                            <img
                              src={product.imageUrl || ''}
                              alt={product.name || 'Product'}
                              className="w-16 h-16 object-contain rounded bg-gray-50"
                            />
                            <div>
                              <p className="font-semibold">{product.name || 'Unknown Product'}</p>
                              
                              <div className="text-sm text-gray-600">
                                {hasDiscount ? (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                                        {product.discount.toFixed(0)}% OFF
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500 line-through text-xs">
                                        ₹{originalPrice.toFixed(2)}
                                      </span>
                                      <span className="text-green-600 font-medium">
                                        ₹{(product.finalPrice || itemPrice).toFixed(2)}
                                      </span>
                                    </div>
                                    <span>× {quantity}</span>
                                  </div>
                                ) : (
                                  <span>₹{itemPrice.toFixed(2)} × {quantity}</span>
                                )}
                              </div>
                              
                              <div className="text-sm font-medium text-gray-800 mt-1">
                                Total: ₹{(itemPrice * quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order details section */}
                    <div className="mt-4 space-y-2">
                      {order.trackingId && (
                        <p className="text-sm">
                          <span className="font-medium">Tracking ID:</span> {order.trackingId}
                        </p>
                      )}

                      {/* Add logistics partner */}
                      {order.logisticsPartner && (
                        <p className="text-sm">
                          <span className="font-medium">Logistics Partner:</span> {order.logisticsPartner}
                        </p>
                      )}

                      <p className="text-sm">
                        <span className="font-medium">Address:</span> {order.address}
                      </p>
                    </div>

                    <button 
                      onClick={() => downloadInvoice(order.orderId)} 
                      className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                    >
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
