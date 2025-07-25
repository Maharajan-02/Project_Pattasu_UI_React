// File: src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import Contact from "./pages/Contact";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoaderProvider, useLoader } from "./context/LoaderContext";
import { loaderInstance } from "./utils/loaderSingleton";
import Loader from "./components/Loader";
import { CartProvider } from "./context/CartContext";
import AdminProductList from "./pages/AdminProductList";
import EditProduct from "./pages/EditProduct";
import AuthValidator from "./components/AuthValidator";
import AdminOrderList from "./pages/AdminOrderList";
import { useCart } from "./context/CartContext";
import Cookies from "js-cookie";
import api from "./api/axios";
import { showToast } from "./context/showToasts"; // <-- Use your toast utility

function AppContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const token = Cookies.get("token"); // <-- Use cookies
  const isAuthenticated = !!token;
  const { loading, setLoading } = useLoader();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = Cookies.get("token"); // <-- Use cookies
      if (!token) return;

      try {
        await api.get("/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        Cookies.remove("token");
        Cookies.remove("role");
        showToast("warn", 
          err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Session expired. Please log in again."
        );
        window.location.href = "/login";
      }
    };

    checkTokenValidity();
  }, []);

  useEffect(() => {
    fetchCartCount();
  }, [isAuthenticated]);

  useEffect(() => {
    loaderInstance.register(setLoading);
  }, [setLoading]);

  return (
    <Router>
      {loading && <Loader />}
      <AuthValidator />
      <Navbar onSearch={setSearchQuery} cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/otp" element={isAuthenticated ? <Navigate to="/" /> : <OtpVerification />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/manage-products" element={<AdminProductList />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route path="/admin/orders" element={<AdminOrderList />} />
        <Route path="/admin/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={1500} />
    </Router>
  );
}

function App() {
  return (
    <LoaderProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </LoaderProvider>
  );
}

export default App;
