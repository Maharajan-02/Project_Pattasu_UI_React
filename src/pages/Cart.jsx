import React, { useEffect, useState } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCartItems(res.data || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      await api.post("/cart/add", { productId, quantity });
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const placeOrder = async () => {
    if (!address.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    try {
      await api.post("/order/place", 
        { address },
      {
        headers: { "Content-Type": "application/json" },
      });
      alert("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      alert("Error placing order.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
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
                  <p>₹{item.product.price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.productId, item.quantity - 1)
                    }
                    className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    −
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.productId, item.quantity + 1)
                    }
                    className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
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

          <button
            onClick={placeOrder}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Place Order
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
