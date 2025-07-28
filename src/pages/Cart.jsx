import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const { fetchCartCount } = useCart();

  const fetchCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data || []);
      calculateTotal(res.data || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        showToast(
          "warn",
          err?.response?.data?.message ||
            err?.response?.data ||
            err.message ||
            "Session expired. Please log in again."
        );
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/login");
      } else {
        showToast(
          "error",
          err?.response?.data?.message ||
            err?.response?.data ||
            err.message ||
            "Failed to load cart"
        );
      }
    }
  };

  const calculateTotal = (items) => {
    const totalValue = items.reduce((acc, item) => {
      const product = item.product;
      const isAvailable = product.active && product.stockQuantity > 0; // <-- Changed from isActive to active
      return isAvailable ? acc + item.quantity * product.price : acc;
    }, 0);
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
      showToast("warn", "Please enter a delivery address.");
      return;
    }

    const unavailableItems = cartItems.filter(
      (item) =>
        !item.product.active || item.product.stockQuantity <= 0 // <-- Changed from isActive to active
    );

    if (unavailableItems.length > 0) {
      const names = unavailableItems.map((item) => item.product.name).join(", ");
      showToast("warn", `Some products are unavailable: ${names}`);
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
      showToast("success", "Order placed successfully!");
      setCartItems([]);
      fetchCartCount();
      navigate("/orders");
    } catch (err) {
      console.error("Order placement error:", err);
      showToast("error", "Failed to place order");
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
            {cartItems.map((item) => {
              const product = item.product;
              const notAvailable = !product.active || product.stockQuantity <= 0; // <-- Changed from isActive to active

              return (
                <li
                  key={item.id}
                  className={`flex justify-between items-center border p-4 rounded ${
                    notAvailable ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{product.price} × {item.quantity}
                    </p>
                    {notAvailable && (
                      <p className="text-red-500 font-medium text-sm">
                        Product Not Available
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {notAvailable ? (
                      // Show remove button for unavailable items
                      <button
                        onClick={() => removeItem(product.productId)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    ) : (
                      // Show quantity controls for available items
                      <>
                        <button
                          onClick={() =>
                            updateQuantity(product.productId, item.quantity - 1)
                          }
                          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          −
                        </button>
                        <span className="text-md">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(product.productId, item.quantity + 1)
                          }
                          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
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
