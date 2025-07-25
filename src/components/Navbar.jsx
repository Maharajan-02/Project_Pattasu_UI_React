import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import Cookies from "js-cookie"; // <-- Add this line

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const role = Cookies.get("role"); // <-- Use Cookies here
  const token = Cookies.get("token"); // <-- Use Cookies here
  const { cartCount, fetchCartCount } = useCart();

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    setDropdownOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (onSearch && location.pathname === "/") {
        onSearch(search);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, onSearch, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Only fetch cart if user is logged in
  useEffect(() => {
    if (token) {
      fetchCartCount();
    }
  }, [token, fetchCartCount]);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* LEFT: Logo + Name + Home */}
        <div className="flex items-center gap-x-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/resources/logo.png" alt="Surya Pyro Park" className="h-8 w-auto" />
            <span className="text-xl font-bold text-[#C0392B] mb-2">Surya Pyro Park</span>
          </Link>
          <Link to="/" className="text-black font-medium hover:underline mb-0.5">Home</Link>
        </div>

        {/* CENTER: Search bar (only on home) */}
        {location.pathname === "/" && (
          <div className="flex-grow max-w-md mx-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crackers..."
              className="w-full border rounded px-4 py-2"
            />
          </div>
        )}

        {/* RIGHT: Cart icon + User Dropdown */}
        <div className="flex items-center gap-4 relative">
          {token && (
            <button onClick={() => navigate("/cart")} title="View Cart" className="relative">
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <div ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              <FaUserCircle size={28} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full right-2 mt-1 w-40 bg-white border rounded shadow-lg z-50">
                {!token ? (
                  <>
                    <Link to="/login" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Login</Link>
                    <Link to="/register" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Sign Up</Link>
                  </>
                ) : (
                  <>
                    {role === "admin" ? (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Admin Dashboard</Link>
                    ) : (
                      <Link to="/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Order Details</Link>
                    )}
                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
