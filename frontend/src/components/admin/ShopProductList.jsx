import React, { useState, useMemo } from "react";
import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GridOnIcon from "@mui/icons-material/GridOn";
import GridViewIcon from "@mui/icons-material/GridView";
import ExportButtons from "../../components/seller/export/ExportButtons";
// ----------------------- GraphQL ------------------------
const SHOP_PRODUCTS_QUERY = gql`
  query ShopProducts($shopId: ID!) {
    shopProducts(shopId: $shopId) {
      items {
        _id
        name
        description {
          full
          short
        }
        category_id {
          _id
          name
          parent {
            _id
          }
        }
        specifications {
          name
          value
        }
        images
        stock
        status
        createdAt
        updatedAt
        price {
          max_price
          min_price
          sale
        }
      }
      total
      hasMore
    }
  }
`;

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      items {
        _id
        name
        parent {
          _id
          name
        }
      }
    }
  }
`;
// ----------------------- GraphQL ------------------------
const statusMap = {
  active: "Đang bán",
  draft: "Nháp",
  pending: "Chờ duyệt",
  suspended: "Tạm ngưng",
  deleted: "Đã xóa",
};

function renderCategoryOptions(categories) {
  const parentCategories = categories.filter((cat) => !cat.parent);
  const childCategories = categories.filter((cat) => cat.parent);

  return parentCategories.flatMap((parent) => {
    const children = childCategories.filter(
      (child) => child.parent?._id === parent._id
    );
    const parentOption = (
      <option
        className="font-medium"
        key={`parent-${parent._id}`}
        value={parent._id}
      >
        {parent.name}
      </option>
    );
    const childOptions = children.map((child) => (
      <option
        key={`child-${child._id}`}
        value={child._id}
        className="font-medium text-blue-800"
      >
        {"\u00A0\u00A0\u00A0 ↳ " + child.name}
      </option>
    ));
    return [parentOption, ...childOptions];
  });
}

export default function ShopProductList({ shopId }) {
  const { data, loading, error } = useQuery(SHOP_PRODUCTS_QUERY, {
    variables: { shopId },
    fetchPolicy: "network-only",
  });

  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(CATEGORIES_QUERY);
  const categories = categoriesData?.categories?.items || [];
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter products
  const filteredProducts = useMemo(() => {
    let products = data?.shopProducts?.items || [];
    return products.filter((p) => {
      let match = true;
      if (searchTerm) {
        match =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p._id.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (match && categoryFilter) {
        const cat = categories.find((c) => c._id === categoryFilter);
        if (cat && !cat.parent) {
          const childIds = categories
            .filter((c) => c.parent?._id === cat._id)
            .map((c) => c._id);
          match =
            p.category_id?._id === cat._id ||
            childIds.includes(p.category_id?._id);
        } else {
          match = p.category_id?._id === categoryFilter;
        }
      }
      if (match && statusFilter) {
        match = p.status === statusFilter;
      }
      return match;
    });
  }, [data, searchTerm, categoryFilter, statusFilter, categories]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const categoriesMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat._id] = cat;
    });
    return map;
  }, [categories]);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading || categoriesLoading)
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg text-center">
        Đang tải sản phẩm...
      </div>
    );
  if (error) return <div>Lỗi: {error.message}</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-green-300 rounded-sm inline-block" />
        <h1 className="text-2xl font-bold">Sản Phẩm Shop</h1>
      </div>
      <div className="justify-between items-center mb-6">
        <ExportButtons
          data={filteredProducts}
          columns={[
            { key: "_id", label: "ID" },
            { key: "name", label: "Tên sản phẩm" },
            {
              key: "category_id",
              label: "Danh mục",
              render: (row) => {
                const cat = categories.find(
                  (c) => c._id === row.category_id?._id
                );
                if (!cat) return "";
                if (cat.parent && cat.parent.name) {
                  return `${cat.parent.name} > ${cat.name}`;
                }
                return cat.name;
              },
            },
            { key: "stock", label: "Tồn kho" },
            {
              key: "min_price",
              label: "Giá thấp nhất",
              render: (row) =>
                row.price?.min_price?.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }) ?? "",
            },
            {
              key: "max_price",
              label: "Giá cao nhất",
              render: (row) =>
                row.price?.max_price?.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }) ?? "",
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (row) => statusMap[row.status] || row.status,
            },
          ]}
          fileName="admin_products_shop"
          excelLabel="Excel"
          csvLabel="CSV"
          title="Admin | Quản Lý Sản Phẩm Của Shop"
        />
      </div>
      {/* Bộ lọc */}
      <div className="flex flex-col md:flex-row gap-2 mb-2 justify-end">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="hover:border-blue-400 cursor-pointer border px-3 py-2 rounded w-full md:w-48"
        >
          <option value="">-- Tất cả danh mục --</option>
          {renderCategoryOptions(categories)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="hover:border-blue-400 cursor-pointer border px-3 py-2 rounded w-full md:w-48"
        >
          <option value="">-- Tất cả trạng thái --</option>
          {Object.entries(statusMap).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
        {/* <div className="flex flex-col md:flex-row justify-between items-center mb-4"> */}
        <div className="flex items-center gap-2 mb-3">
          <span>Sản phẩm mỗi trang:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className=" cursor-pointer border px-2 py-1 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="text-right gap-2 hidden md:table w-full mb-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg border mr-1 ${
              viewMode === "table"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50"
            } transition-colors cursor-pointer`}
          >
            <GridOnIcon />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded-lg border ${
              viewMode === "card"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50"
            } transition-colors cursor-pointer`}
          >
            <GridViewIcon />
          </button>
        </div>
      </div>
      {/* Phân trang */}

      {/* <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div> */}
      {/* </div> */}
      {/* Bảng cho màn hình lớn */}
      <div
        className={`${
          viewMode === "table" ? "hidden md:table w-full" : "hidden"
        }`}
      >
        <table className="min-w-full table-auto text-sm text-center border-gray-300 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                STT
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Tên sản phẩm
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Ảnh
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Danh mục
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Giá thấp nhất
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Giá cao nhất
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Tồn kho
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Trạng thái
              </th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
                Xem
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((p, index) => {
                const cat = categories.find(
                  (c) => c._id === p.category_id?._id
                );
                let categoryDisplay = "";
                if (cat) {
                  if (cat.parent && cat.parent.name) {
                    categoryDisplay = `${cat.parent.name} > ${cat.name}`;
                  } else {
                    categoryDisplay = cat.name;
                  }
                }
                return (
                  <tr
                    key={p._id}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      {p.name}
                    </td>
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-16 h-16 md:min-w-16 md:min-h-16 object-cover rounded mx-auto"
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          Không có ảnh
                        </span>
                      )}
                    </td>
                    {/* <td className="px-2 py-4 border border-gray-300 text-center">
                      {categoryDisplay}
                    </td> */}
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      <div className="whitespace-nowrap">
                        {categoriesMap[p?.category_id?._id]?.name || ""}
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {categoriesMap[p?.category_id?._id]?.parent
                          ? "< " +
                            categoriesMap[
                              categoriesMap[p.category_id._id].parent._id
                            ]?.name
                          : "-NA-"}
                      </div>
                    </td>
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      {p.price?.min_price?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }) ?? ""}
                    </td>
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      {p.price?.max_price?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }) ?? ""}
                    </td>
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      {p.stock}
                    </td>
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      <span
                        className={`px-2 py-1 rounded whitespace-nowrap ${
                          p.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {statusMap[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-2 py-4 border border-gray-300 text-center">
                      <button
                        className="cursor-pointer text-blue-600 hover:text-blue-800 p-2 rounded-full"
                        title="Xem chi tiết"
                        onClick={() =>
                          navigate(`/admin/product/detail/${p._id}`)
                        }
                      >
                        <VisibilityIcon />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div
        className={`${
          viewMode === "card" ? "block" : "md:hidden"
        } grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 shadow`}
      >
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-8 col-span-full">
            Không có sản phẩm nào.
          </div>
        ) : (
          paginatedProducts.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <img
                onClick={() => navigate(`/admin/product/detail/${p._id}`)}
                src={p.images[0]}
                alt={p.name}
                className="cursor-pointer w-full hover:scale-95 transition-transform duration-500 h-50 object-cover rounded"
              />
              <h3
                onClick={() => navigate(`/admin/product/detail/${p._id}`)}
                className="cursor-pointer font-semibold mt-2 hover:text-[blue]"
              >
                {p.name}
              </h3>
              <p className="text-sm text-gray-600">
                {(() => {
                  const cat = categories.find(
                    (c) => c._id === p.category_id?._id
                  );
                  if (!cat) return "";
                  if (cat.parent && cat.parent.name) {
                    return `${cat.parent.name} > ${cat.name}`;
                  }
                  return cat.name;
                })()}
              </p>
              <p className="my-1 text-gray-500 text-xs">Tồn kho: {p.stock}</p>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  p.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {statusMap[p.status] || p.status}
              </span>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-red-500 font-bold">
                    {p.price?.min_price?.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }) ?? ""}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/admin/product/detail/${p._id}`)}
                  className="cursor-pointer bg-white p-1 rounded-full shadow hover:bg-gray-100 transition"
                  title="Xem chi tiết sản phẩm"
                >
                  <VisibilityIcon className="text-gray-600" fontSize="small" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Phân trang dưới cùng */}
      {/* <div className="flex flex-col md:flex-row justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <span>Tổng cộng: {totalItems} sản phẩm</span>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div> */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Trang {currentPage} / {totalPages}. Sản phẩm từ{" "}
          {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} đến{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng cộng{" "}
          {totalItems} sản phẩm
        </div>
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3  whitespace-nowrap py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
              }`}
            >
              <i className="fas fa-chevron-left mr-1"></i>
              Trang trước
            </button>
            {/* Danh sách số trang */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {number}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 whitespace-nowrap rounded ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
              }`}
            >
              Trang sau
              <i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
