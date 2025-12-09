import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";
import ColAllPageSeller from "../../../components/seller/ColAllPageSeller";
import ExportButtons from "../../../components/seller/export/ExportButtons";
import GridOnIcon from "@mui/icons-material/GridOn";
import TableRowsIcon from "@mui/icons-material/TableRows";
import GridViewIcon from "@mui/icons-material/GridView";

// -----------------------GRAPQL-----------------------

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
// const SHOPS_QUERY = gql`
//   query Shops {
//     shops {
//       items {
//         id
//         name
//         owner {
//           id
//         }
//       }
//     }
//   }
// `;
const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      _id
      name
      owner {
        _id
      }
    }
  }
`;

const SHOP_PRODUCTS_QUERY = gql`
  query ShopProducts($shopId: ID!) {
    shopProducts(shopId: $shopId) {
      items {
        _id
        name
        category_id {
          _id
          name
        }
        images
        description {
          short
          full
        }
        specifications {
          name
          value
        }
        stock
        status
        createdAt
        updatedAt
        price {
          min_price
          max_price
        }
      }
      total
      hasMore
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(_id: $id) {
      name
    }
  }
`;

// ----------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

export default function ProductManagementPage() {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const userId = userData?._id;
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // const { data: shopsData, loading: shopsLoading } = useQuery(SHOPS_QUERY);
  // const shopId = shopsData?.shops?.items?.find(
  //   (shop) => shop.owner?.id === userId
  // )?.id;

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: myShopData, loading: myShopLoading } = useQuery(MY_SHOP_QUERY);
  const shopId = myShopData?.myShop?._id;

  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(CATEGORIES_QUERY);
  const categories = categoriesData?.categories?.items || [];

  const categoriesMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat._id] = { name: cat.name, parent: cat.parent };
    });
    return map;
  }, [categories]);

  const { data, loading } = useQuery(SHOP_PRODUCTS_QUERY, {
    variables: { shopId },
    skip: !shopId,
    fetchPolicy: "network-only",
  });

  const [deleteProductMutation] = useMutation(DELETE_PRODUCT);

  // Lấy toàn bộ sản phẩm
  let allProducts = data?.shopProducts?.items || [];

  if (searchTerm) {
    allProducts = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  // if (categoryFilter) {
  //   allProducts = allProducts.filter(
  //     (p) => p.category_id?._id === categoryFilter
  //   );
  // }

  // thay vì lọc danh mục nào ra danh mục đó như trên thì lọc cha sẽ hiển thị cả con của cha đó
  if (categoryFilter) {
    allProducts = allProducts.filter((p) => {
      const cat = categories.find((c) => c._id === categoryFilter);
      if (cat && !cat.parent) {
        // Là danh mục cha
        const childIds = categories
          .filter((c) => c.parent?._id === cat._id)
          .map((c) => c._id);
        return (
          p.category_id?._id === cat._id ||
          childIds.includes(p.category_id?._id)
        );
      } else {
        // Là danh mục con
        return p.category_id?._id === categoryFilter;
      }
    });
  }

  if (statusFilter) {
    allProducts = allProducts.filter((p) => p.status === statusFilter);
  }

  //   const totalProducts = allProducts.length;
  // const totalPages = Math.ceil(totalProducts / productsPerPage);

  // // Cắt dữ liệu theo trang
  // const products = allProducts.slice(
  //   (currentPage - 1) * productsPerPage,
  //   currentPage * productsPerPage
  // );

  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const products = allProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, itemsPerPage]); // Added itemsPerPage to reset triggers

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) {
      try {
        await deleteProductMutation({
          variables: { id: id },
        });
        showToast("Đã xoá sản phẩm thành công!", "success");
      } catch (err) {
        showToast("Xoá sản phẩm thất bại: " + err.message, "error");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/seller/products/edit/${id}`);
  };

  const handleItemsPerPageChange = (e) => {
    const value =
      e.target.value === "all" ? totalProducts : Number(e.target.value);
    setItemsPerPage(value);
  };

  const renderCategoryOptions = () => {
    const parentCategories = categories.filter((cat) => !cat.parent);
    const childCategories = categories.filter((cat) => cat.parent);

    return parentCategories.flatMap((parent) => {
      const children = childCategories.filter(
        (child) => child.parent?._id === parent._id
      );

      return [
        <option className="font-medium" key={parent._id} value={parent._id}>
          {parent.name}
        </option>,
        ...children.map((child) => (
          <option
            key={child._id}
            value={child._id}
            className="font-medium text-blue-800"
          >
            {"\u00A0\u00A0\u00A0 ↳ " + child.name}
          </option>
        )),
      ];
    });
  };
  ////---------------------------------------

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang bán";
      case "draft":
        return "Nháp";
      case "pending":
        return "Chờ duyệt";
      case "suspended":
        return "Tạm ngưng";
      case "deleted":
        return "Đã xóa";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-200 text-gray-700";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "deleted":
        return "bg-gray-300 text-gray-900";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="relative">
      {(loading || myShopLoading) && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản Lý Sản Phẩm</h1>
          <button
            onClick={() => navigate("/seller/products/add")}
            className="bg-green-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
          >
            + Thêm Mới
          </button>
        </div>
        <div className="justify-between items-center mb-6">
          {/* <ExportButtons
            products={products}
            categories={categories}
            currentPage={currentPage}
            productsPerPage={productsPerPage}
            formatDate={formatDate}
            getStatusText={getStatusText}
          /> */}
          <ExportButtons
            data={products}
            columns={[
              {
                label: "STT",
                render: (_, idx) => idx + 1 + (currentPage - 1) * itemsPerPage,
              },
              { label: "Tên sản phẩm", key: "name" },
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
                render: (row) => getStatusText(row.status),
              },
              { label: "Ngày tạo", render: (row) => formatDate(row.createdAt) },
              {
                label: "Ngày cập nhật",
                render: (row) => formatDate(row.updatedAt),
              },
            ]}
            fileName="seller_products"
            excelLabel="Excel"
            csvLabel="CSV"
            title="Danh Sách Sản Phẩm"
          />
        </div>
        <div className="justify-between items-center mb-4">
          {/* <div className="flex-1 max-w-md ml-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div> */}
          <div className="mb-4 justify-end flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="hover:border-blue-400 cursor-pointer w-64 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Tất cả danh mục --</option>

              {/* --------- */}

              {/* {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.parent && cat.parent.name
                  ? `${cat.parent.name} > ${cat.name}`
                  : cat.name}
              </option>
            ))} */}

              {/* --------- */}
              {renderCategoryOptions()}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hover:border-blue-400 cursor-pointer w-64 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="active">Đang bán</option>
              <option value="draft">Nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="suspended">Tạm ngưng</option>
              <option value="deleted">Đã xóa</option>
            </select>
          </div>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
            <div className="flex items-center gap-2">
              <span>Số sản phẩm mỗi trang:</span>
              <select
                value={itemsPerPage === totalProducts ? "all" : itemsPerPage}
                onChange={handleItemsPerPageChange}
                className=" cursor-pointer border px-2 py-1 rounded border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                {/* <option value={100}>100</option>
                <option value="all">Tất cả</option> */}
              </select>
            </div>
            <div className="text-right gap-2 hidden md:table w-full">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-1 rounded-lg mr-1 border ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50"
                } transition-colors cursor-pointer`}
              >
                <GridOnIcon />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`px-4 py-1 rounded-lg border ${
                  viewMode === "card"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50"
                } transition-colors cursor-pointer`}
              >
                <GridViewIcon />
              </button>
            </div>
          </div>
        </div>

        {/* // ---------------------------------------------------- */}

        <div className="overflow-x-auto bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {/* *note: có backup code (hiển thị mô tả, thông số kt) trong file backup */}
          {/* <div className="hidden md:table w-full"> */}
          <div
            //-----------------------------

            // className={`${viewMode === "table" ? "block" : "hidden md:block"}`}

            //-----------------------------

            className={`${
              viewMode === "table" ? "hidden md:table w-full" : "hidden"
            }`}
          >
            <table className="border border-gray-300 min-w-full divide-y divide-gray-200">
              <ColAllPageSeller type="productManagement" />
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-200 ${
                        index % 2 === 0 ? "bg-gray-100" : ""
                      }`}
                    >
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      {/* <td className="px-2 py-4 min-w-[200px]  border border-gray-300 text-center">
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
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded mx-auto"
                          />
                        ) : (
                          <span className="text-gray-400 italic">
                            Không có ảnh
                          </span>
                        )}
                      </td>
                      {/* <td className="px-2 py-4 border border-gray-300 text-center">
                        {(() => {
                          const catId = product.category_id?._id;
                          const cat = categories.find((c) => c._id === catId);
                          if (!cat) return "";
                          if (cat.parent && cat.parent.name) {
                            return `${cat.parent.name} > ${cat.name}`;
                          }
                          return cat.name;
                        })()}
                      </td> */}
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        <div className="break-all min-w-[150px]">
                          {categoriesMap[product?.category_id?._id]?.name || ""}
                        </div>
                        <div className="text-xs break-all min-w-[150px] text-gray-400 ">
                          {categoriesMap[product?.category_id?._id]?.parent
                            ? "< " +
                              categoriesMap[
                                categoriesMap[product.category_id._id].parent
                                  ._id
                              ]?.name
                            : "-NA-"}
                        </div>
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {product.stock}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {product.price?.min_price?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) ?? ""}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {product.price?.max_price?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) ?? ""}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        <span
                          className={`px-2 py-1 rounded whitespace-nowrap ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="px-2 py-4 border border-gray-300 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(product._id)}
                            className="cursor-pointer text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors"
                            title="Sửa"
                          >
                            <DriveFileRenameOutlineIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="cursor-pointer text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
                            title="Xóa"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* // ---------------------------------------------------- */}

          {/* Card Layout*/}
          {/* //----------------------------- */}

          {/* <div className="md:hidden space-y-4 p-4"> */}

          {/* //----------------------------- */}
          <div
            className={`${
              viewMode === "card" ? "block" : "md:hidden"
            } grid grid-cols-1 lg:grid-cols-2 gap-4 p-4`}
          >
            {loading ? (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">Không có sản phẩm nào.</div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-300 rounded-lg p-4 shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{product.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product._id)}
                        className="p-1 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="Sửa"
                      >
                        <DriveFileRenameOutlineIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Xóa"
                      >
                        <DeleteIcon />
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
                      <span className="text-gray-400 italic">Không có ảnh</span>
                    )}
                    <div>
                      <p>
                        <b>Mô tả:</b>{" "}
                        {(() => {
                          const desc = product.description?.short || "";
                          const words = desc.split(" ");
                          if (words.length > 6) {
                            return words.slice(0, 6).join(" ") + " ...";
                          }
                          return desc;
                        })()}
                      </p>
                      <p>
                        <b>Danh mục:</b>{" "}
                        {(() => {
                          const catId = product.category_id?._id;
                          const cat = categories.find((c) => c._id === catId);
                          if (!cat) return "";
                          if (cat.parent && cat.parent.name) {
                            return `${cat.parent.name} > ${cat.name}`;
                          }
                          return cat.name;
                        })()}
                      </p>
                      <p>
                        <b>Giá thấp nhất:</b>{" "}
                        {product.price?.min_price?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) ?? ""}
                      </p>
                      <p>
                        <b>Giá cao nhất:</b>{" "}
                        {product.price?.max_price?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) ?? ""}
                      </p>
                      <p>
                        <b>Tồn kho:</b> {product.stock}
                      </p>
                      <p>
                        <b>Trạng thái:</b>{" "}
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusText(product.status)}
                        </span>
                      </p>
                      <p>
                        <b>Ngày tạo:</b> {formatDate(product.createdAt)}
                      </p>
                      <p>
                        <b>Ngày cập nhật:</b> {formatDate(product.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {product.specifications &&
                    product.specifications.length > 0 && (
                      <div className="mt-2">
                        <b>Thông số:</b>
                        <div className="flex flex-col">
                          {product.specifications.map((spec, idx) => (
                            <div key={idx}>
                              {spec.name}: {spec.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}. Sản phẩm từ{" "}
            {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, totalProducts)} trong tổng
            cộng {totalProducts} sản phẩm
          </div>
          {totalPages > 1 && (
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
