// File: src/pages/Cart.jsx

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const CartContext = createContext();
  const useCart = () => useContext(CartContext);

  const fetchCart = async () => {
    if (!token) return;

    try {
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data || []);
      calculateTotal(res.data || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      toast.error("Failed to load cart");
    }
  };

  const calculateTotal = (items) => {
    const totalValue = items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );
    setTotal(totalValue.toFixed(2));
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return;
    if (quantity <= 0) return removeItem(productId);

    try {
      await api.post(
        "/cart/add",
        { productId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const placeOrder = async () => {
    if (!address.trim()) {
      toast.warn("Please enter a delivery address.");
      return;
    }

    try {
      await api.post(
        "/order/place",
        { address },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      console.error("Order placement error:", err);
      toast.error("Failed to place order");
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border p-4 rounded"
              >
                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    ₹{item.product.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.productId, item.quantity - 1)
                    }
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    −
                  </button>
                  <span className="text-md">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.productId, item.quantity + 1)
                    }
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <label className="block mb-2 font-medium">Delivery Address</label>
            <textarea
              rows="3"
              className="w-full border p-2 rounded"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full address"
            ></textarea>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-lg font-bold">Total: ₹{total}</span>
            <button
              onClick={placeOrder}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
