// OrderDetailPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import OrdersCard from "../../../components/orders/OrdersCard";

// --------------------------GRAPHQL--------------------------
const GET_ORDER_DETAIL = gql`
  query GetOrderDetail($filter: OrderFilterInput) {
    order(filter: $filter) {
      _id
      shopOrders {
        _id
        current_status
        shop_id {
          name
        }
        items {
          quantity
          price
          total
          variant {
            _id
            selling_price
            product_id {
              _id
              images
              name
              price {
                min_price
              }
            }
            attributes {
              name
              value
            }
          }
        }
        shipping {
          to_address {
            name
            address
            phone
            province
            ward
            district
          }
        }
        amounts {
          subtotal
          shippingFee
          total_discount
          total
        }
      }
      amounts {
        total
        total_discount
        subtotal
        shippingFee
      }
      status
      createdAt
      updatedAt
      order_code
      payment {
        method
        status
      }
    }
  }
`;

export default function OrderDetailPage() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_ORDER_DETAIL, {
    variables: { filter: { id: orderId } },
    fetchPolicy: "network-only",
  });

  if (loading) return <div className="p-6">Đang tải đơn hàng...</div>;
  if (error)
    return <div className="p-6 text-red-600">Lỗi: {error.message}</div>;

  const order = data?.order;
  if (!order) return <div className="p-6">Không tìm thấy đơn hàng.</div>;

  const shopOrders = order.shopOrders || [];

  const getStatusLabel = (status, payment) => {
    // Nếu đã thanh toán online thành công
    if (payment?.method !== "COD" && payment?.status === "paid") {
      return {
        text: "Chờ nhận hàng",
        color: "text-blue-800",
        bg: "bg-blue-100",
      };
    }

    // Các trạng thái khác
    switch (status) {
      case "pending":
        return {
          text: "Chờ thanh toán",
          color: "text-yellow-800",
          bg: "bg-yellow-100",
        };
      case "confirmed":
        return {
          text: "Đã xác nhận",
          color: "text-blue-800",
          bg: "bg-blue-100",
        };
      case "preparing":
        return {
          text: "Đang chuẩn bị hàng",
          color: "text-blue-700",
          bg: "bg-blue-50",
        };
      case "transit":
        return {
          text: "Đang vận chuyển",
          color: "text-indigo-800",
          bg: "bg-indigo-100",
        };
      case "delivered":
        return {
          text: "Giao thành công",
          color: "text-green-800",
          bg: "bg-green-100",
        };
      case "failed":
        return {
          text: "Giao thất bại",
          color: "text-red-800",
          bg: "bg-red-100",
        };
      case "cancelled_by_shop":
        return {
          text: "Shop đã hủy",
          color: "text-gray-800",
          bg: "bg-gray-200",
        };
      case "cancelled_by_buyer":
        return {
          text: "Người mua đã hủy",
          color: "text-gray-800",
          bg: "bg-gray-200",
        };
      default:
        return {
          text: "Không xác định",
          color: "text-black",
          bg: "bg-gray-100",
        };
    }
  };

  return (
    <div className="container mx-auto w-230 p-6 bg-white rounded">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 cursor-pointer px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        &larr; Quay lại
      </button>

      <h1 className="text-xl font-bold mb-2">Đơn hàng #{order?.order_code}</h1>
      <p className="mb-4">
        Ngày tạo: {new Date(order.createdAt).toLocaleString()}
      </p>

      {/* Shop orders */}
      {shopOrders.map((shopOrder) => {
        const toAddress = shopOrder.shipping?.to_address;
        const amounts = shopOrder.amounts || {};
        return (
          <div key={shopOrder._id} className="mb-6 p-4 border rounded">
            <h2 className="text-lg font-bold mb-2">
              Shop: {shopOrder.shop_id?.name || "Không xác định"}
            </h2>
            <p>
              Trạng thái:{" "}
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  getStatusLabel(shopOrder.current_status, order.payment)?.color
                } ${
                  getStatusLabel(shopOrder.current_status, order.payment)?.bg
                }`}
              >
                {getStatusLabel(shopOrder.current_status, order.payment)?.text}
              </span>
            </p>

            {/* Shipping Address */}
            {toAddress && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <h3 className="font-semibold mb-1">Địa chỉ giao hàng:</h3>
                <p>Tên người nhận: {toAddress.name}</p>
                <p>Địa chỉ: {toAddress.address}</p>
                <p>Phường/Xã: {toAddress.ward}</p>
                <p>Quận/Huyện: {toAddress.district}</p>
                <p>Tỉnh/TP: {toAddress.province || "Chưa xác định"}</p>
                <p>Số điện thoại: {toAddress.phone}</p>
              </div>
            )}

            <hr className="my-4 border-gray-300" />

            {/* Items */}
            {shopOrder.items?.map((item, idx2) => (
              <OrdersCard
                key={idx2}
                name={item.variant?.product_id?.name || "Không xác định"}
                image={item.variant?.product_id?.images?.[0]}
                quantity={item.quantity || 0}
                item={item}
              />
            ))}
          </div>
        );
      })}

      <hr className="my-4 border-gray-300" />

      {/* Order total */}
      <div className="flex flex-col items-end gap-1 font-bold text-xl">
        <p>
          Tổng tiền hàng: đ{" "}
          {order.amounts?.subtotal?.toLocaleString("vi-VN") || 0}
        </p>
        <p>
          Phí vận chuyển: đ{" "}
          {order.amounts?.shippingFee?.toLocaleString("vi-VN") || 0}
        </p>
        <p>
          Giảm giá: đ{" "}
          {order.amounts?.total_discount?.toLocaleString("vi-VN") || 0}
        </p>
        <p className="text-red-600">
          Tổng đơn hàng: đ {order.amounts?.total?.toLocaleString("vi-VN") || 0}
        </p>
      </div>
    </div>
  );
}
