import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ColAllPageSeller from "../seller/ColAllPageSeller";
import ExportButtons from "../../components/seller/export/ExportButtons";
import GridOnIcon from "@mui/icons-material/GridOn";
import TableRowsIcon from "@mui/icons-material/TableRows";
import GridViewIcon from "@mui/icons-material/GridView";
// ----------------------- GraphQL ------------------------
const SHOP_ORDERS_QUERY = gql`
  # query ShopOrders($filter: ShopOrderFilter) {
  #   shopOrders(filter: $filter) {
  #     items {
  query ShopOrders($filter: ShopOrdersInput) {
    shopOrders(filter: $filter) {
      _id
      amounts {
        shippingFee
        subtotal
        total
        total_discount
      }
      status_history {
        status
        updatedAt
      }
      current_status
      items {
        price
        quantity
        variant {
          _id
          product_id {
            _id
            name
          }
          image
          attributes {
            _id
            name
            value
          }
        }
      }
      note
      order_id {
        _id
        order_code
        payment {
          method
          paid_at
          transactionId
          status
        }
        status
        user_id {
          _id
        }
      }
      # shipping {
      #   from_address {
      #     name
      #     phone
      #     address
      #     province
      #     district
      #     ward
      #     province_id
      #     district_id
      #     ward_code
      #   }
      #   to_address {
      #     name
      #     phone
      #     address
      #     province
      #     district
      #     ward
      #     province_id
      #     district_id
      #     ward_code
      #   }
      # }
      shop_id {
        _id
        name
        owner {
          _id
        }
      }
      voucher {
        _id
      }
      # }
    }
  }
`;

const USER_QUERY = gql`
  query User($id: ID!) {
    user(_id: $id) {
      _id
      fullName
      email
    }
  }
`;
// ----------------------- GraphQL ------------------------
function formatCurrency(amount) {
  if (!amount) return "";
  return Number(amount).toLocaleString("vi-VN") + "₫";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("vi-VN");
}

const statusMap = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-500 text-white" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-500 text-white" },
  preparing: { label: "Đang chuẩn bị", color: "bg-cyan-500 text-white" },
  transit: { label: "Đang giao", color: "bg-orange-500 text-white" },
  delivered: { label: "Đã giao", color: "bg-green-500 text-white" },
  failed: { label: "Thất bại", color: "bg-red-500 text-white" },
  cancelled_by_shop: {
    label: "Shop - Đã hủy",
    color: "bg-gray-700 text-white",
  },
  cancelled_by_buyer: {
    label: "Khách - Đã hủy",
    color: "bg-gray-500 text-white",
  },
};

