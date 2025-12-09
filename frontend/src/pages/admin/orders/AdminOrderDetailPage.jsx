import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// -----------------------GRAPHQL-----------------------
const GET_SHOP_ORDER = gql`
  # query ShopOrder($id: ID!) {
  #   shopOrder(_id: $id) {
  query ShopOrder($filter: ShopOrderFilter) {
    shopOrder(filter: $filter) {
      _id
      amounts {
        shippingFee
        subtotal
        total
        total_discount
      }
      current_status
      status_history {
        status
        updatedAt
      }
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
          status
          transactionId
          paid_at
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
      }
      voucher {
        _id
      }
    }
  }
`;

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(_id: $id) {
      _id
      fullName
      phoneNumber
      email
      address {
        name
        phone
        address
        province
        district
        ward
        isDefault
      }
    }
  }
`;

const SHOP_DETAIL_QUERY = gql`
  query Query($filter: ShopFilter!) {
    shop(filter: $filter) {
      _id
      name
      owner {
        fullName
        email
        phoneNumber
      }
    }
  }
`;
// -----------------------GRAPHQL-----------------------
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

const paymentStatusMap = {
  pending: { label: "Chưa thanh toán", color: "bg-yellow-500 text-white" },
  paid: { label: "Đã thanh toán", color: "bg-green-500 text-white" },
  cod: { label: "Thanh toán trực tiếp", color: "bg-orange-500 text-white" },
  failed: { label: "Thanh toán thất bại", color: "bg-red-500 text-white" },
  // refunded: { label: "Đã hoàn tiền", color: "bg-blue-500 text-white" },
};

function formatCurrency(amount) {
  if (!amount) return "0₫";
  return Number(amount).toLocaleString("vi-VN") + "₫";
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_SHOP_ORDER, {
    // variables: { id },
    variables: {
      filter: { id },
    },
    fetchPolicy: "network-only",
  });

  const order = data?.shopOrder?.[0];
  const { data: shopData } = useQuery(SHOP_DETAIL_QUERY, {
    variables: { filter: { _id: order?.shop_id?._id } },
    fetchPolicy: "network-only",
  });

  const { data: userData, loadingUser } = useQuery(GET_USER, {
    variables: { id: order?.order_id?.user_id?._id },
    skip: !order?.order_id?.user_id?._id,
  });

  if (loading)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-blue-600">Đang tải dữ liệu...</p>
      </div>
    );
  if (error) return <div className="text-red-600">Lỗi: {error.message}</div>;
  if (!data?.shopOrder) return <div>Không tìm thấy đơn hàng</div>;

  // const order = data.shopOrder;

  const orderCode = order.order_id?.order_code;
  const payment = order.order_id?.payment || {};
  const statusHistory = order.status_history || [];
  const createdAt = statusHistory[0]?.updatedAt || "";
  const customer = order.shipping?.to_address || {};
  const fromAddress = order.shipping?.from_address || {};
  const shop = order.shop_id || {};

  // Lấy tất cả tên thuộc tính (attributes) động
  // const allAttributes =
  //   order.items.length > 0
  //     ? order.items[0].variant?.attributes?.map((attr) => attr.name) || []
  //     : [];

  //-------------------------------- test trường hợp nhiều sản phẩm khác tên phân loại, nếu lỗi render thuộc tính động thì bỏ code dưới

  // const allAttributes = Array.from(
  //   new Set(
  //     order.items.flatMap(
  //       (item) => item.variant?.attributes?.map((attr) => attr.name) || []
  //     )
  //   )
  // );

  const allAttributes = Array.from(
    new Set(
      (order?.items || []).flatMap(
        (item) => item.variant?.attributes?.map((attr) => attr.name) || []
      )
    )
  );

  //--------------------------------

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button
          className="p-2 rounded-full hover:bg-gray-200"
          onClick={() => navigate(-1)}
          title="Quay lại"
        >
          <ArrowBackIcon />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {/* Chi Tiết Đơn Hàng #{orderCode} */}
          Chi Tiết Đơn Hàng <span className="text-[blue]">#{orderCode}</span>
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2  border-gray-200  gap-4">
          {/* <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-8"> */}
          <div>
            <span className="text-gray-500">Mã đơn hàng:</span>{" "}
            <span className="font-bold">{orderCode}</span>
          </div>
          <div>
            <span className="text-gray-500">Ngày đặt:</span>{" "}
            <span className="font-bold">{formatDate(createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">Trạng thái:</span>{" "}
            <span
              className={`font-bold px-2 py-1 rounded whitespace-nowrap ${
                statusMap[order.current_status]?.color
              }`}
            >
              {statusMap[order.current_status]?.label || order.current_status}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Thanh toán:</span>{" "}
            <span className="font-bold">
              {payment.method?.toUpperCase()}
              {/* {paymentStatusMap[payment.status]?.label || payment.status}) */}
              <span
                className={`px-3 whitespace-nowrap py-1 rounded-full text-xs ml-1 font-semibold ${
                  paymentStatusMap[payment.status]?.color
                }`}
              >
                {paymentStatusMap[payment.status]?.label || payment.status}
              </span>
            </span>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">Tổng tiền hàng:</span>{" "}
            <span className="font-bold">
              {/* {formatCurrency(order.amounts.subtotal)} */}
              {formatCurrency(order.amounts?.subtotal || 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Phí vận chuyển:</span>{" "}
            <span className="font-bold">
              {/* {formatCurrency(order.amounts.shippingFee)} */}
              {formatCurrency(order.amounts?.shippingFee || 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Giảm giá:</span>{" "}
            <span className="font-bold text-red-600">
              -
              {formatCurrency(order.amounts?.total_discount) ||
                formatCurrency("0")}
            </span>
          </div>
          <div>
            <span className="text-gray-500 lg:font-semibold lg:text-lg">
              Tổng thanh toán:
            </span>{" "}
            <span className="font-bold text-blue-600 lg:text-lg">
              {/* {formatCurrency(order.amounts.total)} */}
              {formatCurrency(order.amounts?.total || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Thông tin khách hàng
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:text-sm">
          <div>
            <b>Họ tên: </b>
            {/* {customer.name} */}
            {userData?.user?.fullName || "Chưa có thông tin"}
          </div>
          <div>
            <b>Số điện thoại:</b> {customer.phone}
          </div>
          {/* <div className="md:col-span-2"> */}
          <div>
            <b>Địa chỉ:</b>{" "}
            {[
              // customer.address,
              customer.ward,
              customer.district,
              customer.province,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
          <div>
            <b>Email:</b> {userData?.user?.email || "Chưa có thông tin"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="flex text-xl font-semibold text-gray-800">
            Thông tin Shop: <p className="font-bold ml-1"> {" " + shop.name}</p>
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:text-sm">
          <div>
            <b>Chủ shop:</b>{" "}
            {fromAddress.name
              ? fromAddress.name
              : shopData?.shop?.owner?.fullName}
          </div>
          <div>
            <b>Số điện thoại:</b>{" "}
            {/* {fromAddress.phone
              ? fromAddress.phone
              : shopData?.shop?.owner?.phoneNumber} */}
            {fromAddress.phone ? (
              fromAddress.phone
            ) : shopData?.shop?.owner?.phoneNumber ? (
              shopData.shop.owner.phoneNumber
            ) : (
              <span className="italic text-gray-500">Chưa cập nhật</span>
            )}
          </div>
          <div className="">
            <b>Địa chỉ:</b>{" "}
            {[
              // fromAddress.address,
              fromAddress.ward,
              fromAddress.district,
              fromAddress.province,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
          <div>
            <b>Email:</b> {shopData?.shop?.owner?.email}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Chi tiết đơn hàng Shop:
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusMap[order.current_status]?.color
            }`}
          >
            {statusMap[order.current_status]?.label || order.current_status}
          </span>
        </div>
        <div className="p-6">
          {/* <table className="min-w-full bg-white mb-4"> */}
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr className="rounded-t-lg">
                <th className="px-4 py-2 border-b border-gray-200 rounded-tl-lg text-sm font-semibold text-gray-600 text-center">
                  Sản phẩm
                </th>
                <th className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-600 text-center">
                  Ảnh
                </th>
                {/* {allAttributes.map((attrName) => (
                  <th key={attrName} className="px-4 py-2 border">
                    {attrName}
                  </th>
                ))} */}
                <th className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-600 text-center">
                  Số lượng
                </th>
                <th className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-600 text-center">
                  Đơn giá
                </th>
                <th className="px-4 py-2 border-b border-gray-200 rounded-tr-lg text-sm font-semibold text-gray-600 text-center">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {(order?.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 border border-gray-200 text-sm rounded-tl-lg">
                    <div className="flex flex-col items-center">
                      <span>{item.variant?.product_id?.name}</span>
                      {item.variant?.attributes?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.variant.attributes.map((attr) => (
                            <span
                              key={attr._id}
                              className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"
                            >
                              {`${attr.name}: ${attr.value || "N/A"}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    <img
                      src={item.variant?.image || "/no-image.jpg"}
                      alt="Product"
                      className="w-12 h-12 object-cover mx-auto"
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-sm text-center">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-sm text-center">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-sm text-center">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
              {/* {order.items.map((item, i) => ( */}
              {/* {(order?.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 border text-sm">
                    {item.variant?.product_id?.name}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <img
                      src={item.variant?.image || "/no-image.jpg"}
                      alt="Product"
                      className="w-12 h-12 object-cover mx-auto"
                    />
                  </td>
                  {allAttributes.map((attrName) => {
                    const attr = item.variant?.attributes?.find(
                      (a) => a.name === attrName
                    );
                    return (
                      <td
                        key={attrName}
                        className="px-4 py-2 border text-sm text-center"
                      >
                        {attr?.value || "..."}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 border text-sm text-center">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 border text-sm text-center">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-2 border text-sm text-center">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))} */}
            </tbody>
          </table>
          <div className="flex justify-end mt-4 text-sm font-semibold">
            <div className="w-full space-y-2">
              <div className="flex justify-between py-2">
                <span>Tổng Tiền Sản Phẩm</span>
                <span className="font-bold">
                  {/* {formatCurrency(order.amounts.subtotal)} */}
                  {formatCurrency(order.amounts?.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span>Phí Vận Chuyển</span>
                <span className="font-bold">
                  {/* {formatCurrency(order.amounts.shippingFee)} */}
                  {formatCurrency(order.amounts?.shippingFee || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span>Tổng giảm giá</span>
                <span className="font-bold text-[red]">
                  -
                  {formatCurrency(order.amounts?.total_discount) ||
                    formatCurrency("0")}
                </span>
              </div>
              <div className="flex justify-between py-2 text-lg text-[#5aa32a] border-t border-gray-200">
                <span>Tổng Tiền Đơn Hàng</span>
                <span className="font-bold">
                  {/* {formatCurrency(order.amounts.total)} */}
                  {formatCurrency(order.amounts?.total || 0)}
                </span>
              </div>
              {/* {shopOrder.voucher && (
                <div>
                  <b>Voucher:</b> {shopOrder.voucher.code}
                </div>
              )} */}
            </div>
          </div>
          {/* <div className="bg-white rounded-lg shadow mb-6 p-6"> */}
          <div className="mt-4 bg-gray-100 p-4">
            <b>Tiến trình trạng thái đơn hàng:</b>
            <div className="relative border-l border-blue-500 ml-3 mt-3">
              {statusHistory.map((h, idx) => {
                const isLatest = idx === statusHistory.length - 1;
                return (
                  <div key={idx} className="mb-6 relative">
                    <div
                      className={`absolute -left-1.5 w-3 h-3 rounded-full ${
                        h.status === "cancelled_by_shop" ||
                        h.status === "cancelled_by_buyer"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      } ${isLatest ? "animate-ping" : ""}`}
                    ></div>
                    <div
                      className={`absolute -left-1.5 w-3 h-3 rounded-full ${
                        h.status === "cancelled_by_shop" ||
                        h.status === "cancelled_by_buyer"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      } ${isLatest ? "shadow-lg shadow-blue-400" : ""}`}
                    ></div>
                    <p
                      className={`text-sm ${
                        h.status === "delivered" ? "text-[green]" : ""
                      }  ml-4 font-semibold ${
                        h.status === "cancelled_by_shop" ||
                        h.status === "cancelled_by_buyer"
                          ? "text-[red]"
                          : ""
                      }`}
                    >
                      {statusMap[h.status]?.label || h.status}
                    </p>
                    <span className="text-xs ml-4 text-gray-500">
                      {dayjs(h.updatedAt).format("DD MMMM, YYYY - h:mm A")}
                    </span>
                  </div>
                );
              })}
            </div>
            {order.note && (
              <div className="mt-2 text-gray-700">
                <b>Ghi chú đơn hàng:</b> {order.note}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
