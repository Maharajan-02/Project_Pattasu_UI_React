import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaHome } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 py-2">
        {/* LEFT SECTION: Logo + Home */}
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img
              src="/resources/logo.png"
              alt="Surya Pyro Park"
              className="h-8 w-auto align-middle"
            />
          </Link>
          <Link to="/" className="text-xl font-bold text-[#C0392B] mb-2 align-middle">
            Surya Pyro Park
          </Link>
          <Link to="/" className="text-black font-medium hover:underline mb-1 align-middle">
            Home
          </Link>
        </div>

        {/* CENTER SECTION: Search */}
        <div className="flex-grow max-w-md mx-8">
          <input
            type="text"
            placeholder="Search crackers..."
            className="w-full border rounded px-4 py-2"
            disabled
          />
        </div>

        {/* RIGHT SECTION: User Icon */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            <FaUserCircle size={28} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
              {!token ? (
                <>
                  <Link to="/login" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Sign In</Link>
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