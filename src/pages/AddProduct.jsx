// File: src/pages/AddProduct.jsx
import React, { useState, useEffect, useRef } from "react";
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

  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Add ref for file input

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file && file.size > maxSize) {
      showToast("error", "Image size must be less than 5MB");
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (file && !allowedTypes.includes(file.type)) {
      showToast("error", "Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    
    setImageFile(file);

    // Create preview URL for the selected image
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleToggle = () => {
    setProduct((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      showToast("error", "Please select an image.");
      return;
    }

    // Validate discount percentage
    const discountValue = parseFloat(product.discount);
    if (discountValue < 0 || discountValue > 100) {
      showToast("error", "Discount must be between 0 and 100%");
      return;
    }

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("stockQuantity", product.stockQuantity);
    formData.append("discount", product.discount);
    formData.append("active", product.active);
    formData.append("image", imageFile);

    try {
      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      showToast("success", "Product added successfully!");
      
      // Reset all form data
      setProduct({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        discount: "",
        active: true,
      });
      setImageFile(null);
      setImagePreview(null);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error("Add product error", err);
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to add product."
      );
    }
  };

  // Clean up the preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Calculate discounted price for preview
  const discountedPrice = product.price && product.discount 
    ? (parseFloat(product.price) * (1 - parseFloat(product.discount) / 100)).toFixed(2)
    : null;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          rows={3}
          required
        />
        
        {/* Price and Discount in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={product.price}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            min="0"
            step="0.01"
            required
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount (%)"
            value={product.discount}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        {/* Show price calculation preview */}
        {product.price && product.discount && discountedPrice && (
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-sm">
              <span className="font-medium">Original Price:</span> ₹{parseFloat(product.price).toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Discount:</span> {product.discount}%
            </p>
            <p className="text-sm font-bold text-green-600">
              <span className="font-medium">Final Price:</span> ₹{discountedPrice}
            </p>
          </div>
        )}

        <input
          type="number"
          name="stockQuantity"
          placeholder="Stock Quantity"
          value={product.stockQuantity}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          min="0"
          required
        />

        {/* Add Active Status Toggle */}
        <div className="flex items-center gap-4">
          <span className="font-medium">Active Status:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={product.active}
              onChange={handleToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            <span className="ml-3 text-sm text-gray-700">
              {product.active ? "Active" : "Inactive"}
            </span>
          </label>
        </div>

        {/* Image Preview Section */}
        {imagePreview && (
          <div className="mb-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-contain border rounded bg-gray-50"
            />
            <p className="text-sm text-gray-500">Image Preview</p>
          </div>
        )}

        <input
          ref={fileInputRef} // Add ref to file input
          type="file"
          name="image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
