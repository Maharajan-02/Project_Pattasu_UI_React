// File: src/pages/AdminProductList.jsx

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async (pageNumber, search = "") => {
    try {
      const res = await api.get(`/products?page=${pageNumber}&size=8&search=${search}`);
      setProducts(res.data.content || res.data || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("Error fetching product list");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Product deleted successfully");
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  useEffect(() => {
      fetchProducts(page, searchQuery);
    }, [page, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded shadow p-4 flex flex-col justify-between"
            >
              <img
                src={`http://localhost:8080${product.imageUrl}`}
                alt={product.name}
                className="h-40 w-full object-cover mb-4"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-green-600 font-bold mt-1">
                ₹{product.price?.toFixed(2)}
              </p>
              <p className="text-sm">Stock: {product.stockQuantity}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminProductList;
