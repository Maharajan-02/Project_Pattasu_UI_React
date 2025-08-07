import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";

// Memoized Product Card Component
const ProductCard = React.memo(({ 
  product, 
  quantity, 
  onUpdateQuantity, 
  isUpdating 
}) => {
  const hasDiscount = product.discount > 0;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-48 w-full object-contain rounded bg-gray-50"
        loading="lazy" // Lazy loading for better performance
      />
      <div className="p-4 flex-grow">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm text-gray-600 min-h-[48px]">
          {product.description}
        </p>
        
        {/* Price section with discount logic */}
        <div className="mt-1">
          {hasDiscount ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 line-through text-sm">
                ₹{product.price.toFixed(2)}
              </span>
              <span className="text-green-600 font-bold">
                ₹{product.finalPrice.toFixed(2)}
              </span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                {product.discount.toFixed(0)}% OFF
              </span>
            </div>
          ) : (
            <p className="text-green-600 font-bold">
              ₹{product.price.toFixed(2)}
            </p>
          )}
        </div>
      </div>
      
      <div className="p-4 pt-0">
        {isOutOfStock ? (
          <p className="text-red-600 font-semibold">Out of Stock</p>
        ) : quantity > 0 ? (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
              disabled={isUpdating}
            >
              -
            </button>
            <span className="text-md font-semibold min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isUpdating}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => onUpdateQuantity(product.id, 1)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={isUpdating}
          >
            {isUpdating ? "Adding..." : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
});

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
  
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();

  // Memoize token to prevent unnecessary re-renders
  const token = useMemo(() => Cookies.get("token"), []);

  // Memoized cart quantity lookup
  const cartQuantityMap = useMemo(() => {
    const map = new Map();
    cart.forEach(item => {
      map.set(item.product.productId, item.quantity);
    });
    return map;
  }, [cart]);

  // Optimized quantity getter
  const getQuantity = useCallback((productId) => {
    return cartQuantityMap.get(productId) || 0;
  }, [cartQuantityMap]);

  // Debounced page size effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      const parsed = Number(pageSizeInput);
      if (!pageSizeInput || parsed < 1 || isNaN(parsed)) {
        setPageSizeInput("9");
        setPageSize(9);
      } else if (parsed !== pageSize) {
        setPageSize(parsed);
        setPage(0); // Reset to first page when changing page size
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [pageSizeInput, pageSize]);

  // Optimized fetch functions
  const fetchProducts = useCallback(async (pageNumber, search = "") => {
    setLoading(true);
    try {
      const res = await api.get(
        `/products/active?page=${pageNumber}&size=${pageSize}&search=${encodeURIComponent(search)}`
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
  }, [pageSize]);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data || []);
    } catch (err) {
      console.error("Error loading cart", err);
    }
  }, [token]);

  const fetchContact = useCallback(async () => {
    try {
      const res = await api.get("/contact");
      setContact(res.data);
    } catch (err) {
      console.error("Failed to load contact info", err);
    }
  }, []);

  // Optimized update quantity with better error handling
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!token) {
      showToast("warn", "Please log in to modify cart");
      return;
    }

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
      await Promise.all([fetchCart(), fetchCartCount()]);
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
  }, [token, fetchCart, fetchCartCount]);

  // Pagination handlers
  const handlePrevPage = useCallback(() => {
    setPage(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(prev => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  const handlePageSizeChange = useCallback((e) => {
    setPageSizeInput(e.target.value);
  }, []);

  // Effects
  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  useEffect(() => {
    if (searchQuery !== "") {
      setPage(0);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts(page, searchQuery);
  }, [page, searchQuery, fetchProducts]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Memoized cart info - fixed to show unique product count
  const cartInfo = useMemo(() => ({
    uniqueProductCount: cart.length, // Number of unique products
    totalQuantity: cart.reduce((sum, item) => sum + item.quantity, 0), // Total quantity
    hasItems: cart.length > 0
  }), [cart]);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      {products.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          <p className="text-lg">No products found.</p>
          {searchQuery && (
            <p className="text-sm mt-2">
              Try adjusting your search terms or browse all products.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Cart Button - Only show when cart has items */}
          {cartInfo.hasItems && (
            <div className="mb-4 text-right">
              <button
                onClick={() => navigate("/cart")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                🛒 View Cart ({cartInfo.uniqueProductCount} {cartInfo.uniqueProductCount === 1 ? 'item' : 'items'})
              </button>
            </div>
          )}

          {/* Products per page controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing {products.length} of {totalProducts} products
              {searchQuery && (
                <span className="ml-2 text-blue-600">
                  for "{searchQuery}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm">
                Products per page:
              </label>
              <input
                id="pageSize"
                type="number"
                min={1}
                max={50}
                value={pageSizeInput}
                onChange={handlePageSizeChange}
                className="w-24 border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getQuantity(product.id)}
                onUpdateQuantity={updateQuantity}
                isUpdating={updatingProductId === product.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                disabled={page === 0}
                onClick={handlePrevPage}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <span className="px-4 py-2 font-semibold">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={handleNextPage}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Contact Section */}
      <div className="mt-12 max-w-xl mx-auto bg-white shadow rounded p-6">
        <h3 className="text-xl font-bold mb-4 text-center">Contact Us</h3>
        {contact ? (
          <div className="space-y-2">
            <div className="flex flex-wrap">
              <span className="font-semibold min-w-[100px]">Shop Name:</span> 
              <span>{contact.shopName}</span>
            </div>
            <div className="flex flex-wrap">
              <span className="font-semibold min-w-[100px]">Address:</span> 
              <span>{contact.address}</span>
            </div>
            <div className="flex flex-wrap">
              <span className="font-semibold min-w-[100px]">Phone:</span> 
              <a href={`tel:${contact.phoneNumber}`} className="text-blue-600 hover:underline">
                {contact.phoneNumber}
              </a>
            </div>
            <div className="flex flex-wrap">
              <span className="font-semibold min-w-[100px]">Email:</span> 
              <a href={`mailto:${contact.mailId}`} className="text-blue-600 hover:underline">
                {contact.mailId}
              </a>
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