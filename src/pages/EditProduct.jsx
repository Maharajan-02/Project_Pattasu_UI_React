import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Cookies from "js-cookie";
import BASE_URL from "../config";
import { showToast } from "../context/showToasts";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get("page") || 1;

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    active: true,
    imageUrl: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // <-- Add image preview state

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct({ 
          ...res.data, 
          active: res.data.active ?? true
        });
      } catch (err) {
        showToast("error", err?.response?.data?.message || "Failed to load product");
      }
    };
    fetchProduct();
  }, [id]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Create preview URL for the selected image
    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
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
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("price", product.price);
      formData.append("stockQuantity", product.stockQuantity);
      formData.append("active", product.active);
      
      if (file) {
        formData.append("image", file);
      } else if (product.imageUrl) {
        formData.append("imageUrl", product.imageUrl);
      }

      await api.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      showToast("success", "Product updated successfully");
      navigate(`/admin/manage-products?page=${page}`);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to update product");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-4 py-2 rounded"
          rows={3}
          required
        />
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="number"
          name="stockQuantity"
          value={product.stockQuantity}
          onChange={handleChange}
          placeholder="Stock Quantity"
          className="w-full border px-4 py-2 rounded"
          required
        />

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

        {/* Show current image if no new file selected */}
        {!imagePreview && product.imageUrl && (
          <div className="mb-2">
            <img
              src={`${product.imageUrl}`}
              alt="Current"
              className="w-32 h-32 object-cover border rounded"
            />
            <p className="text-sm text-gray-500">Current Image</p>
          </div>
        )}

        {/* Show preview of newly selected image */}
        {imagePreview && (
          <div className="mb-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover border rounded"
            />
            <p className="text-sm text-gray-500">New Image Preview</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
