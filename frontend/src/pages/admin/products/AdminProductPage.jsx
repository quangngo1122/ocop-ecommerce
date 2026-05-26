import React, { useState, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";
import ColAllPageSeller from "../../../components/seller/ColAllPageSeller";
import ExportButtons from "../../../components/seller/export/ExportButtons";
import GridOnIcon from "@mui/icons-material/GridOn";
import GridViewIcon from "@mui/icons-material/GridView";
import { useToast } from "../../../contexts/ToastProvider";
// -----------------------GRAPQL-----------------------
const PRODUCTS_QUERY = gql`
  query Products($pagination: PaginationInput) {
    products(pagination: $pagination) {
      items {
        _id
        name
        # images {
        #   alt
        #   link
        # }
        # images {
        #   image
        # }
        images
        description {
          short
        }
        category_id {
          _id
          name
        }
        price {
          # regular
          min_price
          max_price
        }
        rating {
          average
          count
        }
        stock
        status
        shop_id {
          _id
          name
        }
        createdAt
        updatedAt
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

const UPDATE_PRODUCT_STATUS = gql`
  mutation updateProductStatusOKQ($productId: ID!, $status: ProductStatus!) {
    updateProductStatus(productId: $productId, status: $status) {
      _id
      status
    }
  }
`;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

const statusMap = {
  active: "Đang bán",
  draft: "Nháp",
  pending: "Chờ duyệt",
  suspended: "Tạm ngưng",
  deleted: "Đã xóa",
};

// Hàm render option danh mục dạng cha > con

// note: hàm dưới hàm cmt viết kiểu tối ưu nhưng chưa chắc đúng, nên backup code ở đây

// function renderCategoryOptions(categories) {
//   const parentCategories = categories.filter((cat) => !cat.parent);
//   const childCategories = categories.filter((cat) => cat.parent);
//   return parentCategories.flatMap((parent) => {
//     const children = childCategories.filter(
//       (child) => child.parent?._id === parent._id
//     );
//     return [
//       <option className="font-medium" key={parent._id} value={parent._id}>
//         {parent.name}
//       </option>,
//       ...children.map((child) => (
//         <option
//           key={child._id}
//           value={child._id}
//           className="font-medium text-blue-800"
//         >
//           {"\u00A0\u00A0\u00A0 ↳ " + child.name}
//         </option>
//       )),
//     ];
//   });
// }

// ----------------

function renderCategoryOptions(categories) {
  const parentCategories = categories.filter((cat) => !cat.parent);
  const childCategories = categories.filter((cat) => cat.parent);

  return parentCategories.flatMap((parent) => {
    const children = childCategories.filter(
      (child) => child.parent?._id === parent._id,
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

export default function AdminProductPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  // const productsPerPage = 8;

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("table");

  // -------backup-------

  // const { data, loading, error, refetch } = useQuery(PRODUCTS_QUERY, {
  //   variables: {
  //     pagination: {
  //       limit: productsPerPage,
  //       offset: (currentPage - 1) * productsPerPage,
  //     },
  //   },
  //   fetchPolicy: "network-only",
  // });

  // -------backup-------

  const { data, loading, error, refetch } = useQuery(PRODUCTS_QUERY, {
    // fetchPolicy: "network-only",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(CATEGORIES_QUERY);
  const categories = categoriesData?.categories?.items || [];

  const [updateProductStatus] = useMutation(UPDATE_PRODUCT_STATUS, {
    onCompleted: () => {
      setApproveModal({ open: false, product: null });
      setApproveLoading(false);
      setApproveError("");
      refetch(); // Refresh the product list
    },
    onError: (err) => {
      setApproveLoading(false);
      setApproveError(err.message || "Có lỗi xảy ra!");
      showToast("Cập nhật trạng thái thất bại: " + err.message, "error");
    },
  });

  const products = data?.products?.items || [];

  // -------backup-------
  // const totalProducts = data?.products?.total || 0;
  // -------backup-------

  const totalUnfiltered = products.length;

  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [shopFilter, setShopFilter] = React.useState("");

  const [approveModal, setApproveModal] = useState({
    open: false,
    product: null,
  });
  const [approveStatus, setApproveStatus] = useState("active");
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState("");
  const { showToast } = useToast();

  //----------------
  // const filteredProducts = products.filter((product) => {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let match = true;
      if (searchTerm) {
        match =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product._id.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (match && categoryFilter) {
        // match = product.category_id?.id === categoryFilter;
        // Nếu chọn cha, lọc tất cả sản phẩm thuộc cha hoặc con của cha đó
        const cat = categories.find((c) => c._id === categoryFilter);
        if (cat && !cat.parent) {
          // là cha
          const childIds = categories
            .filter((c) => c.parent?._id === cat._id)
            .map((c) => c._id);
          match =
            product.category_id?._id === cat._id ||
            childIds.includes(product.category_id?._id);
        } else {
          // là con
          match = product.category_id?._id === categoryFilter;
        }
      }
      if (match && statusFilter) {
        match = product.status === statusFilter;
      }
      if (match && shopFilter) {
        match = product.shop_id?._id === shopFilter;
      }
      return match;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, shopFilter]);

  //----------------
  // const totalProducts = filteredProducts.length;
  // React.useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchTerm, categoryFilter, statusFilter, shopFilter]);
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, shopFilter, itemsPerPage]);

  // -------backup-------
  // const totalPages = Math.ceil(totalProducts / productsPerPage);
  // const pageNumbers = [];
  // for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  // // const paginatedProducts = filteredProducts.slice(
  // //   (currentPage - 1) * productsPerPage,
  // //   currentPage * productsPerPage
  // // );

  // const paginatedProducts = filteredProducts;
  // -------backup-------

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // const totalPages = Math.ceil(totalProducts / productsPerPage);
  // const pageNumbers = [];
  // for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  // const paginatedProducts = filteredProducts.slice(
  //   (currentPage - 1) * productsPerPage,
  //   currentPage * productsPerPage
  // );

  const handleItemsPerPageChange = (e) => {
    const value =
      e.target.value === "all" ? totalProducts : Number(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const categoriesMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat._id] = { name: cat.name, parent: cat.parent };
    });
    return map;
  }, [categories]);

  //----------------
  const shopList = React.useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.shop_id && p.shop_id._id && !map.has(p.shop_id._id)) {
        map.set(p.shop_id._id, p.shop_id.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);
  //----------------
  // if (loading || categoriesLoading) {
  //   return (
  //     <div className="fixed inset-0 bg-black/10 backdrop-blur-sm p-6 flex justify-center items-center h-screen z-50">
  //       <div className="flex flex-col items-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  //         <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="relative ">
      {(loading || categoriesLoading) && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6">
        {/* <h1 className="text-2xl font-bold mb-6">Quản Lý Sản Phẩm (Admin)</h1> */}

        <div className="flex items-center gap-2 mb-6">
          <span className="w-1 h-6 bg-teal-300 rounded-sm inline-block" />
          <h1 className="text-2xl font-bold ">Quản Lý Sản Phẩm</h1>
        </div>
        <div className="justify-between items-center mb-6">
          <ExportButtons
            // -------backup-------
            // data={paginatedProducts}
            // -------

            data={filteredProducts}
            columns={[
              {
                label: "STT",
                // -------backup-------
                // render: (_, idx) =>
                //   idx + 1 + (currentPage - 1) * productsPerPage,
                // -------
                // render: (_, idx) => idx + 1,
                render: (_, idx) => idx + 1 + (currentPage - 1) * itemsPerPage,
              },
              { label: "Tên sản phẩm", key: "name" },
              { label: "Shop", render: (row) => row.shop_id?.name || "" },
              {
                label: "Danh mục",
                render: (row) => {
                  const catId = row.category_id?._id;
                  const cat = categories.find((c) => c._id === catId);
                  if (!cat) return "";
                  if (cat.parent && cat.parent.name)
                    return `${cat.parent.name} > ${cat.name}`;
                  return cat.name;
                },
              },
              { label: "Tồn kho", key: "stock" },
              {
                label: "Giá thấp nhất",
                render: (row) =>
                  row.price?.min_price?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }) ?? "",
              },
              {
                label: "Giá cao nhất",
                render: (row) =>
                  row.price?.max_price?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }) ?? "",
              },
              {
                label: "Trạng thái",
                render: (row) => statusMap[row.status] || row.status,
              },
              { label: "Ngày tạo", render: (row) => formatDate(row.createdAt) },
              {
                label: "Ngày cập nhật",
                render: (row) => formatDate(row.updatedAt),
              },
            ]}
            fileName="admin_products"
            excelLabel="Excel"
            csvLabel="CSV"
            title="Admin | Quản Lý Sản Phẩm"
          />
        </div>

        {/* <div className="flex gap-4 mb-4"> */}

        <div className="flex justify-end md:grid-cols-1 flex-wrap gap-4 mb-3">
          <select
            className=" hover:border-blue-400  cursor-pointer border px-3 py-2 rounded"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option className="text-center " value="">
              -- Tất cả danh mục --
            </option>
            {/* {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))} */}
            {renderCategoryOptions(categories)}
          </select>
          <select
            className=" hover:border-blue-400  cursor-pointer border text-center px-1 py-2 rounded"
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value)}
          >
            <option value="">-- Tất cả Shop --</option>
            {/* {shops.map((shop) => ( */}
            {shopList.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          <select
            className=" hover:border-blue-400  cursor-pointer border px-3 py-2 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option className="text-center " value="">
              -- Tất cả trạng thái --
            </option>
            {Object.entries(statusMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mb-2">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="border px-3 py-2 rounded w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-right gap-2 hidden md:table w-full mb-3">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg border mr-1 ${
              viewMode === "table"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50"
            } transition-colors cursor-pointer`}
          >
            {/* Table View */}
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
            {/* Card View */}
            <GridViewIcon />
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span>Sản phẩm mỗi trang:</span>
            <select
              value={itemsPerPage === totalProducts ? "all" : itemsPerPage}
              onChange={handleItemsPerPageChange}
              className=" cursor-pointer border px-2 py-1 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              {/* <option value={100}>100</option>
              <option value="all">Tất cả</option> */}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {/* <table className="border min-w-full divide-y divide-gray-200"> */}
          <table
            className={`${
              viewMode === "table"
                ? "hidden md:table border min-w-full divide-y divide-gray-200"
                : "hidden"
            }`}
          >
            {/* <table className="hidden md:table border min-w-full divide-y divide-gray-200"> */}
            <ColAllPageSeller type={"adminProduct"} />
            <tbody className="bg-white divide-y divide-gray-200">
              {/* {loading ? ( */}
              {loading || categoriesLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : // ) : products.length === 0 ? (
              paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                // products.map((product, index) => {
                paginatedProducts.map((product, index) => {
                  // Tìm category theo id
                  const cat = categories.find(
                    (c) => c._id === product.category_id?._id,
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
                      key={product._id}
                      // className={index % 2 === 0 ? "bg-gray-50" : ""}
                      className={
                        index % 2 !== 0
                          ? "bg-gray-100 hover:bg-gray-50"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      {/* <td className="break-all min-w-[130px] px-2 py-4 border border-gray-300 text-center">
                        {product.name}
                      </td> */}
                      <td className="px-2 py-4 min-w-[200px] border border-gray-300 text-center">
                        <div className="line-clamp-2 break-words">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            // src={product.images[0].link}
                            // alt={product.images[0].alt || product.name}
                            // src={product.images[0].image}
                            // alt={product.name}
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 md:min-w-16 md:min-h-16 object-cover rounded mx-auto"
                          />
                        ) : (
                          <span className="text-gray-400 italic">
                            Không có ảnh
                          </span>
                        )}
                      </td>
                      {/* <td className="px-2 py-4 border border-gray-300 text-center">
                        <a
                          href={`/admin/shop/detail/${product?.shop_id?._id}`}
                          className="text-indigo-500 font-bold hover:underline"
                        >
                          {product.shop_id?.name || ""}
                        </a>
                        
                      </td> */}
                      <td className="px-2 py-4 break-all min-w-[100px] cursor-pointer border border-gray-300 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/shop/detail/${product?.shop_id?._id}`,
                            )
                          }
                          className="text-indigo-500 font-bold hover:underline"
                        >
                          {product.shop_id?.name || ""}
                        </button>
                      </td>

                      <td className="px-2 py-4 border border-gray-300 text-center">
                        <div className="whitespace-nowrap">
                          {categoriesMap[product?.category_id?._id]?.name || ""}
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {categoriesMap[product?.category_id?._id]?.parent
                            ? "< " +
                              categoriesMap[
                                categoriesMap[product.category_id._id].parent
                                  ._id
                              ]?.name
                            : "-NA-"}
                        </div>
                      </td>
                      {/* <td className="px-2 py-4 border border-gray-300 text-center">
                        {product.price?.regular?.toLocaleString("vi-VN") || 0}
                      </td> */}
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {product.price?.max_price?.toLocaleString("vi-VN") || 0}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {product.price?.min_price?.toLocaleString("vi-VN") || 0}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        <span
                          title={`Có {product.rating?.count || 0} đánh giá`}
                        >
                          ⭐ {product.rating?.average?.toFixed(1) || 0}
                        </span>
                      </td>
                      <td className="break-all min-w-[70px] px-2 py-4 border border-gray-300 text-center">
                        {product.stock}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        <span
                          className={
                            product.status === "active"
                              ? "bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap"
                              : product.status === "pending"
                                ? "bg-orange-100 text-orange-800 px-2 py-1 rounded whitespace-nowrap"
                                : "bg-gray-200 text-gray-700 px-2 py-1 rounded whitespace-nowrap"
                          }
                        >
                          {statusMap[product.status] || product.status}
                        </span>
                      </td>

                      {/* <td className="px-2 py-4 border border-gray-300 text-center">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-2 py-4 border border-gray-300 text-center">
                    {formatDate(product.updatedAt)}
                  </td> */}
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        <button
                          className="cursor-pointer text-blue-600 hover:text-blue-800 p-2 rounded-full"
                          title="Xem chi tiết"
                          onClick={() =>
                            navigate(`/admin/product/detail/${product._id}`)
                          }
                        >
                          <VisibilityIcon />
                        </button>
                        {product.status === "pending" && (
                          <button
                            className="text-green-600 cursor-pointer hover:text-green-800 p-2 rounded-full ml-2"
                            title="Duyệt sản phẩm"
                            onClick={() => {
                              setApproveModal({ open: true, product });
                              setApproveStatus("active");
                              setApproveError("");
                            }}
                          >
                            <EditIcon />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* <div className="md:hidden space-y-4 p-4"> */}
          <div
            className={`${
              viewMode === "card" ? "block" : "md:hidden"
            } grid grid-cols-1 lg:grid-cols-2 gap-4 p-4`}
          >
            {loading || categoriesLoading ? (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-8">Không có sản phẩm nào.</div>
            ) : (
              paginatedProducts.map((product) => {
                const cat = categories.find(
                  (c) => c._id === product.category_id?._id,
                );
                const categoryDisplay = cat
                  ? cat.parent
                    ? `${cat.parent.name} > ${cat.name}`
                    : cat.name
                  : "";

                return (
                  <div
                    key={product._id}
                    className="border border-gray-200 rounded-lg p-4 shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{product.name}</span>
                      {/* <button
                        onClick={() =>
                          navigate(`/admin/product/detail/${product._id}`)
                        }
                        className="cursor-pointer text-blue-600 hover:text-blue-800 p-2 rounded-full"
                        title="Xem chi tiết"
                      >
                        <VisibilityIcon />
                      </button> */}
                      <div className="flex gap-2">
                        {product.status === "pending" && (
                          <button
                            className="text-green-600 cursor-pointer hover:text-green-800 p-2 rounded-full"
                            title="Duyệt sản phẩm"
                            onClick={() => {
                              setApproveModal({ open: true, product });
                              setApproveStatus("active");
                              setApproveError("");
                            }}
                          >
                            <EditIcon />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            navigate(`/admin/product/detail/${product._id}`)
                          }
                          className="cursor-pointer text-blue-600 hover:text-blue-800 p-2 rounded-full"
                          title="Xem chi tiết"
                        >
                          <VisibilityIcon />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          Không có ảnh
                        </span>
                      )}
                      <div className="flex-1 text-sm">
                        <p>
                          <b>Shop:</b>{" "}
                          <a
                            href={`/admin/shop/detail/${product.shop_id?._id}`}
                            className="text-indigo-500 font-bold hover:underline"
                          >
                            {product.shop_id?.name || ""}
                          </a>
                        </p>
                        <p>
                          <b>Danh mục:</b> {categoryDisplay}
                        </p>
                        {/* <p>
                          <b>Giá:</b>{" "}
                          {product.price?.regular?.toLocaleString("vi-VN") || 0}
                        </p> */}
                        <p>
                          <b>Giá cao nhất:</b>{" "}
                          {product.price?.max_price?.toLocaleString("vi-VN") ||
                            0}
                        </p>
                        <p>
                          <b>Giá thấp nhất:</b>{" "}
                          {product.price?.min_price?.toLocaleString("vi-VN") ||
                            0}
                        </p>
                        <p>
                          <b>Đánh giá:</b> ⭐{" "}
                          {product.rating?.average?.toFixed(1) || 0}
                        </p>
                        <p>
                          <b>Tồn kho:</b> {product.stock}
                        </p>
                        <p>
                          <b>Trạng thái:</b>{" "}
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              product.status === "active"
                                ? "bg-green-100 text-green-800"
                                : product.status === "pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {statusMap[product.status] || product.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {approveModal.open && approveModal.product && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Duyệt Sản Phẩm:
              </h3>
              <div className="px-6 text-lg font-semibold mb-4 text-indigo-700">
                <span className="font-bold">{approveModal.product?.name}</span>
              </div>
              <div className="mb-4">
                <label className="cursor-pointer flex items-center gap-2 mb-4">
                  <input
                    type="radio"
                    name="approveStatus"
                    value="active"
                    checked={approveStatus === "active"}
                    onChange={() => setApproveStatus("active")}
                    disabled={approveLoading}
                  />
                  Duyệt Sản Phẩm (Đang bán)
                </label>
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name="approveStatus"
                    value="suspended"
                    checked={approveStatus === "suspended"}
                    onChange={() => setApproveStatus("suspended")}
                    disabled={approveLoading}
                  />
                  Từ chối Sản Phẩm
                </label>
              </div>
              {approveError && (
                <div className="mb-2 flex items-center text-red-600">
                  <ErrorIcon fontSize="small" className="mr-2" />
                  <span className="text-sm">{approveError}</span>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="hover:opacity-75 cursor-pointer px-4 py-2 rounded bg-gray-200 text-gray-700"
                  onClick={() =>
                    setApproveModal({ open: false, product: null })
                  }
                  disabled={approveLoading}
                >
                  Hủy
                </button>
                <button
                  className="hover:opacity-75 cursor-pointer px-4 py-2 rounded bg-blue-600 text-white flex items-center"
                  onClick={async () => {
                    setApproveLoading(true);
                    setApproveError("");
                    try {
                      await updateProductStatus({
                        variables: {
                          productId: approveModal.product._id,
                          status: approveStatus,
                        },
                        refetchQueries: ["Products"],
                      });
                      showToast("Cập nhật trạng thái thành công!", "success");
                    } catch (err) {
                      setApproveError(err.message || "Có lỗi xảy ra!");
                    }
                  }}
                  disabled={approveLoading}
                >
                  {approveLoading ? (
                    <CircularProgress size={18} className="text-white mr-2" />
                  ) : (
                    <CheckCircleIcon fontSize="small" className="mr-2" />
                  )}
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}. Sản phẩm từ{" "}
            {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, totalProducts)} trong tổng
            cộng {totalProducts} sản phẩm
          </div>
          {/* {totalPages > 1 && ( */}
          {totalPages > 1 && itemsPerPage !== totalProducts && (
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                }`}
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Trang trước
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
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
    </div>
  );
}
