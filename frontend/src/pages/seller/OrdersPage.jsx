import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ColAllPageSeller from "../../components/seller/ColAllPageSeller";
import ExportButtons from "../../components/seller/export/ExportButtons";
import GridOnIcon from "@mui/icons-material/GridOn";
import TableRowsIcon from "@mui/icons-material/TableRows";
import GridViewIcon from "@mui/icons-material/GridView";
import { useToast } from "../../contexts/ToastProvider";

// ----------------------- GraphQL ------------------------

const MY_SHOP_ORDERS_QUERY = gql`
  # query MyShopOrders {
  #   myShopOrders {
  #     items {
  query shopOrders($filter: ShopOrdersInput) {
    shopOrders(filter: $filter) {
      _id
      amounts {
        shippingFee
        subtotal
        total
        total_discount
      }
      current_status
      # items {
      #   price
      #   product {
      #     _id
      #     name
      #   }
      #   quantity
      # }

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
      shipping {
        from_address {
          name
          phone
          address
          province
          district
          ward
          province_id
          district_id
          ward_code
        }
        to_address {
          name
          phone
          address
          province
          district
          ward
          province_id
          district_id
          ward_code
        }
      }
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
    }
  }
  # }
`;

const MY_SHOP = gql`
  query MyShop {
    myShop {
      _id
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

// ----------------------- End GraphQL ------------------------

function formatCurrency(amount) {
  if (!amount) return "";
  return Number(amount).toLocaleString("vi-VN") + "₫";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("vi-VN");
}

export default function OrdersPage() {
  const { data: myshop } = useQuery(MY_SHOP);
  const shopId = myshop?.myShop?._id;
  const { showToast } = useToast();

  // const { data, loading, error } = useQuery(MY_SHOP_ORDERS_QUERY);
  const { data, loading, error } = useQuery(MY_SHOP_ORDERS_QUERY, {
    variables: { filter: { shopId } },
    fetchPolicy: "network-only",
  });
  const [getUser] = useLazyQuery(USER_QUERY);
  const [userCache, setUserCache] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "preparing", label: "Đang chuẩn bị hàng" },
    { value: "transit", label: "Đang giao hàng" },
    { value: "delivered", label: "Đã giao hàng" },
    { value: "failed", label: "Thất bại" },
    { value: "cancelled_by_shop", label: "Shop - Đã hủy" },
    { value: "cancelled_by_buyer", label: "Khách - Đã hủy" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "confirmed":
        return "bg-orange-500 text-white";
      case "preparing":
        return "bg-blue-500 text-white";
      case "transit":
        return "bg-purple-500 text-white";
      case "delivered":
        return "bg-green-500 text-white";
      case "failed":
        return "bg-red-600 text-white";
      case "cancelled_by_shop":
        return "bg-red-500 text-white";
      case "cancelled_by_buyer":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const orders = useMemo(() => {
    if (!data?.shopOrders) return [];
    return data.shopOrders;
  }, [data]);

  useEffect(() => {
    const userIds = [
      ...new Set(
        orders
          .map((order) => order.order_id?.user_id?._id)
          .filter((id) => id && !userCache[id])
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const user = userCache[order.order_id?.user_id?._id] || {};
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (order.order_id?.order_code || "").toLowerCase().includes(term) ||
        (user.fullName || "").toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        (order.order_id?.payment?.method || "").toLowerCase().includes(term) ||
        (order.order_id?.payment?.status || "").toLowerCase().includes(term) ||
        (order.current_status || "").toLowerCase().includes(term);

      const matchesStatus = statusFilter
        ? order.current_status === statusFilter
        : true;

      const matchesTotal =
        (minTotal === "" || order.amounts?.total >= Number(minTotal)) &&
        (maxTotal === "" || order.amounts?.total <= Number(maxTotal));

      return matchesSearch && matchesStatus && matchesTotal;
    });
  }, [orders, userCache, searchTerm, statusFilter, minTotal, maxTotal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, minTotal, maxTotal, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
      <div className="w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  if (error) return <div>Lỗi khi tải đơn hàng: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản Lý Đơn Hàng</h1>

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

      <div className="my-3">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 sm:grid-cols-1">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên, email, trạng thái..."
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div>
            <select
              className="cursor-pointer hover:border-blue-400 w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              placeholder="Tổng tiền từ"
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Tổng tiền đến"
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              value={maxTotal}
              onChange={(e) => setMaxTotal(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
        <div className="flex items-center gap-2 mb-3">
          <span>Số đơn hàng mỗi trang:</span>
          <select
            value={
              itemsPerPage === filteredOrders.length ? "all" : itemsPerPage
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
        <div className="text-right gap-2 hidden md:table w-full mb-3">
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

      <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow">
        {paginatedOrders.length > 0 ? (
          <>
            <div
              className={`${
                viewMode === "table" ? "hidden md:table w-full" : "hidden"
              }`}
            >
              <table className="w-full table-auto">
                <ColAllPageSeller type="order" />
                <tbody>
                  {paginatedOrders.map((order, index) => {
                    const user = userCache[order.order_id?.user_id?._id] || {};
                    const firstItem = order.items?.[0];
                    const productName =
                      firstItem?.variant?.product_id?.name ||
                      "Không có sản phẩm";
                    const variantImage = firstItem?.variant?.image;
                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-gray-200 ${
                          index % 2 === 0 ? "bg-gray-100" : ""
                        }`}
                      >
                        <td className="px-1 break-all min-w-[100px] py-2 text-center border-gray-300 border">
                          {order.order_id?.order_code}
                        </td>
                        <td className="px-1 py-2 break-all min-w-[100px] text-center border-gray-300 border">
                          {user.fullName || (
                            <span className="text-gray-400 italic">
                              Đang tải...
                            </span>
                          )}
                        </td>
                        <td className="px-1 py-2 text-center border-gray-300 border">
                          <div className="flex items-center gap-2">
                            <img
                              src={variantImage}
                              alt={productName}
                              className="w-12 h-12 min-w-12 min-h-12  object-cover rounded"
                            />
                            <span className="lg:ml-4">{productName}</span>
                          </div>
                        </td>
                        {/* <td className="px-1 py-2 break-all min-w-[180px] text-center border-gray-300 border">
                          {user.email || (
                            <span className="text-gray-400 italic">
                              Đang tải...
                            </span>
                          )}
                        </td> */}
                        {/* <td className="px-1 py-2 text-center border-gray-300 border">
                          {formatCurrency(order.amounts?.subtotal)}
                        </td>
                        <td className="px-1 py-2 text-center border-gray-300 border">
                          {formatCurrency(order.amounts?.shippingFee)}
                        </td>
                        <td className="px-1 py-2 text-center border-gray-300 border">
                          {formatCurrency(order.amounts?.total_discount) ||
                            formatCurrency("0")}
                        </td> */}
                        <td className="px-1 py-2 text-center border-gray-300 border font-bold">
                          {formatCurrency(order.amounts?.total)}
                        </td>
                        <td className="px-1 py-2 text-center border-gray-300 border">
                          {(
                            order.order_id?.payment?.method || ""
                          ).toUpperCase()}
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
                        <td className="whitespace-nowrap px-1 py-2 text-center border-gray-300 border">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              order.current_status
                            )}`}
                          >
                            {statusOptions.find(
                              (opt) => opt.value === order.current_status
                            )?.label || order.current_status}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-center border-gray-300 border">
                          <div className="gap-2">
                            <button
                              onClick={() =>
                                navigate(`/seller/orders/${order._id}`)
                              }
                              className="p-1 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              <DriveFileRenameOutlineIcon />
                            </button>
                            {/* <button
                              onClick={() => handleDelete(order._id)}
                              className="p-1 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              <DeleteIcon />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className={`${
                viewMode === "card" ? "block" : "md:hidden"
              } grid grid-cols-1 lg:grid-cols-2 gap-4 p-4`}
            >
              {paginatedOrders.map((order) => {
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
                      <span className="font-bold">
                        Mã HD: {order.order_id?.order_code}
                      </span>
                      <button
                        onClick={() => navigate(`/seller/orders/${order._id}`)}
                        className="p-1 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <DriveFileRenameOutlineIcon />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Sản phẩm:</span>

                      <img
                        src={variantImage}
                        alt={productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="ml-2">{productName}</span>
                    </div>
                    <p>Tên KH: {user.fullName}</p>
                    <p>Email: {user.email}</p>
                    <p>Tạm Tính: {formatCurrency(order.amounts?.subtotal)}</p>
                    <p>
                      Phí Vận Chuyển:{" "}
                      {formatCurrency(order.amounts?.shippingFee)}
                    </p>
                    <p>
                      Giảm Giá:{" "}
                      {formatCurrency(order.amounts?.total_discount) ||
                        formatCurrency("0")}
                    </p>
                    <p className="font-semibold">
                      Tổng Tiền: {formatCurrency(order.amounts?.total)}
                    </p>
                    <p>
                      PT Thanh Toán:{" "}
                      {(order.order_id?.payment?.method || "").toUpperCase()}
                      <span
                        className={`text-xs ${
                          //     order.order_id?.payment?.status === "pending"
                          //       ? "text-red-500"
                          //       : "text-green-500"
                          //   }`}
                          // >
                          //   {" "}
                          //   (
                          //   {order.order_id?.payment?.status === "pending"
                          //     ? "Chưa thanh toán"
                          //     : order.order_id?.payment?.status === "paid"
                          //     ? "Đã thanh toán"
                          //     : order.order_id?.payment?.status}
                          //   )
                          order.order_id?.payment?.status === "pending"
                            ? "text-red-500"
                            : order.order_id?.payment?.status === "cod"
                            ? "text-orange-500"
                            : order.order_id?.payment?.status === "paid"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {" "}
                        (
                        {order.order_id?.payment?.status === "pending"
                          ? "Chưa thanh toán"
                          : order.order_id?.payment?.status === "paid"
                          ? "Đã thanh toán"
                          : order.order_id?.payment?.status === "cod"
                          ? "Trả trực tiếp"
                          : order.order_id?.payment?.status}
                        )
                      </span>
                    </p>
                    <div className="justify-center mt-2">
                      <p>
                        Trạng Thái Đơn:
                        <span
                          className={`px-2 py-1 rounded-full text-xs ml-2 ${getStatusColor(
                            order.current_status
                          )}`}
                        >
                          {statusOptions.find(
                            (opt) => opt.value === order.current_status
                          )?.label || order.current_status}
                        </span>
                      </p>

                      {/* <button
                        onClick={() => handleDelete(order._id)}
                        className="p-1 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        <DeleteIcon />
                      </button> */}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Không tìm thấy đơn hàng nào.
          </div>
        )}
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