export default function ShopOrderList({ shopId }) {
  const { data, loading, error } = useQuery(SHOP_ORDERS_QUERY, {
    variables: { filter: { shopId } },
    // fetchPolicy: "network-only",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [getUser] = useLazyQuery(USER_QUERY);
  const [userCache, setUserCache] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  // const orders = useMemo(() => {
  //   if (!data?.shopOrders?.items) return [];
  //   return data.shopOrders.items;
  // }, [data]);

  const orders = useMemo(() => {
    if (!data?.shopOrders) return [];
    return data.shopOrders;
  }, [data]);

  useEffect(() => {
    const userIds = [
      ...new Set(
        orders
          .map((order) => order.order_id?.user_id?._id)
          .filter((id) => id && !userCache[id]),
      ),
    ];
    userIds.forEach((id) => {
      getUser({ variables: { id } }).then((res) => {
        if (res.data?.user) {
          setUserCache((prev) => ({
            ...prev,
            [id]: res.data.user,
          }));
        }
      });
    });
  }, [orders, getUser, userCache]);

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    ...Object.entries(statusMap).map(([value, { label }]) => ({
      value,
      label,
    })),
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const user = userCache[order.order_id?.user_id?._id] || {};
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (order.order_id?.order_code || "").toLowerCase().includes(term) ||
        (user.fullName || "").toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        (order.current_status || "").toLowerCase().includes(term);

      const matchesStatus = statusFilter
        ? order.current_status === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [orders, userCache, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]); // Added itemsPerPage to reset triggers

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const value =
      e.target.value === "all" ? filteredOrders.length : Number(e.target.value);
    setItemsPerPage(value);
  };

  if (loading)
    return (
      // <div className="w-full min-h-[200px] flex justify-center items-center">
      //   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      //   <span className="ml-4 text-blue-600">Đang tải đơn hàng...</span>
      // </div>
      <div className="p-6 bg-white rounded-2xl shadow-lg text-center">
        Đang tải đơn hàng...
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 text-center py-8">
        Lỗi khi tải đơn hàng: {error.message}
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-green-300 rounded-sm inline-block" />
        <h1 className="text-2xl font-bold">Đơn Hàng Shop</h1>
      </div>
      <div className="justify-between items-center mb-6">
        <ExportButtons
          data={filteredOrders}
          columns={[
            { label: "Mã đơn", render: (row) => row.order_id?.order_code },
            {
              label: "Khách hàng",
              render: (row) =>
                userCache[row.order_id?.user_id?._id]?.fullName || "",
            },
            // {
            //   label: "Email",
            //   render: (row) =>
            //     userCache[row.order_id?.user_id?._id]?.email || "",
            // },
            {
              label: "Tạm tính",
              render: (row) => formatCurrency(row.amounts?.subtotal),
            },
            {
              label: "Phí ship",
              render: (row) => formatCurrency(row.amounts?.shippingFee),
            },
            {
              label: "Tổng giảm",
              render: (row) =>
                formatCurrency(row.amounts?.total_discount) ||
                formatCurrency("0"),
            },
            {
              label: "Tổng tiền",
              render: (row) => formatCurrency(row.amounts?.total),
            },
            {
              label: "Phương thức thanh toán",
              render: (row) =>
                (row.order_id?.payment?.method || "").toUpperCase(),
            },
            {
              label: "Trạng thái thanh toán",
              render: (row) =>
                row.order_id?.payment?.status === "pending"
                  ? "Chưa thanh toán"
                  : row.order_id?.payment?.status === "paid"
                    ? "Đã thanh toán"
                    : row.order_id?.payment?.status,
            },
            {
              label: "Trạng thái",
              render: (row) =>
                statusOptions.find((opt) => opt.value === row.current_status)
                  ?.label || row.current_status,
            },
          ]}
          fileName="seller_orders"
          excelLabel="Excel"
          csvLabel="CSV"
          title="Danh Sách Đơn Hàng"
        />
      </div>
      <div className="mb-2 flex flex-col md:flex-row gap-4 justify-end">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã, tên, email, trạng thái..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        {/* <select
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusMap).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select> */}
        <select
          className="hover:border-blue-400 cursor-pointer w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
        <div className="flex items-center gap-2 mb-3">
          <span>Số sản phẩm mỗi trang:</span>
          <select
            value={
              itemsPerPage === filteredOrders.length ? "all" : itemsPerPage
            }
            onChange={handleItemsPerPageChange}
            className="hover:border-blue-400 cursor-pointer w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            {/* <option value={100}>100</option>
            <option value="all">Tất cả</option> */}
          </select>
        </div>
        <div className="text-right gap-2 mb-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg mr-1 border ${
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
      <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow">
        {/* <table className="w-full table-auto"> */}

        {/* ------------------------------------ */}
        <table
          className={`${viewMode === "table" ? "table-auto w-full" : "hidden"}`}
        >
          {/* --------------------------- */}
          <ColAllPageSeller type="adminOrderShop" />
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-6 text-gray-500">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, idx) => {
                const user = userCache[order.order_id?.user_id?._id] || {};
                const firstItem = order.items?.[0];
                const productName =
                  firstItem?.variant?.product_id?.name || "Không có sản phẩm";
                const variantImage = firstItem?.variant?.image;
                return (
                  <tr
                    key={order._id}
                    className={
                      idx % 2 !== 0
                        ? "bg-gray-100 hover:bg-gray-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-2 py-2 text-center border border-gray-300">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-2 py-2 break-all min-w-[100px] text-center border border-gray-300">
                      {order.order_id?.order_code}
                    </td>
                    <td className="px-1 py-2 text-center border-gray-300 border">
                      <div className="flex items-center gap-2">
                        <img
                          src={variantImage}
                          alt={productName}
                          className="w-12 h-12 min-w-12 min-h-12  object-cover rounded"
                        />
                        <span className="lg:ml-2 min-w-[120px]">
                          {productName}
                        </span>
                      </div>
                    </td>

                    <td className="px-2 py-2 min-w-[100px] text-center border border-gray-300">
                      {user.fullName}
                    </td>
                    {/* <td className="px-2 py-2 break-all min-w-[180px] text-center border border-gray-300">
                      {user.email}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300">
                      {formatCurrency(order.amounts?.subtotal)}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300">
                      {formatCurrency(order.amounts?.shippingFee)}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300">
                      {formatCurrency(order.amounts?.total_discount) ||
                        formatCurrency("0")}
                    </td> */}
                    <td className="px-2 py-2 text-center border border-gray-300 font-bold">
                      {formatCurrency(order.amounts?.total)}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300">
                      {(order.order_id?.payment?.method || "").toUpperCase()}
                      <br />
                      <span
                        className={`text-xs whitespace-nowrap ${
                          //     order.order_id?.payment?.status === "pending"
                          //       ? "text-red-500"
                          //       : "text-green-500"
                          //   }`}
                          // >
                          //   {order.order_id?.payment?.status === "pending"
                          //     ? "Chưa thanh toán"
                          //     : order.order_id?.payment?.status === "paid"
                          //     ? "Đã thanh toán"
                          //     : order.order_id?.payment?.status}
                          order.order_id?.payment?.status === "pending"
                            ? "text-red-500"
                            : order.order_id?.payment?.status === "cod"
                              ? "text-orange-500"
                              : order.order_id?.payment?.status === "paid"
                                ? "text-green-500"
                                : "text-red-500"
                        }`}
                      >
                        {order.order_id?.payment?.status === "pending"
                          ? "Chưa thanh toán"
                          : order.order_id?.payment?.status === "paid"
                            ? "Đã thanh toán"
                            : order.order_id?.payment?.status === "cod"
                              ? "Trả trực tiếp"
                              : order.order_id?.payment?.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300">
                      <span
                        className={`px-2 py-1 whitespace-nowrap rounded-full text-xs font-semibold ${
                          statusMap[order.current_status]?.color ||
                          "bg-gray-400 text-white"
                        }`}
                      >
                        {statusMap[order.current_status]?.label ||
                          order.current_status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300">
                      {/* Ngày tạo: lấy từ status_history[0]?.updatedAt */}
                      {formatDate(order.status_history?.[0]?.updatedAt)}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full cursor-pointer"
                        title="Xem chi tiết"
                        onClick={() => navigate(`/admin/order/${order._id}`)}
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
        <div
          className={`${
            viewMode === "card" ? "block" : "hidden"
          } grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 shadow`}
        >
          {paginatedOrders.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Không tìm thấy đơn hàng nào.
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const user = userCache[order.order_id?.user_id?._id] || {};
              const firstItem = order.items?.[0];
              const productName =
                firstItem?.variant?.product_id?.name || "Không có sản phẩm";
              const variantImage = firstItem?.variant?.image;
              return (
                <div
                  key={order._id}
                  className="border border-gray-300 rounded-lg p-4 shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-base">
                      Mã HD: {order.order_id?.order_code}
                    </span>

                    <button
                      onClick={() => navigate(`/admin/order/${order._id}`)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full cursor-pointer"
                      title="Xem chi tiết"
                    >
                      <VisibilityIcon />
                    </button>
                  </div>
                  <div className="flex items-center gap-2  mb-2">
                    <span>Sản phẩm:</span>

                    <img
                      src={variantImage}
                      alt={productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="ml-2">{productName}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <b>Khách:</b>{" "}
                      {user.fullName || (
                        <span className="text-gray-400 italic">
                          Đang tải...
                        </span>
                      )}
                    </p>
                    <p>
                      <b>Email:</b>{" "}
                      {user.email || (
                        <span className="text-gray-400 italic">
                          Đang tải...
                        </span>
                      )}
                    </p>
                    <p>
                      <b>Shop:</b> {order.shop_id?.name || "N/A"}
                    </p>
                    <p>
                      <b>Tiền hàng:</b>{" "}
                      {formatCurrency(order.amounts?.subtotal)}
                    </p>
                    <p>
                      <b>Phí vận chuyển:</b>{" "}
                      {formatCurrency(order.amounts?.shippingFee)}
                    </p>
                    <p>
                      <b>Giảm giá:</b>{" "}
                      {formatCurrency(order.amounts?.total_discount) ||
                        formatCurrency("0")}
                    </p>
                    <p>
                      <b>Tổng cộng:</b>{" "}
                      <span className="font-semibold">
                        {formatCurrency(order.amounts?.total)}
                      </span>
                    </p>
                    <p>
                      <b>Thanh toán:</b>{" "}
                      {(order.order_id?.payment?.method || "").toUpperCase()} -{" "}
                      <span
                        className={`text-xs whitespace-nowrap ${
                          //     order.order_id?.payment?.status === "pending"
                          //       ? "text-red-500"
                          //       : "text-green-500"
                          //   }`}
                          // >
                          //   {order.order_id?.payment?.status === "pending"
                          //     ? "Chưa thanh toán"
                          //     : order.order_id?.payment?.status === "paid"
                          //     ? "Đã thanh toán"
                          //     : order.order_id?.payment?.status}
                          order.order_id?.payment?.status === "pending"
                            ? "text-red-500"
                            : order.order_id?.payment?.status === "cod"
                              ? "text-orange-500"
                              : order.order_id?.payment?.status === "paid"
                                ? "text-green-500"
                                : "text-red-500"
                        }`}
                      >
                        {order.order_id?.payment?.status === "pending"
                          ? "Chưa thanh toán"
                          : order.order_id?.payment?.status === "paid"
                            ? "Đã thanh toán"
                            : order.order_id?.payment?.status === "cod"
                              ? "Trả trực tiếp"
                              : order.order_id?.payment?.status}
                      </span>
                    </p>
                    <p>
                      <b>Trạng thái:</b>{" "}
                      <span
                        className={`ml-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          statusMap[order.current_status]?.color ||
                          "bg-gray-400 text-white"
                        }`}
                      >
                        {statusMap[order.current_status]?.label ||
                          order.current_status}
                      </span>
                    </p>
                    <p>
                      <b>Ngày tạo:</b>{" "}
                      {formatDate(order.status_history?.[0]?.updatedAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Trang {currentPage} / {totalPages}. Đơn hàng từ{" "}
          {(currentPage - 1) * itemsPerPage + 1} đến{" "}
          {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong
          tổng cộng {filteredOrders.length} đơn hàng
        </div>
        {totalPages > 1 && (
          <div className="flex gap-1 items-center">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "bg-white text-blue-600 cursor-pointer hover:bg-blue-50"
              }`}
            >
              <i className="fas fa-chevron-left mr-1"></i> Trang trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
              }`}
            >
              Trang sau <i className="fas fa-chevron-right mr-1"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
