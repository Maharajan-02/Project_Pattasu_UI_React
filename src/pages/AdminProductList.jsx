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
  const [pageSize, setPageSize] = useState(10);
  const [pageSizeInput, setPageSizeInput] = useState("10");

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentPage = parseInt(searchParams.get("page") || 1, 10) - 1;

  const fetchProducts = async (pageNumber = 0, search = "", size = 10) => {
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
        setPageSizeInput("10");
        setPageSize(10);
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
                className="border rounded shadow p-4 flex flex-col justify-between bg-white"
              >
                {/* Fixed image display */}
                <img
                  src={`${product.imageUrl}`}
                  alt={product.name}
                  className="h-40 w-full object-contain mb-4 bg-gray-50 rounded"
                />
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 min-h-[2.5rem]">{product.description}</p>
                  
                  {/* Price display with discount */}
                  <div className="mb-2">
                    {product.discount > 0 ? (
                      <div>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mb-2 inline-block">
                          {product.discount.toFixed(0)}% OFF
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold">
                            ₹{(product.finalPrice || 0).toFixed(2)}
                          </span>
                          <span className="text-gray-500 line-through text-sm">
                            ₹{(product.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-green-600 font-bold">
                        ₹{(product.price || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Stock:</span> {product.stockQuantity}
                  </p>

                  {/* Status badge */}
                  <div className="mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded text-white ${
                        product.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                
                {/* Edit button */}
                <div className="mt-auto">
                  <button
                    onClick={() =>
                      navigate(`/admin/edit-product/${product.id}?page=${currentPage + 1}`)
                    }
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === 0 
                  ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Previous
            </button>

            <span className="text-sm text-gray-700 px-4">
              Page {currentPage + 1} of {totalPages} — Showing {products.length} of {totalProducts} products
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage >= totalPages - 1
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
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
