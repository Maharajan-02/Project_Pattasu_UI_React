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
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const { fetchCartCount } = useCart();

  // Fetch user's last saved address
  const fetchUserAddress = async () => {
    if (!token) return;

    try {
      setIsLoadingAddress(true);
      const res = await api.get("/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data && res.data.address) {
        setAddress(res.data.address);
      }
    } catch (err) {
      // Don't show error for missing address, it's optional
      console.log("No saved address found or error fetching user data:", err);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const fetchCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setCartItems(data);
      calculateTotal(data);
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
      const price = item?.finalPrice ?? item?.product?.price ?? 0;
      const quantity = item?.quantity ?? 0;
      const isAvailable = item?.product?.active && item?.product?.stockQuantity > 0;
      return isAvailable ? acc + price * quantity : acc;
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
      showToast("error", "Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
      fetchCartCount();
    } catch (err) {
      console.error("Error removing item:", err);
      showToast("error", "Failed to remove item");
    }
  };

  // Check if order can be placed
  const canPlaceOrder = () => {
    const hasValidAddress = address.trim().length > 0;
    const hasAvailableItems = cartItems.some(
      (item) => item.product.active && item.product.stockQuantity > 0
    );
    return hasValidAddress && hasAvailableItems && cartItems.length > 0;
  };

  const placeOrder = async () => {
    if (!address.trim()) {
      showToast("warn", "Please enter a delivery address.");
      return;
    }

    const unavailableItems = cartItems.filter(
      (item) => !item.product.active || item.product.stockQuantity <= 0
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
      setTotal(0);
      fetchCartCount();
      navigate("/orders");
    } catch (err) {
      console.error("Order placement error:", err);
      showToast(
        "error", 
        err?.response?.data?.message || "Failed to place order"
      );
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUserAddress();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              const notAvailable = !product.active || product.stockQuantity <= 0;
              const price = item?.finalPrice ?? product?.price ?? 0;
              const originalPrice = product?.price ?? 0;
              const quantity = item?.quantity ?? 0;
              const discount = item?.discount ?? 0;

              return (
                <li
                  key={item.id}
                  className={`flex justify-between items-center border p-4 rounded ${
                    notAvailable ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={product.imageUrl || ''}
                      alt={product.name}
                      className="w-16 h-16 object-contain rounded bg-gray-50"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>

                      <div className="text-sm text-gray-600">
                        {discount > 0 ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                              {discount.toFixed(0)}% OFF
                            </span>
                            <span className="text-gray-500 line-through text-xs">
                              ₹{originalPrice.toFixed(2)}
                            </span>
                            <span className="text-green-600 font-medium">
                              ₹{price.toFixed(2)}
                            </span>
                            <span>× {quantity}</span>
                          </div>
                        ) : (
                          <span>
                            ₹{originalPrice.toFixed(2)} × {quantity}
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-medium text-gray-800 mt-1">
                        Item Total: ₹{(price * quantity).toFixed(2)}
                      </div>

                      {notAvailable && (
                        <p className="text-red-500 font-medium text-sm">
                          Product Not Available
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {notAvailable ? (
                      <button
                        onClick={() => removeItem(product.productId)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            updateQuantity(product.productId, quantity - 1)
                          }
                          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          −
                        </button>
                        <span className="text-md min-w-[2rem] text-center">{quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(product.productId, quantity + 1)
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
            <label className="block mb-2 font-medium">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            {isLoadingAddress ? (
              <div className="w-full border p-2 rounded bg-gray-50 text-gray-500">
                Loading saved address...
              </div>
            ) : (
              <textarea
                rows="3"
                className={`w-full border p-2 rounded focus:outline-none focus:border-blue-500 ${
                  !address.trim() ? 'border-red-300' : 'border-gray-300'
                }`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete delivery address with pincode"
                required
              />
            )}
            {!address.trim() && (
              <p className="text-red-500 text-xs mt-1">Delivery address is required</p>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-lg font-bold">
              Total: ₹{total}
              {cartItems.some(item => !item.product.active || item.product.stockQuantity <= 0) && (
                <p className="text-sm text-red-500 font-normal">
                  (Unavailable items excluded)
                </p>
              )}
            </div>
            
            <button
              onClick={placeOrder}
              disabled={!canPlaceOrder()}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                canPlaceOrder()
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
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
