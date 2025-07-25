import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../context/showToasts";
import BASE_URL from "../config";
import Cookies from "js-cookie";

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(9);
  const [pageSizeInput, setPageSizeInput] = useState("9");
  const navigate = useNavigate();

  const fetchProducts = async (pageNumber = 0, search = "", size = 9) => {
    try {
      const res = await api.get(`/products?page=${pageNumber}&size=${size}&search=${encodeURIComponent(search)}`);
      setProducts(res.data?.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalProducts(res.data.totalElements || 0);
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Error fetching product list"
      );
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      showToast("success", "Product deleted successfully");
      fetchProducts(page, debouncedSearch, pageSize);
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Failed to delete product"
      );
    }
  };

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // reset to page 0 on new search
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Debounce pageSize input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const parsed = Number(pageSizeInput);
      if (!pageSizeInput || parsed < 1 || isNaN(parsed)) {
        setPageSizeInput("9");
        setPageSize(9);
      } else {
        setPageSize(parsed);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [pageSizeInput]);

  useEffect(() => {
    fetchProducts(page, debouncedSearch, pageSize);
  }, [page, debouncedSearch, pageSize]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-64"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm">Products per page:</label>
            <input
              id="pageSize"
              type="number"
              min={1}
              value={pageSizeInput}
              onChange={(e) => setPageSizeInput(e.target.value)}
              className="w-20 border px-2 py-2 rounded"
            />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded shadow p-4 flex flex-col justify-between"
              >
                <img
                  src={`${BASE_URL}${product.imageUrl}`}
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

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className={`px-4 py-2 rounded ${
                page === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {page + 1} of {totalPages} — Showing {products.length} of {totalProducts} products
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
              className={`px-4 py-2 rounded ${
                page >= totalPages - 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminProductList;
