import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from 'react-toastify';
import { useCart } from "../context/CartContext";

function Home({ searchQuery }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
  const token = localStorage.getItem("token");

  // Fetch products
  const fetchProducts = async (pageNumber, search = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${pageNumber}&size=8&search=${search}`);
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart
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

  // Get quantity in cart for a given product
  const getQuantity = (productId) => {
    const item = cart.find((item) => item.product.productId === productId);
    return item ? item.quantity : 0;
  };

  const { fetchCartCount } = useCart();

  // Add or remove items from cart
  const updateQuantity = async (productId, quantity) => {
    if (!token) return toast.warn("Please log in to modify cart");
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
      console.error("Cart update failed", err);
      toast.error("Failed to update cart");
    } finally {
      setUpdatingProductId(null);
    }
  };

  useEffect(() => {
    // If search changed, reset to page 0 first
    if (searchQuery !== "") {
      setPage(0);
    }
  }, [searchQuery]);

  // Fetch products whenever page or searchQuery changes
  useEffect(() => {
    fetchProducts(page, searchQuery);
  }, [page, searchQuery]);

  // Fetch cart once on mount
  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      {products.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const quantity = getQuantity(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <img
                    src={`${BASE_URL}${product.imageUrl}`}
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

          {/* Pagination */}
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
    </div>
  );
}

export default Home;
