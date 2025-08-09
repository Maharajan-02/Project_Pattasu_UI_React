import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";

// Memoized Product Card Component with improved alignment
const ProductCard = React.memo(({ 
  product, 
  quantity, 
  onUpdateQuantity, 
  isUpdating 
}) => {
  const hasDiscount = product.discount > 0;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden h-full flex flex-col">
      {/* Square Image Container */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>
      
      {/* Content Section - Fixed Height for Consistent Cards */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* Product Info */}
        <div className="flex-grow">
          <h2 className="text-lg font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">
            {product.name}
          </h2>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3 min-h-[4rem]">
            {product.description}
          </p>
          
          {/* Price Section */}
          <div className="mb-4">
            {hasDiscount ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-500 line-through text-sm">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                    {product.discount.toFixed(0)}% OFF
                  </span>
                </div>
                <div className="text-green-600 font-bold text-lg">
                  ₹{product.finalPrice.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-green-600 font-bold text-lg">
                ₹{product.price.toFixed(2)}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons - Always at Bottom */}
        <div className="mt-auto">
          {isOutOfStock ? (
            <div className="text-center">
              <p className="text-red-600 font-semibold mb-2">Out of Stock</p>
              <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Unavailable</span>
              </div>
            </div>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
              <button
                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                disabled={isUpdating}
              >
                -
              </button>
              <span className="text-lg font-semibold px-4">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                disabled={isUpdating}
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              disabled={isUpdating}
            >
              {isUpdating ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
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
  const [pageSize, setPageSize] = useState(10);
  const [pageSizeInput, setPageSizeInput] = useState("10");
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
        setPageSizeInput("10");
        setPageSize(10);
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
    const product = products.find(p => p.id === productId);
    if (!product) {
      showToast("error", "Product not found.");
      return;
    }

    if (quantity > product.stockQuantity) {
      showToast("warn", `Only ${product.stockQuantity} in stock. You can't add more.`);
      return;
    }

    if (quantity < 0) return;

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
  }, [token, fetchCart, fetchCartCount, products]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {products.length === 0 ? (
          <div className="text-center text-gray-600 mt-20">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold mb-2">No products found</h2>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try adjusting your search terms.`
                  : "No products are currently available."
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Section - Cart Button & Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              {/* Left: Search Results Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchQuery ? `Search Results` : 'Our Products'}
                </h1>
                <div className="text-sm text-gray-600">
                  Showing {products.length} of {totalProducts} products
                  {searchQuery && (
                    <span className="ml-2 text-blue-600 font-medium">
                      for "{searchQuery}"
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Cart Button & Page Size */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Cart Button */}
                {cartInfo.hasItems && (
                  <button
                    onClick={() => navigate("/cart")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                  >
                    🛒 View Cart ({cartInfo.uniqueProductCount} {cartInfo.uniqueProductCount === 1 ? 'item' : 'items'})
                  </button>
                )}

                {/* Products per page */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">
                    Per page:
                  </label>
                  <input
                    id="pageSize"
                    type="number"
                    min={1}
                    max={50}
                    value={pageSizeInput}
                    onChange={handlePageSizeChange}
                    className="w-16 border border-gray-300 px-2 py-1 rounded focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Product Grid - Improved Responsive Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
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
              <div className="flex justify-center items-center gap-2 mb-12">
                <button
                  disabled={page === 0}
                  onClick={handlePrevPage}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {/* Page Numbers */}
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index;
                    } else if (page < 3) {
                      pageNum = index;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 5 + index;
                    } else {
                      pageNum = page - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page + 1 >= totalPages}
                  onClick={handleNextPage}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Section - Fixed at Bottom */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h3>
            <p className="text-gray-600">We'd love to hear from you. Contact us for any queries.</p>
          </div>
          
          {contact ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🏪</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{contact.shopName}</div>
                    <div className="text-gray-600 text-sm">Store Name</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">📍</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{contact.address}</div>
                    <div className="text-gray-600 text-sm">Our Location</div>
                  </div>
                </div>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">📞</span>
                  </div>
                  <div>
                    <a 
                      href={`tel:${contact.phoneNumber}`} 
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {contact.phoneNumber}
                    </a>
                    <div className="text-gray-600 text-sm">Call us directly</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-lg">✉️</span>
                  </div>
                  <div>
                    <a 
                      href={`mailto:${contact.mailId}`} 
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {contact.mailId}
                    </a>
                    <div className="text-gray-600 text-sm">Send us an email</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default Home;