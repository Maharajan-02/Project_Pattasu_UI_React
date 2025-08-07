// File: src/pages/AddProduct.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";

function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    discount: "",
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Memoize token check to prevent unnecessary re-renders
  const token = useMemo(() => Cookies.get("token"), []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Memoized validation constants
  const validation = useMemo(() => ({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minDiscount: 0,
    maxDiscount: 100
  }), []);

  // Optimized form change handler with useCallback
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Optimized image change handler
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file size
    if (file.size > validation.maxFileSize) {
      showToast("error", "Image size must be less than 5MB");
      e.target.value = ""; // Clear the input
      // Clear the preview states when validation fails
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      return;
    }
    
    // Validate file type
    if (!validation.allowedTypes.includes(file.type)) {
      showToast("error", "Only JPEG, PNG, and WebP images are allowed");
      e.target.value = ""; // Clear the input
      // Clear the preview states when validation fails
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      return;
    }
    
    setImageFile(file);

    // Clean up previous preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Create new preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }, [imagePreview, validation]);

  // Optimized toggle handler
  const handleToggle = useCallback(() => {
    setProduct(prev => ({ ...prev, active: !prev.active }));
  }, []);

  // Memoized calculated price to avoid recalculation on every render
  const discountedPrice = useMemo(() => {
    if (!product.price || !product.discount) return null;
    
    const price = parseFloat(product.price);
    const discount = parseFloat(product.discount);
    
    if (isNaN(price) || isNaN(discount)) return null;
    
    return (price * (1 - discount / 100)).toFixed(2);
  }, [product.price, product.discount]);

  // Form validation
  const isFormValid = useMemo(() => {
    const { name, description, price, stockQuantity } = product;
    const discount = parseFloat(product.discount) || 0;
    
    return (
      name.trim() &&
      description.trim() &&
      price &&
      stockQuantity &&
      imageFile &&
      discount >= validation.minDiscount &&
      discount <= validation.maxDiscount
    );
  }, [product, imageFile, validation]);

  // Reset form function
  const resetForm = useCallback(() => {
    setProduct({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      discount: "",
      active: true,
    });
    setImageFile(null);
    
    // Clean up preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imagePreview]);

  // Optimized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast("error", "Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", product.name.trim());
    formData.append("description", product.description.trim());
    formData.append("price", product.price);
    formData.append("stockQuantity", product.stockQuantity);
    formData.append("discount", product.discount || "0");
    formData.append("active", product.active);
    formData.append("image", imageFile);

    try {
      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("success", "Product added successfully!");
      resetForm();

    } catch (err) {
      console.error("Add product error", err);
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to add product."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, product, imageFile, token, resetForm]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        {/* Product Name */}
        <input
          type="text"
          name="name"
          placeholder="Product Name *"
          value={product.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
          required
          disabled={isSubmitting}
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description *"
          value={product.description}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500 resize-none"
          rows={3}
          required
          disabled={isSubmitting}
        />
        
        {/* Price and Discount Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Price (₹) *"
            value={product.price}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount (%)"
            value={product.discount}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
            min="0"
            max="100"
            step="0.01"
            disabled={isSubmitting}
          />
        </div>

        {/* Price Preview - Only show when both values exist */}
        {discountedPrice && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Original:</span>
                <div className="text-gray-600">₹{parseFloat(product.price).toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Discount:</span>
                <div className="text-red-600">{product.discount}%</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Final:</span>
                <div className="text-green-600 font-bold">₹{discountedPrice}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Quantity */}
        <input
          type="number"
          name="stockQuantity"
          placeholder="Stock Quantity *"
          value={product.stockQuantity}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
          min="0"
          required
          disabled={isSubmitting}
        />

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
          <span className="font-medium">Product Status:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={product.active}
              onChange={handleToggle}
              disabled={isSubmitting}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {product.active ? "Active" : "Inactive"}
            </span>
          </label>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-contain border rounded bg-white"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Image Preview</p>
              <p className="text-xs text-gray-500">{imageFile?.name}</p>
            </div>
          </div>
        )}

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Max size: 5MB. Formats: JPEG, PNG, WebP
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-2 rounded font-medium transition-colors ${
            isFormValid && !isSubmitting
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
