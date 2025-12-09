import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ColAllPageSeller from "../../../components/seller/ColAllPageSeller";
import ExportButtons from "../../../components/seller/export/ExportButtons";
import ToggleViewMode from "../../../components/admin/ToggleViewMode";
import CardView from "../../../components/admin/CardView";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";
import { useToast } from "../../../contexts/ToastProvider";

// -----------------------GRAPHQL-----------------------
const SHOPS_QUERY = gql`
  query Shops {
    shops {
      items {
        _id
        name
        owner {
          _id
          fullName
        }
        logo
        createdAt
        updatedAt
        status
      }
    }
  }
`;
const UPDATE_SHOP_STATUS = gql`
  mutation UpdateShopStatus($updateShopStatusId: ID!, $status: ShopStatus!) {
    updateShopStatus(updateShopStatusId: $updateShopStatusId, status: $status) {
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
  active: "Hoạt động",
  suspended: "Bị từ chối",
  pending: "Chờ duyệt",
  closed: "Đã đóng",
  locked: "Đã khóa",
};

// const statusOptions = [
//   { value: "", label: "Tất cả" },
//   { value: "active", label: "Hoạt động" },
//   { value: "pending", label: "Chờ duyệt" },
//   { value: "suspended", label: "Bị cấm" },
//   { value: "closed", label: "Đã đóng" },
//   { value: "locked", label: "Đã khóa" },
// ];

const statusTabs = [
  { value: "", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "suspended", label: "Bị cấm" },
  { value: "closed", label: "Đã đóng" },
  { value: "locked", label: "Đã khóa" },
];

export default function AdminShopPage() {
  const { data, loading, error } = useQuery(SHOPS_QUERY);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [approveModal, setApproveModal] = useState({ open: false, shop: null });
  const [approveStatus, setApproveStatus] = useState("active");
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState("");

  const shops = data?.shops?.items || [];
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  // const [statusFilter, setStatusFilter] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Lọc dữ liệu theo search và status
  // const filteredShops = useMemo(() => {
  //   return shops.filter((shop) => {
  //     const matchesStatus = statusFilter ? shop.status === statusFilter : true;
  //     const matchesSearch =
  //       shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       shop.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
  //     return matchesStatus && matchesSearch;
  //   });
  // }, [shops, searchTerm, statusFilter]);
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesStatus = activeStatus ? shop.status === activeStatus : true;
      const matchesSearch =
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [shops, searchTerm, activeStatus]);

  const [updateShopStatus] = useMutation(UPDATE_SHOP_STATUS, {
    onCompleted: () => {
      setApproveModal({ open: false, shop: null });
      setApproveLoading(false);
      setApproveError("");
      // Refetch shops nếu cần
    },
    onError: (err) => {
      setApproveLoading(false);
      setApproveError(err.message || "Có lỗi xảy ra!");
    },
  });

  // Handle change in items per page
  const handleItemsPerPageChange = (e) => {
    const value =
      e.target.value === "all" ? filteredShops.length : Number(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  //// const totalPages = Math.ceil(shops.length / shopsPerPage);
  //// const indexOfLastShop = currentPage * shopsPerPage;
  //// const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  //// const currentShops = shops.slice(indexOfFirstShop, indexOfLastShop);
  // const totalPages = Math.ceil(filteredShops.length / shopsPerPage);
  // const indexOfLastShop = currentPage * shopsPerPage;
  // const indexOfFirstShop = indexOfLastShop - shopsPerPage;

  // Pagination logic
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const indexOfLastShop = currentPage * itemsPerPage;
  const indexOfFirstShop = indexOfLastShop - itemsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeStatus, itemsPerPage]); // Added itemsPerPage to reset triggers

  return (
    <div className="relative">
      {loading && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1 h-6 bg-red-300 rounded-sm inline-block" />
          <h1 className="text-2xl font-bold">Quản Lý Shop</h1>
        </div>
        <div className="justify-between items-center mb-6">
          <ExportButtons
            data={filteredShops}
            columns={[
              {
                key: "index",
                label: "STT",
                render: (_, idx) => indexOfFirstShop + idx + 1,
              },
              {
                key: "name",
                label: "Tên Shop",
              },
              {
                key: "owner",
                label: "Chủ Shop",
                render: (row) => row.owner?.fullName || "Chưa có",
              },
              {
                key: "status",
                label: "Trạng Thái",
                render: (row) => statusMap[row.status] || row.status,
              },
              {
                key: "createdAt",
                label: "Ngày Tạo",
                render: (row) => formatDate(row.createdAt),
              },
              {
                key: "updatedAt",
                label: "Ngày Cập Nhật",
                render: (row) => formatDate(row.updatedAt),
              },
            ]}
            fileName="shops_export"
            excelLabel="Excel"
            csvLabel="CSV"
            title="Admin | Quản Lý Shop"
          />
        </div>
        {/* --------------------- */}
        <div className="flex gap-2 mb-4 whitespace-nowrap overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              style={{
                background:
                  activeStatus === tab.value && tab.value !== ""
                    ? tab.value === "active"
                      ? "#22c55e"
                      : tab.value === "pending"
                      ? "#f59e42"
                      : tab.value === "suspended"
                      ? "#ef4444"
                      : tab.value === "closed"
                      ? "#64748b"
                      : "black"
                    : undefined,
                color:
                  activeStatus === tab.value && tab.value !== ""
                    ? tab.value === "active"
                      ? "#ffffff"
                      : tab.value === "pending"
                      ? "#000000"
                      : "#ffffff"
                    : undefined,
              }}
              className={`cursor-pointer px-4 py-2 rounded font-semibold border transition-colors ${
                activeStatus === tab.value
                  ? "bg-cyan-100 text-cyan-700 border-cyan-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200"
              }`}
              onClick={() => {
                setActiveStatus(tab.value);
                setCurrentPage(1);
              }}
            >
              {/* {tab.label} (
              {tab.value
                ? shops.filter((shop) => shop.status === tab.value).length
                : shops.length}
              ) */}
              {tab.label}{" "}
              {tab.value === "pending" ? (
                // <span className="text-white rounded-full bg-red-500 font-bold text-[12px] w-[16px] h-[16px] inline-flex items-center content-center justify-center">
                //   {shops.filter((shop) => shop.status === tab.value).length}
                // </span>
                <div className="relative inline-flex  w-[18px] h-[18px] items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>

                  <span className="relative inline-flex rounded-full bg-red-500 text-white font-bold text-[11px] w-[18px] h-[18px] items-center justify-center">
                    {shops.filter((shop) => shop.status === tab.value).length}
                  </span>
                </div>
              ) : (
                <>
                  (
                  {tab.value
                    ? shops.filter((shop) => shop.status === tab.value).length
                    : shops.length}
                  )
                </>
              )}
            </button>
          ))}
        </div>
        {/* --------------------- */}

        {/* <div className="flex justify-end flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên shop hoặc tên chủ shop..."
          className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div> */}

        <div className="flex flex-wrap gap-2 mb-4 justify-end items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên shop hoặc tên chủ shop..."
            className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-1/2"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
          <div className="flex items-center gap-2 mb-3">
            <span>Số shop mỗi trang:</span>
            <select
              value={
                itemsPerPage === filteredShops.length ? "all" : itemsPerPage
              }
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

          <ToggleViewMode viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {/* <table className="border min-w-full divide-y divide-gray-200"> */}
          <table
            className={
              viewMode === "table"
                ? "border min-w-full divide-y divide-gray-200"
                : "hidden"
            }
          >
            <ColAllPageSeller type={"adminShop"} />
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentShops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    Không có shop nào.
                  </td>
                </tr>
              ) : (
                currentShops.map((shop, idx) => (
                  <tr
                    key={shop._id}
                    // className={idx % 2 === 0 ? "bg-gray-50" : ""}
                    className={
                      idx % 2 !== 0
                        ? "bg-gray-100 hover:bg-gray-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {indexOfFirstShop + idx + 1}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt="logo"
                          className="min-w-12 min-h-12 w-12 h-12 object-cover rounded-full mx-auto border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-gray-400">
                          <span className="text-xs">No Logo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {shop.name}
                    </td>
                    {/* <td className="px-2 py-4 border text-center border-gray-300">
                      {shop.owner?.fullName || "Chưa có"}
                    </td> */}
                    <td className="cursor-pointer px-2 py-4 border border-gray-300 text-center">
                      <button
                        onClick={() =>
                          navigate(`/admin/seller/detail/${shop.owner?._id}`)
                        }
                        className="cursor-pointer text-indigo-500 font-semibold hover:font-bold px-1 hover:px-0"
                      >
                        {shop.owner?.fullName || "Chưa có"}
                      </button>
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      <span
                        className="px-2 py-1 rounded text-white whitespace-nowrap"
                        style={{
                          background:
                            shop.status === "active"
                              ? "#22c55e"
                              : shop.status === "pending"
                              ? "#f59e42"
                              : shop.status === "suspended"
                              ? "#ef4444"
                              : "#64748b",
                        }}
                      >
                        {statusMap[shop.status] || shop.status}
                      </span>
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {formatDate(shop.createdAt)}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {formatDate(shop.updatedAt)}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      <button
                        className="text-blue-600 cursor-pointer hover:text-blue-800 p-2 rounded-full"
                        title="Xem chi tiết"
                        onClick={() =>
                          navigate(`/admin/shop/detail/${shop._id}`)
                        }
                      >
                        <VisibilityIcon />
                      </button>
                      {shop.status === "pending" && (
                        <button
                          className="text-green-600 cursor-pointer hover:text-green-800 p-2 rounded-full ml-2"
                          title="Duyệt shop"
                          onClick={() => {
                            setApproveModal({ open: true, shop });
                            setApproveStatus("active");
                            setApproveError("");
                          }}
                        >
                          <EditIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className={viewMode === "card" ? "block" : "hidden"}>
            <CardView
              data={currentShops}
              getImage={(shop) => shop.logo}
              getTitle={(shop) => shop.name}
              onViewDetail={(shop) =>
                navigate(`/admin/shop/detail/${shop._id}`)
              }
              renderActions={(shop) =>
                shop.status === "pending" && (
                  <button
                    className="text-green-600 cursor-pointer hover:text-green-800 p-2 rounded-full ml-1"
                    title="Duyệt shop"
                    onClick={() => {
                      setApproveModal({ open: true, shop });
                      setApproveStatus("active");
                      setApproveError("");
                    }}
                  >
                    <EditIcon />
                  </button>
                )
              }
              fields={[
                {
                  label: "Chủ Shop",
                  render: (shop) => (
                    // shop.owner?.fullName || "Chưa có",
                    <button
                      onClick={() =>
                        navigate(`/admin/seller/detail/${shop.owner?._id}`)
                      }
                      className="cursor-pointer text-indigo-500 font-semibold hover:font-bold px-1 hover:px-0"
                    >
                      {shop.owner?.fullName || "Chưa có"}
                    </button>
                  ),
                },
                // {
                //   label: "Trạng thái",
                //   render: (shop) => statusMap[shop.status] || shop.status,
                // },
                {
                  label: "Trạng thái",
                  render: (shop) => (
                    <span
                      className="px-2 py-1 rounded text-white whitespace-nowrap"
                      style={{
                        background:
                          shop.status === "active"
                            ? "#22c55e"
                            : shop.status === "pending"
                            ? "#f59e42"
                            : shop.status === "suspended"
                            ? "#ef4444"
                            : "#64748b",
                      }}
                    >
                      {statusMap[shop.status] || shop.status}
                    </span>
                  ),
                },
                {
                  label: "Ngày tạo",
                  render: (shop) => formatDate(shop.createdAt),
                },
                {
                  label: "Ngày cập nhật",
                  render: (shop) => formatDate(shop.updatedAt),
                },
                // {
                //   label: "Hành động",
                //   render: (shop) => (
                //     <div className="flex gap-2">
                //       {shop.status === "pending" && (
                //         <button
                //           className="text-green-600 cursor-pointer hover:text-green-800 p-2 rounded-full"
                //           title="Duyệt shop"
                //           onClick={() => {
                //             setApproveModal({ open: true, shop });
                //             setApproveStatus("active");
                //             setApproveError("");
                //           }}
                //         >
                //           <EditIcon />
                //         </button>
                //       )}
                //     </div>
                //   ),
                // },
              ]}
            />
          </div>
        </div>
        {approveModal.open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Duyệt Shop:{" "}
              </h3>
              <div className="px-6 text-lg font-semibold mb-4 text-indigo-700">
                <span className="font-bold">{approveModal.shop?.name}</span>
              </div>
              <div className="mb-4">
                <label className=" cursor-pointer flex items-center gap-2 mb-4">
                  <input
                    type="radio"
                    name="approveStatus"
                    value="active"
                    checked={approveStatus === "active"}
                    onChange={() => setApproveStatus("active")}
                    disabled={approveLoading}
                  />
                  Duyệt Shop (Hoạt động)
                </label>
                <label className=" cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name="approveStatus"
                    value="suspended"
                    checked={approveStatus === "suspended"}
                    onChange={() => setApproveStatus("suspended")}
                    disabled={approveLoading}
                  />
                  Từ chối Shop
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
                  onClick={() => setApproveModal({ open: false, shop: null })}
                  disabled={approveLoading}
                >
                  Hủy
                </button>
                <button
                  className=" hover:opacity-75 cursor-pointer px-4 py-2 rounded bg-blue-600 text-white flex items-center"
                  onClick={async () => {
                    setApproveLoading(true);
                    setApproveError("");
                    try {
                      await updateShopStatus({
                        variables: {
                          updateShopStatusId: approveModal.shop._id,
                          status: approveStatus,
                        },

                        refetchQueries: ["Shops"],
                      });
                      showToast("Cập nhật trạng thái thành công!", "success");
                    } catch (err) {
                      setApproveError(err.message || "Có lỗi xảy ra!");
                      showToast(
                        "Cập nhật trạng thái thất bại: " + err.message,
                        "error"
                      );
                      setApproveLoading(false);
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
            Trang {currentPage} / {totalPages}. Shop từ{" "}
            {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, filteredShops.length)} trong
            tổng cộng {filteredShops.length} shop
          </div>
          {totalPages > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
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
