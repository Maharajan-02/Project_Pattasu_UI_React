import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    navigate("/login");
  };

  // 🔍 Debounced search trigger for home page
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (onSearch && location.pathname === "/") {
        onSearch(search);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, onSearch, location.pathname]);

  // ⛔ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* LEFT: Logo + Home */}
        <div className="flex items-center gap-x-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/resources/logo.png" alt="Surya Pyro Park" className="h-8 w-auto" />
            <span className="text-xl font-bold text-[#C0392B] mb-2">Surya Pyro Park</span>
          </Link>
          <Link to="/" className="text-black font-medium hover:underline mb-0.5">Home</Link>
        </div>

        {/* CENTER: Search bar only on home */}
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

        {/* RIGHT: User Icon & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            <FaUserCircle size={28} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
              {!token ? (
                <>
                  <Link to="/login" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Login</Link>
                  <Link to="/register" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link to="/cart" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">View Cart</Link>
                  <Link to="/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Order Details</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
