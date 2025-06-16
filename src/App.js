import React, { useState } from "react";
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

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const isAuthenticated = !!localStorage.getItem("token");
  return (
    <Router>
      <Navbar onSearch={setSearchQuery} />
      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
        {/* Auth */}
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OtpVerification />} /> */}

        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/otp" element={isAuthenticated ? <Navigate to="/" /> : <OtpVerification />} />

        {/* User Routes */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* Other */}
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
