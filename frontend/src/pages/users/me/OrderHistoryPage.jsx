// ProfileOrderPage.jsx
import React, { useEffect, useState, useContext } from "react";
import OrdersCard from "../../../components/orders/OrdersCard";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import ReviewModal from "../../../components/user/rating/ReviewModal";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";
import { encodeId } from "../../../utils/encode";

// --------------------------GRAPHQL--------------------------
const GET_ORDERS = gql`
  query Order($filter: OrdersFilterInput) {
    orders(filter: $filter) {
      shopOrders {
        _id
        current_status
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
      }
      status
      _id
      payment {
        status
        method
      }
      order_code
      amounts {
        total
      }
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($input: [CreateReviewInput]!) {
    createReview(input: $input) {
      content
    }
  }
`;

const GET_REVIEW = gql`
  query Reviews($filter: ReviewsFilter) {
    reviews(filter: $filter) {
      items {
        content
        rating
        createdAt
        product_id {
          _id
        }
      }
    }
  }
`;

const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      _id
    }
  }
`;
export default function ProfileOrderPage() {
  const { userData } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [existingReviews, setExistingReviews] = useState({});
  const [updateStatus, { loading: cancelLoading }] = useMutation(CANCEL_ORDER, {
    onCompleted: () => {
      refetch();
    },
  });

  const {
    data,
    loading: ordersLoading,
    refetch,
  } = useQuery(GET_ORDERS, {
    variables: { filter: { userId: userData?._id } },
    fetchPolicy: "network-only",
  });
  const handleCancel = async (orderId) => {
    try {
      setCancellingId(orderId);
      await updateStatus({ variables: { orderId } });
      await refetch();
      showToast("Đơn hàng đã được hủy thành công");
    } catch (err) {
      showToast("Không thể hủy đơn hàng");
    } finally {
      setCancellingId(null);
    }
  };

  const [createReview, { loading: createReviewLoading }] =
    useMutation(CREATE_REVIEW);

  const [getReview, { data: reviewData, loading: reviewLoading }] =
    useLazyQuery(GET_REVIEW);

  useEffect(() => {
    if (data) setOrders(data.orders || []);
  }, [data]);

  useEffect(() => {
    if (reviewData && selectedOrder) {
      const reviewsByVariant = {};
      reviewData.reviews.items.forEach((r) => {
        if (r.product_id?._id) reviewsByVariant[r.product_id._id] = r;
      });
      setExistingReviews(reviewsByVariant);
      setIsOpen(true);
    }
  }, [reviewData, selectedOrder]);

  // Bộ lọc trạng thái gom 2 loại
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => order.status === filterStatus);
      setFilteredOrders(filtered);
    }
  }, [orders, filterStatus]);

  const handleOpenReview = (shopOrder) => {
    setSelectedOrder(shopOrder);
    setExistingReviews({}); // reset
    getReview({
      variables: { filter: { shop_id: shopOrder?.shop_id } },
      onCompleted: (data) => {
        const reviewsByVariant = {};
        data.reviews.items.forEach((r) => {
          if (r.product_id?._id) reviewsByVariant[r.product_id._id] = r;
        });
        setExistingReviews(reviewsByVariant);
        setIsOpen(true);
      },
    });
  };

  const handleSubmitReview = async (reviewsState) => {
    if (!selectedOrder) return;

    const reviewsInput = selectedOrder.items
      .map((item) => {
        const variantId = item.variant?._id;
        const productId = item.variant?.product_id?._id;

        if (!variantId || !productId) return null;
        if (existingReviews[productId]) return null;

        const rating = reviewsState[variantId]?.rating;
        const content = reviewsState[variantId]?.content;
        if (!rating && !content) return null;

        return {
          product_id: productId,
          content,
          rating,
          shop_order_id: selectedOrder._id,
        };
      })
      .filter(Boolean);

    if (reviewsInput.length === 0) {
      showToast("Vui lòng nhập nội dung đánh giá hợp lệ");
      return;
    }

    try {
      await createReview({ variables: { input: reviewsInput } });

      showToast("Đã gửi đánh giá thành công");

      // 🔹 Refetch review mới nhất cho order này
      const { data: newReviewData } = await getReview({
        variables: { filter: { shop_id: selectedOrder.shop_id } },
        fetchPolicy: "network-only",
      });

      const reviewsByVariant = {};
      newReviewData.reviews.items.forEach((r) => {
        if (r.product_id?._id) reviewsByVariant[r.product_id._id] = r;
      });
      setExistingReviews(reviewsByVariant);

      // 🔹 Refetch orders tổng quan
      await refetch();

      setIsOpen(false);
      setSelectedOrder(null);
      setReviewingId(null);
    } catch (err) {
      // Bỏ qua lỗi product không tồn tại
      const productError = err?.graphQLErrors?.some((e) =>
        e.message.includes("product is not defined")
      );

      if (productError) {
        showToast("Đã gửi đánh giá thành công", "success");

        // 🔹 Refetch review mới nhất ngay cả khi lỗi
        try {
          const { data: newReviewData } = await getReview({
            variables: { filter: { shop_id: selectedOrder.shop_id } },
            fetchPolicy: "network-only",
          });

          const reviewsByVariant = {};
          newReviewData.reviews.items.forEach((r) => {
            if (r.product_id?._id) reviewsByVariant[r.product_id._id] = r;
          });
          setExistingReviews(reviewsByVariant);
        } catch (e) {
          console.error("Lỗi refetch review sau lỗi product:", e);
        }

        setIsOpen(false);
        setSelectedOrder(null);
        setReviewingId(null);
        await refetch(); // refetch orders
      } else {
        console.error("Lỗi gửi review:", err);
        showToast("Không thể gửi đánh giá");
      }
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return { text: "Đang hoạt động", color: "text-green-600" };
      case "cancelled":
        return { text: "Đã hủy", color: "text-red-600" };
      default:
        return { text: "Không xác định", color: "text-gray-600" };
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <div className="w-230 h-auto mt-5 bg-white rounded">
        <div className="container p-6">
          <div className="mb-4">
            <label htmlFor="statusFilter" className="mr-2 font-semibold">
              Lọc đơn hàng:
            </label>
            <select
              id="statusFilter"
              className="border rounded px-2 py-1"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled={ordersLoading}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center items-center mt-20">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                ></path>
              </svg>
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order, orderIdx) =>
              order.shopOrders.map((shopOrder, idx) => {
                const latestStatus = shopOrder.current_status;
                return (
                  <div
                    key={`${orderIdx}-${idx}`}
                    className="card my-4 p-4 border rounded"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">
                        Đơn hàng #{order?.order_code}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          getStatusLabel(order.status).color
                        }`}
                      >
                        {getStatusLabel(order.status).text}
                      </span>
                    </div>

                    <hr className="my-2 border-gray-300" />

                    {shopOrder.items.map((item, idx2) => (
                      <OrdersCard
                        key={idx2}
                        name={item.variant?.product_id?.name}
                        image={item.variant?.product_id?.images?.[0]}
                        quantity={item.quantity}
                        item={item}
                      />
                    ))}

                    <div className="flex justify-end mt-2">
                      Thành tiền:
                      <p className="text-red-600 ml-2">
                        đ {Number(order.amounts.total).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="flex gap-4 justify-end mt-4">
                      {order.status !== "cancelled" &&
                        !(
                          order.payment?.method === "online" &&
                          order.payment?.status === "paid"
                        ) && // ❌ không cho hủy nếu đã thanh toán online
                        order.shopOrders.every(
                          (shop) =>
                            shop.current_status === "pending" ||
                            shop.current_status === "confirmed" ||
                            shop.current_status === "preparing"
                        ) && (
                          <button
                            onClick={() => handleCancel(order?._id)}
                            className="text-sm font-medium cursor-pointer bg-red-500 hover:bg-red-600 w-36 h-10 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={cancellingId === order._id}
                          >
                            {cancellingId === order._id ? (
                              <svg
                                className="animate-spin h-5 w-5 mx-auto text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                ></path>
                              </svg>
                            ) : (
                              "Hủy đơn hàng"
                            )}
                          </button>
                        )}

                      <button
                        onClick={() => navigate(`/me/order/${order?._id}`)}
                        className="text-[15px] cursor-pointer bg-blue-600 w-36 h-10 text-white rounded disabled:opacity-50"
                        disabled={ordersLoading}
                      >
                        {ordersLoading ? (
                          <svg
                            className="animate-spin h-5 w-5 mx-auto text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                            ></path>
                          </svg>
                        ) : (
                          "Xem chi tiết"
                        )}
                      </button>

                      {latestStatus === "delivered" && (
                        <button
                          onClick={() => {
                            setReviewingId(shopOrder._id);
                            handleOpenReview(shopOrder);
                          }}
                          className="text-[15px] cursor-pointer bg-[#5aa32a] w-30 h-10 text-white rounded flex items-center justify-center"
                          disabled={reviewingId === shopOrder._id}
                        >
                          {reviewingId === shopOrder._id ? (
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                              ></path>
                            </svg>
                          ) : (
                            "Đánh giá"
                          )}
                        </button>
                      )}

                      {order.payment?.method === "online" &&
                        order.payment?.status === "pending" &&
                        order.status !== "cancelled" && ( // ✅ thêm điều kiện này
                          <button
                            onClick={async () => {
                              try {
                                setPayingId(order._id);

                                // encodeId async
                                const encodedParams = await encodeId(
                                  JSON.stringify({
                                    orderId: order?._id,
                                    orderCode: order.order_code,
                                    total: order?.amounts?.total,
                                  })
                                );

                                navigate(`/checkout/payment/${encodedParams}`);
                              } catch (err) {
                                console.error("Thanh toán lỗi:", err);
                                showToast(
                                  "Có lỗi khi chuyển tới trang thanh toán"
                                );
                                setPayingId(null); // reset spinner
                              }
                            }}
                            className="text-[15px] cursor-pointer bg-orange-600 w-36 h-10 text-white rounded disabled:opacity-50"
                            disabled={payingId === order._id}
                          >
                            {payingId === order._id ? (
                              <svg
                                className="animate-spin h-5 w-5 mx-auto text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                ></path>
                              </svg>
                            ) : (
                              "Tiếp tục thanh toán"
                            )}
                          </button>
                        )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <p className="text-gray-500 text-center mt-10">Chưa có đơn hàng</p>
          )}
        </div>
      </div>

      {isOpen && selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          existingReviews={existingReviews}
          onClose={() => {
            setIsOpen(false);
            setReviewingId(null); // 🔑 reset
          }}
          onSubmit={handleSubmitReview}
          loading={createReviewLoading}
        />
      )}
    </>
  );
}
