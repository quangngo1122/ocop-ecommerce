import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { gql } from "@apollo/client";
import { useToast } from "../../contexts/ToastProvider";

// GraphQL -----------------------------------

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
        owner {
          _id
        }
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

// const UPDATE_SHOP_ORDER_STATUS = gql`
//   mutation UpdateShopOrderStatus($shopOrderId: ID!, $status: OrderStatus!) {
//     updateShopOrderStatus(shopOrderId: $shopOrderId, status: $status) {
//       _id
//       current_status
//       status_history {
//         status
//         updatedAt
//       }
//     }
//   }
// `;

const UPDATE_SHOP_ORDER_STATUS = gql`
  mutation Mutation($shopOrderId: ID!, $status: ShopOrderStatus!) {
    updateShopOrderStatus(shopOrderId: $shopOrderId, status: $status) {
      _id
      current_status
      status_history {
        status
        updatedAt
      }
    }
  }
`;

// because backend ko dùng hàm cancel nữa mà cập nhật trạng thái thành cancelled_by_shop/ cancelled_by_buyer

// const CANCEL_SHOP_ORDER = gql`
//   mutation CancelShopOrder($id: ID!, $reason: String!) {
//     cancelShopOrder(_id: $id, reason: $reason) {
//       _id
//       current_status
//       status_history {
//         status
//         updatedAt
//       }
//     }
//   }
// `;

// -----------------------end GraphQL ------------------------

const statusMap = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-500 text-white" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-500 text-white" },
  preparing: { label: "Đang chuẩn bị", color: "bg-cyan-500 text-white" },
  transit: { label: "Đang giao", color: "bg-orange-500 text-white" },
  delivered: { label: "Đã giao", color: "bg-green-500 text-white" },
  failed: { label: "Thất bại", color: "bg-red-500 text-white" },
  cancelled_by_shop: { label: "Shop - Đã hủy", color: "bg-red-500 text-white" },
  cancelled_by_buyer: {
    label: "Khách - Đã hủy",
    color: "bg-red-500 text-white",
  },
};

const paymentStatusMap = {
  pending: { label: "Chưa thanh toán", color: "bg-yellow-500 text-white" },
  paid: { label: "Đã thanh toán", color: "bg-green-500 text-white" },
  cod: { label: "Thanh toán trực tiếp", color: "bg-orange-500 text-white" },
  failed: { label: "Thanh toán thất bại", color: "bg-red-500 text-white" },
  // refunded: { label: "Đã hoàn tiền", color: "bg-blue-500 text-white" },
};

const statusSequence = [
  "pending",
  "confirmed",
  "preparing",
  "transit",
  "delivered",
];

