import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { showToast } from "../context/showToasts";
import BASE_URL from "../config";

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(9);
  const [pageSizeInput, setPageSizeInput] = useState("9");

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentPage = parseInt(searchParams.get("page") || 1, 10) - 1;

  const fetchProducts = async (pageNumber = 0, search = "", size = 9) => {
    try {
      const res = await api.get(`/products?page=${pageNumber}&size=${size}&search=${encodeURIComponent(search)}`);
      setProducts(res.data?.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalProducts(res.data.totalElements || 0);
    } catch (err) {
      showToast("error", err?.response?.data?.message || err?.message || "Error fetching products");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

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
    fetchProducts(currentPage, debouncedSearch, pageSize);
  }, [currentPage, debouncedSearch, pageSize]);

  const handlePageChange = (newPage) => {
    navigate(`/admin/manage-products?page=${newPage + 1}`);
  };

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
                  // src={`${BASE_URL}${product.imageUrl}`}
                  src={`${product.imageUrl}`}
                  alt={product.name}
                  className="h-40 w-full object-cover mb-4"
                />
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-green-600 font-bold mt-1">
                  ₹{product.price?.toFixed(2)}
                </p>
                <p className="text-sm">Stock: {product.stockQuantity}</p>

                <p
                  className={`text-sm font-medium mt-2 px-2 py-1 rounded text-white w-fit ${
                    product.active ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {product.active ? "Active" : "Inactive"}
                </p>
                <div className="mt-3">
                  <button
                    onClick={() =>
                      navigate(`/admin/edit-product/${product.id}?page=${currentPage + 1}`)
                    }
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded ${
                currentPage === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages} — Showing {products.length} of {totalProducts} products
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`px-4 py-2 rounded ${
                currentPage >= totalPages - 1
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
