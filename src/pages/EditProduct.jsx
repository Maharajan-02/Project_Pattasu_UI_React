import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Cookies from "js-cookie";
import { showToast } from "../context/showToasts";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Memoize query params
  const { page } = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return { page: queryParams.get("page") || 1 };
  }, [location.search]);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    discount: "",
    active: true,
    imageUrl: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized validation constants
  const validation = useMemo(() => ({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minDiscount: 0,
    maxDiscount: 100
  }), []);

  // Memoized token
  const token = useMemo(() => Cookies.get("token"), []);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/${id}`);
      const productData = res.data;
      
      // Ensure proper data types and defaults
      setProduct({
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        stockQuantity: productData.stockQuantity?.toString() || "",
        discount: productData.discount || "",
        active: productData.active ?? true, // Use nullish coalescing for default true
        imageUrl: productData.imageUrl || "",
      });
    } catch (err) {
      console.error("Fetch product error:", err);
      showToast("error", err?.response?.data?.message || "Failed to load product");
      navigate("/admin/manage-products");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  // Optimized change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Optimized file change handler
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      return;
    }

    // Validate file size
    if (selectedFile.size > validation.maxFileSize) {
      showToast("error", "Image size must be less than 5MB");
      e.target.value = "";
      return;
    }
    
    // Validate file type
    if (!validation.allowedTypes.includes(selectedFile.type)) {
      showToast("error", "Only JPEG, PNG, and WebP images are allowed");
      e.target.value = "";
      return;
    }
    
    setFile(selectedFile);
    
    // Clean up previous preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Create new preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setImagePreview(previewUrl);
  }, [imagePreview, validation]);

  // Optimized toggle handler with explicit boolean conversion
  const handleToggle = useCallback(() => {
    setProduct(prev => ({
      ...prev,
      active: !prev.active
    }));
  }, []);

  // Clear image selection
  const clearImageSelection = useCallback(() => {
    setFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imagePreview]);

  // Form validation
  const isFormValid = useMemo(() => {
    const { name, description, price, stockQuantity, discount } = product;
    const discountValue = parseFloat(discount) || 0;
    
    return (
      name.trim() &&
      description.trim() &&
      price &&
      stockQuantity &&
      discountValue >= validation.minDiscount &&
      discountValue <= validation.maxDiscount
    );
  }, [product, validation]);

  // Memoized calculated price
  const discountedPrice = useMemo(() => {
    if (!product.price || !product.discount) return null;
    
    const price = parseFloat(product.price);
    const discount = parseFloat(product.discount);
    
    if (isNaN(price) || isNaN(discount)) return null;
    
    return (price * (1 - discount / 100)).toFixed(2);
  }, [product.price, product.discount]);

  // Optimized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast("error", "Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", product.name.trim());
      formData.append("description", product.description.trim());
      formData.append("price", product.price);
      formData.append("stockQuantity", product.stockQuantity);
      formData.append("discount", product.discount || "0");
      formData.append("active", product.active.toString()); // Explicit string conversion
      
      if (file) {
        formData.append("image", file);
      } else if (product.imageUrl) {
        formData.append("imageUrl", product.imageUrl);
      }

      await api.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("success", "Product updated successfully");
      navigate(`/admin/manage-products?page=${page}`);
    } catch (err) {
      console.error("Update product error:", err);
      showToast("error", err?.response?.data?.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, product, file, id, token, page, navigate]);

  // Effects
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProduct();
  }, [token, fetchProduct, navigate]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Loading state
  if (isLoading || product.name === "") {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Product Name *"
          className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
          required
          disabled={isSubmitting}
        />

        {/* Description */}
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Description *"
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
            value={product.price}
            onChange={handleChange}
            placeholder="Price (₹) *"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />
          <div>
            <input
              type="number"
              name="discount"
              value={product.discount}
              onChange={handleChange}
              placeholder="Discount (%)"
              className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
              min="0"
              max="100"
              step="0.01"
              disabled={isSubmitting}
            />
            {/* Discount validation error */}
            {product.discount !== "" && (
              (parseFloat(product.discount) < validation.minDiscount ||
                parseFloat(product.discount) > validation.maxDiscount) && (
                <p className="text-xs text-red-600 mt-1">
                  Discount should be between 0 and 100.
                </p>
              )
            )}
          </div>
        </div>

        {/* Price Preview */}
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
          value={product.stockQuantity}
          onChange={handleChange}
          placeholder="Stock Quantity *"
          className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
          min="0"
          required
          disabled={isSubmitting}
        />

        {/* Active Status Toggle - Fixed boolean handling */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
          <span className="font-medium">Product Status:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={Boolean(product.active)} // Explicit boolean conversion
              onChange={handleToggle}
              disabled={isSubmitting}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {product.active ? "Active" : "Inactive"}
            </span>
          </label>
        </div>

        {/* Current Image Display */}
        {!imagePreview && product.imageUrl && (
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
            <img
              src={product.imageUrl}
              alt="Current"
              className="w-20 h-20 object-contain border rounded bg-white"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Current Image</p>
              <button
                type="button"
                onClick={clearImageSelection}
                className="text-xs text-blue-600 hover:underline"
                disabled={isSubmitting}
              >
                Keep current image
              </button>
            </div>
          </div>
        )}

        {/* New Image Preview */}
        {imagePreview && (
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-contain border rounded bg-white"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">New Image Preview</p>
              <p className="text-xs text-gray-500 mt-1">{file?.name}</p>
              <button
                type="button"
                onClick={clearImageSelection}
                className="text-xs text-red-600 hover:underline mt-1"
                disabled={isSubmitting}
              >
                Remove new image
              </button>
            </div>
          </div>
        )}

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
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
          {isSubmitting ? "Updating Product..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