function formatCurrency(amount) {
  if (!amount) return "";
  return Number(amount).toLocaleString("vi-VN") + "₫";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("vi-VN");
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [nextStatusInfo, setNextStatusInfo] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelShopOrderId, setCancelShopOrderId] = useState(null);

  const { data, loading, error } = useQuery(GET_SHOP_ORDER, {
    variables: { filter: { id } },
  });

  const dataOrder = data?.shopOrder?.[0];

  const { data: userData, loadingUser } = useQuery(GET_USER, {
    variables: { id: dataOrder?.order_id?.user_id?._id },
    skip: !dataOrder?.order_id?.user_id?._id,
  });

  const [updateShopOrderStatus] = useMutation(UPDATE_SHOP_ORDER_STATUS);
  // const [cancelShopOrder] = useMutation(CANCEL_SHOP_ORDER);

  useEffect(() => {
    if (dataOrder && userData?.user) {
      const defaultAddress =
        userData.user.address.find((addr) => addr.isDefault) ||
        userData.user.address[0] ||
        {};
      setOrder({
        id: dataOrder?._id,
        orderNumber: dataOrder?.order_id.order_code,
        user: {
          id: userData.user._id,
          fullName: userData.user.fullName,
          phone: userData.user.phoneNumber,
          email: userData.user.email,
          address: defaultAddress.address
            ? // ? `${defaultAddress.address}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}`
              ` ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}`
            : "",
        },
        shopOrders: [
          {
            id: dataOrder?._id,
            shop: {
              id: dataOrder?.shop_id._id,
              name: dataOrder?.shop_id.name,
            },
            items: dataOrder?.items.map((item) => ({
              product:
                item.variant && item.variant.product_id
                  ? {
                      id: item.variant.product_id._id,
                      name: item.variant.product_id.name,
                      images: [],
                    }
                  : {
                      id: "",
                      name: "",
                      images: [],
                    },
              variant: item.variant
                ? {
                    id: item.variant._id,
                    image: item.variant.image,
                    attributes: item.variant.attributes || [],
                  }
                : null,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
            subtotal: dataOrder?.amounts.subtotal,
            discount: dataOrder?.amounts.total_discount,
            shippingFee: dataOrder?.amounts.shippingFee,
            total: dataOrder?.amounts.total,
            shipping: {
              fullName: dataOrder?.shipping.to_address.name,
              phone: dataOrder?.shipping.to_address.phone,
              address: dataOrder?.shipping.to_address.address,
              province: dataOrder?.shipping.to_address.province,
              district: dataOrder?.shipping.to_address.district,
              ward: dataOrder?.shipping.to_address.ward,
              note: dataOrder?.note,
            },
            status: dataOrder?.current_status,
            status_history: dataOrder?.status_history || [
              {
                status: dataOrder?.current_status,
                updatedAt: new Date().toISOString(),
              },
            ],
            note: dataOrder?.note,
          },
        ],
        paymentMethod: dataOrder?.order_id.payment.method,
        paymentStatus: dataOrder?.order_id.payment.status,
        createdAt:
          dataOrder?.status_history?.[0]?.updatedAt || new Date().toISOString(),
        updatedAt: dataOrder?.order_id.updatedAt || new Date().toISOString(),
      });
    }
  }, [data, userData]);

  const handleNextStatus = async (shopOrderId) => {
    const shopOrder = order.shopOrders.find((so) => so.id === shopOrderId);
    const currentIndex = statusSequence.indexOf(shopOrder.status);
    if (currentIndex < statusSequence.length - 1) {
      const nextStatus = statusSequence[currentIndex + 1];
      try {
        await updateShopOrderStatus({
          variables: { shopOrderId, status: nextStatus },
        });
        // setOrder((prev) => ({
        //   ...prev,
        //   shopOrders: prev.shopOrders.map((so) =>
        //     so.id === shopOrderId
        //       ? {
        //           ...so,
        //           status: nextStatus,
        //           status_history: [
        //             ...so.status_history,
        //             { status: nextStatus, updatedAt: new Date().toISOString() },
        //           ],
        //         }
        //       : so
        //   ),
        // }));

        showToast("Cập nhật trạng thái thành công!", "success");
      } catch (err) {
        console.error("Error updating status:", err);
      }
    }
  };

  // Handle cancel order
  // const handleCancelOrder = async (shopOrderId) => {
  //   try {
  //     await cancelShopOrder({
  //       variables: { id: shopOrderId, reason: "Cancelled by shop" },
  //     });
  //     setOrder((prev) => ({
  //       ...prev,
  //       shopOrders: prev.shopOrders.map((so) =>
  //         so.id === shopOrderId
  //           ? {
  //               ...so,
  //               status: "cancelled_by_shop",
  //               status_history: [
  //                 ...so.status_history,
  //                 {
  //                   status: "cancelled_by_shop",
  //                   updatedAt: new Date().toISOString(),
  //                 },
  //               ],
  //             }
  //           : so
  //       ),
  //     }));
  //     setIsCancelModalOpen(false);
  //     setCancelShopOrderId(null);
  //   } catch (err) {
  //     console.error("Error cancelling order:", err);
  //   }
  // };
  const openStatusModal = (shopOrderId, nextStatus) => {
    setNextStatusInfo({ shopOrderId, nextStatus });
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!nextStatusInfo) return;
    const { shopOrderId, nextStatus } = nextStatusInfo;
    try {
      await updateShopOrderStatus({
        variables: { shopOrderId, status: nextStatus },
      });
      showToast("Cập nhật trạng thái thành công!", "success");
      setIsStatusModalOpen(false);
      setNextStatusInfo(null);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleCancelOrder = async (shopOrderId) => {
    try {
      await updateShopOrderStatus({
        variables: { shopOrderId, status: "cancelled_by_shop" },
      });
      // setOrder((prev) => ({
      //   ...prev,
      //   shopOrders: prev.shopOrders.map((so) =>
      //     so.id === shopOrderId
      //       ? {
      //           ...so,
      //           status: "cancelled_by_shop",
      //           status_history: [
      //             ...so.status_history,
      //             {
      //               status: "cancelled_by_shop",
      //               updatedAt: new Date().toISOString(),
      //             },
      //           ],
      //         }
      //       : so
      //   ),
      // }));
      showToast("Hủy đơn hàng thành công!", "success");
      setIsCancelModalOpen(false);
      setCancelShopOrderId(null);
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  const openCancelModal = (shopOrderId) => {
    setCancelShopOrderId(shopOrderId);
    setIsCancelModalOpen(true);
  };

  if (loading || loadingUser)
    return (
      <div className=" w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;
  if (!order) return null;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          className="p-2 rounded-full hover:bg-gray-200"
          onClick={() => navigate(-1)}
          title="Quay lại"
        >
          <ArrowBackIcon />
        </button>
        <h1 className="text-2xl font-bold">
          Chi Tiết Đơn Hàng{" "}
          <span className="text-[blue]">#{order.orderNumber}</span>
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 mb-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Thông tin đơn hàng
          </h2>
        </div>
        <div className="p-6 pt-0">
          <div className="flex flex-wrap gap-8 text-sm font-semibold">
            <div>
              <span className="text-gray-500">Mã đơn hàng:</span>{" "}
              <span className="font-bold">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">Ngày đặt hàng:</span>{" "}
              <span className="font-bold">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">Trạng thái thanh toán:</span>{" "}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  paymentStatusMap[order.paymentStatus]?.color
                }`}
              >
                {paymentStatusMap[order.paymentStatus]?.label ||
                  order.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Phương thức thanh toán:</span>{" "}
              <span className="font-bold">
                {order.paymentMethod.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Thông tin khách hàng
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <b>Họ tên:</b> {order.user.fullName}
            </div>
            <div>
              <b>Số điện thoại:</b> {order.user.phone}
            </div>
            <div>
              <b>Email:</b> {order.user.email}
            </div>
            <div>
              <b>Địa chỉ:</b> {order.user.address}
            </div>
          </div>
        </div>
      </div>
      {order.shopOrders.map((shopOrder) => (
        <div key={shopOrder.id} className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Chi tiết đơn hàng (Shop: {shopOrder.shop.name})
            </h2>
          </div>
          <div className="p-6">
            {/* <table className="min-w-full bg-white"> */}
            {/* <ColAllPageSeller type="orderDetail" /> */}
            {/* <thead> */}
            {/* <tr> */}
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr className="rounded-t-lg">
                  <th className="px-4 py-2 border-b border-gray-200 rounded-tl-lg text-sm font-semibold text-gray-600 text-center">
                    Tên SP
                  </th>
                  <th className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-600 text-center">
                    Hình Ảnh
                  </th>

                  {/* {shopOrder.items[0]?.variant?.attributes?.map((attr) => (
                    <th
                      key={attr._id}
                      className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600"
                    >
                      {attr.name}
                    </th>
                  ))} */}

                  <th className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-600 text-center">
                    Số Lượng
                  </th>
                  <th className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-600 text-center">
                    Đơn Giá
                  </th>
                  <th className="px-4 py-2 border-b border-gray-200 rounded-tr-lg text-sm font-semibold text-gray-600 text-center">
                    Thành Tiền
                  </th>
                </tr>
              </thead>

              <tbody>
                {shopOrder.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 border border-gray-200 text-sm text-center text-gray-800">
                      <div className="flex flex-col items-center">
                        <span>{item.product.name}</span>
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
                        alt="Variant"
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-sm text-center text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-sm text-center text-gray-800">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-sm text-center text-gray-800">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
                {/* {shopOrder.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 border text-sm text-center text-gray-800">
                      {item.product.name}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <img
                        src={item.variant?.image || "/no-image.jpg"}
                        alt="Variant"
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    </td>

                    {item.variant?.attributes?.map((attr) => (
                      <td
                        key={attr._id}
                        className="px-4 py-2 border text-sm text-center text-gray-800"
                      >
                        {attr.value || "N/A"}
                      </td>
                    ))}
                    <td className="px-4 py-2 border text-sm text-center text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 border text-sm text-center text-gray-800">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-2 border text-sm text-center text-gray-800">
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
                    {formatCurrency(shopOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span>Phí Vận Chuyển</span>
                  <span className="font-bold">
                    {formatCurrency(shopOrder.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span>Tổng giảm giá</span>
                  <span className="font-bold text-[red]">
                    -{formatCurrency(shopOrder.discount) || formatCurrency("0")}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-lg text-[#5aa32a] border-t border-gray-200">
                  <span>Tổng Tiền Đơn Hàng</span>
                  <span className="font-bold">
                    {formatCurrency(shopOrder.total)}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg shadow mb-6 p-6 bg-gray-100">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Đơn hàng shop: {shopOrder.shop.name}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusMap[shopOrder.status]?.color
                  }`}
                >
                  {statusMap[shopOrder.status]?.label || shopOrder.status}
                </span>
              </div>
              <div>
                <b>Tiến trình trạng thái đơn hàng:</b>
                <div className="relative border-l border-blue-500 ml-3 mt-2">
                  {(shopOrder.status_history || []).map((h, idx) => {
                    const isLatest =
                      idx === shopOrder.status_history.length - 1;
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
                          className={` ${
                            h.status === "delivered" ? "text-[green]" : ""
                          } text-sm ml-4 font-semibold ${
                            h.status === "cancelled_by_shop" ||
                            h.statexts === "cancelled_by_buyer"
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
              </div>
              <div className="flex gap-2 mt-4">
                {shopOrder.status !== "cancelled_by_shop" &&
                  shopOrder.status !== "cancelled_by_buyer" &&
                  // shopOrder.status !== "transit" &&
                  shopOrder.status !== "delivered" &&
                  shopOrder.status !== "failed" && (
                    <button
                      // onClick={() => handleNextStatus(shopOrder.id)}
                      onClick={() => {
                        const currentIndex = statusSequence.indexOf(
                          shopOrder.status
                        );
                        if (currentIndex < statusSequence.length - 1) {
                          const nextStatus = statusSequence[currentIndex + 1];
                          openStatusModal(shopOrder.id, nextStatus);
                        }
                      }}
                      className="px-4  cursor-pointer  py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {(() => {
                        const currentIndex = statusSequence.indexOf(
                          shopOrder.status
                        );
                        const nextStatus =
                          currentIndex < statusSequence.length - 1
                            ? statusMap[statusSequence[currentIndex + 1]]?.label
                            : null;
                        return nextStatus ? `${nextStatus}` : "Hoàn tất";
                      })()}
                    </button>
                  )}
                {shopOrder.status !== "cancelled_by_shop" &&
                  shopOrder.status !== "cancelled_by_buyer" &&
                  shopOrder.status !== "transit" &&
                  shopOrder.status !== "delivered" &&
                  shopOrder.status !== "failed" && (
                    <button
                      onClick={() => openCancelModal(shopOrder.id)}
                      className=" cursor-pointer px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hủy đơn
                    </button>
                  )}
              </div>
              {shopOrder.note && (
                <div className="mt-2 text-gray-700">
                  <b>Ghi chú đơn hàng:</b> {shopOrder.note}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {isStatusModalOpen && nextStatusInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <h2 className="text-xl font-bold mb-4">Xác nhận đổi trạng thái</h2>
            <p className="text-gray-700 mb-3">
              Bạn có chắc chắn muốn đổi trạng thái đơn hàng sang
              <b className="ml-1 text-blue-600">
                {statusMap[nextStatusInfo.nextStatus]?.label ||
                  nextStatusInfo.nextStatus}
              </b>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="cursor-pointer px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <h2 className="text-xl font-bold mb-4">Xác nhận hủy đơn</h2>
            <p className="text-gray-700 mb-3">
              Bạn có chắc chắn muốn hủy đơn hàng này không?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4  cursor-pointer py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Đóng
              </button>
              <button
                onClick={() => handleCancelOrder(cancelShopOrderId)}
                className="px-4 py-2 cursor-pointer  bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
