import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";

function Home({ searchQuery }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [pageSizeInput, setPageSizeInput] = useState("9");
  const [contact, setContact] = useState(null);
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const { fetchCartCount } = useCart();

  const fetchProducts = async (pageNumber, search = "") => {
    setLoading(true);
    try {
      const res = await api.get(
        `/products/active?page=${pageNumber}&size=${pageSize}&search=${search}`
      );
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalProducts(res.data.totalElements || 0);
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data || []);
    } catch (err) {
      console.error("Error loading cart", err);
    }
  };

  const getQuantity = (productId) => {
    const item = cart.find((item) => item.product.productId === productId);
    return item ? item.quantity : 0;
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return showToast("warn", "Please log in to modify cart");
    setUpdatingProductId(productId);
    try {
      if (quantity > 0) {
        await api.post(
          "/cart/add",
          { productId, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.delete(`/cart/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchCart();
      fetchCartCount();
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to update cart"
      );
    } finally {
      setUpdatingProductId(null);
    }
  };

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await api.get("/contact");
        setContact(res.data);
      } catch (err) {
        console.error("Failed to load contact info", err);
      }
    };
    fetchContact();
  }, []);

  useEffect(() => {
    if (searchQuery !== "") {
      setPage(0);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts(page, searchQuery);
  }, [page, searchQuery, pageSize]);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const parsed = Number(pageSizeInput);
      if (!pageSizeInput || parsed < 1 || isNaN(parsed)) {
        setPageSizeInput("9");
        setPageSize(9);
      } else {
        setPageSize(parsed);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [pageSizeInput]);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      {products.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No products found.</p>
      ) : (
        <>
          {cart.length > 0 && (
            <div className="mb-4 text-right">
              <button
                onClick={() => navigate("/cart")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                🛒 View Cart ({cart.length} items)
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing {products.length} of {totalProducts} products
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm">Products per page:</label>
              <input
                id="pageSize"
                type="number"
                min={1}
                value={pageSizeInput}
                onChange={(e) => setPageSizeInput(e.target.value)}
                className="w-24 border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const quantity = getQuantity(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <img
                    // src={`${BASE_URL}${product.imageUrl}`}
                    src={`${product.imageUrl}`}
                    alt={product.name}
                    className="h-48 w-full object-cover rounded"
                  />
                  <div className="p-4 flex-grow">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-600 min-h-[48px]">
                      {product.description}
                    </p>
                    <p className="text-green-600 font-bold mt-1">
                      ₹{product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 pt-0">
                    {product.stockQuantity === 0 ? (
                      <p className="text-red-600 font-semibold">Out of Stock</p>
                    ) : quantity > 0 ? (
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-3 py-1 text-white bg-red-500 rounded"
                          disabled={updatingProductId === product.id}
                        >
                          -
                        </button>
                        <span className="text-md font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-3 py-1 text-white bg-blue-500 rounded"
                          disabled={updatingProductId === product.id}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={updatingProductId === product.id}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2 font-semibold">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      <div className="mt-12 max-w-xl mx-auto bg-white shadow rounded p-6">
        <h3 className="text-xl font-bold mb-4 text-center">Contact Us</h3>
        {contact ? (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Shop Name:</span> {contact.shopName}
            </div>
            <div>
              <span className="font-semibold">Address:</span> {contact.address}
            </div>
            <div>
              <span className="font-semibold">Phone Number:</span> {contact.phoneNumber}
            </div>
            <div>
              <span className="font-semibold">Mail ID:</span> {contact.mailId}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            Loading contact information...
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;