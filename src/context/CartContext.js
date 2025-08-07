// File: src/context/CartContext.jsx

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import Cookies from "js-cookie";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize token to prevent unnecessary re-renders
  const token = useMemo(() => Cookies.get("token"), []);

  // Optimized fetch cart count - count unique products only
  const fetchCartCount = useCallback(async () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Count unique products (length of cart array)
      const uniqueProductCount = Array.isArray(res.data) ? res.data.length : 0;
      
      setCartCount(uniqueProductCount);
    } catch (err) {
      console.error("Error fetching cart count:", err);
      
      // If unauthorized, clear cart count
      if (err.response?.status === 401) {
        setCartCount(0);
        Cookies.remove("token");
        Cookies.remove("role");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Clear cart count when user logs out
  const clearCartCount = useCallback(() => {
    setCartCount(0);
  }, []);

  // Update cart count without full refetch (for performance)
  const updateCartCount = useCallback((change) => {
    setCartCount(prev => Math.max(0, prev + change));
  }, []);

  // Set cart count directly (useful after cart operations)
  const setCartCountDirect = useCallback((count) => {
    setCartCount(Math.max(0, count));
  }, []);

  // Initial fetch on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [token, fetchCartCount]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    cartCount,
    fetchCartCount,
    clearCartCount,
    updateCartCount,
    setCartCount: setCartCountDirect,
    isLoading
  }), [cartCount, fetchCartCount, clearCartCount, updateCartCount, setCartCountDirect, isLoading]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}
