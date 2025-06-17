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
import AdminOrders from "./pages/AdminOrders";
import AddProduct from "./pages/AddProduct";
import Analytics from "./pages/Analytics";
import Contact from "./pages/Contact";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoaderProvider, useLoader } from "./context/LoaderContext";
import { loaderInstance } from "./utils/loaderSingleton";
import Loader from "./components/Loader";
import api from "./api/axios"; // ensure this path is correct
import { CartProvider } from "./context/CartContext";
import AdminProductList from "./pages/AdminProductList";
import EditProduct from "./pages/EditProduct";
import AuthValidator from "./components/AuthValidator";

function AppContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const { loading, setLoading } = useLoader();

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const fetchCartCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const totalItems = res.data.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalItems);
    } catch (err) {
      console.error("Error fetching cart count:", err);
    }
  };

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
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/manage-products" element={<AdminProductList />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/contact" element={<Contact />} />
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
