import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import Cookies from "js-cookie";

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const role = Cookies.get("role");
  const token = Cookies.get("token");
  const { cartCount, fetchCartCount } = useCart();

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    setDropdownOpen(false);
    setMobileMenuOpen(false);
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

  useEffect(() => {
    if (token) {
      fetchCartCount();
    }
  }, [token, fetchCartCount]);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* LEFT: Logo + Name */}
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img 
              src="/resources/logo.png" 
              alt="Surya Pyro Park" 
              className="h-8 w-8 flex-shrink-0" 
            />
            <span className="text-lg sm:text-xl font-bold text-[#C0392B] truncate">
              Surya Pyro Park
            </span>
          </Link>
        </div>

        {/* CENTER: Search bar (Desktop only, on home page) */}
        {location.pathname === "/" && (
          <div className="hidden md:flex flex-grow max-w-md mx-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crackers..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* RIGHT: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Home
            </Link>
            {role === "admin" && (
              <Link to="/admin" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Cart Icon */}
          {token && (
            <button 
              onClick={() => navigate("/cart")} 
              title="View Cart" 
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FaUserCircle size={24} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {!token ? (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setDropdownOpen(false)} 
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setDropdownOpen(false)} 
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    {role === "admin" ? (
                      <Link 
                        to="/admin" 
                        onClick={() => setDropdownOpen(false)} 
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link 
                        to="/orders" 
                        onClick={() => setDropdownOpen(false)} 
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Order Details
                      </Link>
                    )}
                    <button 
                      onClick={logout} 
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          {/* Cart Icon (Mobile) */}
          {token && (
            <button 
              onClick={() => navigate("/cart")} 
              title="View Cart" 
              className="relative p-2 text-gray-700"
            >
              <FaShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (when on home page) */}
      {location.pathname === "/" && (
        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crackers..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {/* Navigation Links */}
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 font-medium"
            >
              Home
            </Link>
            {role === "admin" && (
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 font-medium"
              >
                Admin Dashboard
              </Link>
            )}

            {/* User Menu */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {!token ? (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block py-2 text-gray-700"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block py-2 text-gray-700"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {role === "admin" ? (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="block py-2 text-gray-700"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to="/orders" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="block py-2 text-gray-700"
                    >
                      Order Details
                    </Link>
                  )}
                  <button 
                    onClick={logout} 
                    className="block w-full text-left py-2 text-gray-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
