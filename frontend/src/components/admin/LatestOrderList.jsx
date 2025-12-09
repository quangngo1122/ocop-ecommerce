import VisibilityIcon from "@mui/icons-material/Visibility";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, gql } from "@apollo/client";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useToast } from "../../contexts/ToastProvider";

// ----------------------- GraphQL ------------------------
const USER_QUERY = gql`
  query User($id: ID!) {
    user(_id: $id) {
      _id
      fullName
      email
    }
  }
`;

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

const statusSequence = [
  "pending",
  "confirmed",
  "preparing",
  "transit",
  "delivered",
];

// ----------------------- GraphQL ------------------------
const statusMapOrder = {
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

export default function LatestOrderList({ orders = [] }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [getUser] = useLazyQuery(USER_QUERY);
  const [userCache, setUserCache] = useState({});
  const [updateShopOrderStatus, { loading: updating }] = useMutation(
    UPDATE_SHOP_ORDER_STATUS
  );

  // Popup state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [nextStatusInfo, setNextStatusInfo] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelShopOrderId, setCancelShopOrderId] = useState(null);

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
  }, [orders]);

  // Mở popup xác nhận đổi trạng thái
  const openStatusModal = (shopOrderId, nextStatus) => {
    setNextStatusInfo({ shopOrderId, nextStatus });
    setIsStatusModalOpen(true);
  };

  // Xác nhận đổi trạng thái
  const handleConfirmStatusChange = async () => {
    if (!nextStatusInfo) return;
    const { shopOrderId, nextStatus } = nextStatusInfo;
    try {
      await updateShopOrderStatus({
        variables: { shopOrderId, status: nextStatus },
      });
      setIsStatusModalOpen(false);
      setNextStatusInfo(null);
      // window.location.reload();
      showToast("Cập nhật trạng thái thành công", "success");
    } catch (err) {
      showToast("Cập nhật trạng thái thất bại", "error");
    }
  };

  // Mở popup xác nhận hủy đơn
  const openCancelModal = (shopOrderId) => {
    setCancelShopOrderId(shopOrderId);
    setIsCancelModalOpen(true);
  };

  // Xác nhận hủy đơn
  const handleCancelOrder = async () => {
    try {
      await updateShopOrderStatus({
        variables: {
          shopOrderId: cancelShopOrderId,
          status: "cancelled_by_shop",
        },
      });
      setIsCancelModalOpen(false);
      setCancelShopOrderId(null);
      // window.location.reload();
      showToast("Hủy đơn thành công", "success");
    } catch (err) {
      showToast("Huy đơn thất bại", "error");
    }
  };

  return (
    <div className="bg-[#f7faf7] overflow-x-auto rounded-xl p-4 mt-8 mb-8 border border-[#e3e9e2]">
      <div className="flex items-center mb-2">
        <div className="bg-[#c8f0c1] rounded-full p-2 pb-3 mr-3">
          <span role="img" aria-label="order" className="text-2xl p-1">
            <ShoppingBagIcon className="text-[green]" />
          </span>
        </div>
        <div>
          <div className="font-semibold text-lg">Đơn hàng mới</div>
          <div className="text-gray-500 text-sm">
            10 đơn hàng trạng thái chờ xác nhận gần nhất
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-2 text-center">Mã đơn</th>
              {/* <th className="py-2 px-2 text-center">Shop</th> */}
              {orders.some((p) => p?.shop_id) && (
                <th className="py-2 px-2 text-center">Shop</th>
              )}
              <th className="py-2 px-2 text-center">Khách hàng</th>
              {/* <th className="py-2 px-2 text-center">Tạm tính</th>
              <th className="py-2 px-2 text-center">Phí ship</th> */}
              <th className="py-2 px-2 text-center">Tổng tiền</th>
              <th className="py-2 px-2 text-center">Trạng thái</th>
              <th className="py-2 px-2 text-center">Ngày tạo</th>
              {orders.some((p) => p?.shop_id) ? (
                ""
              ) : (
                <th className="py-2 px-2 text-center">Duyệt nhanh</th>
              )}
              <th className="py-2 px-2 text-center">Xem</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8">
                  Không có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const user = userCache[order.order_id?.user_id?._id] || {};
                const currentIndex = statusSequence.indexOf(
                  order.current_status
                );
                const canApprove =
                  currentIndex >= 0 &&
                  currentIndex < statusSequence.length - 1 &&
                  ![
                    "cancelled_by_shop",
                    "cancelled_by_buyer",
                    "delivered",
                    "failed",
                  ].includes(order.current_status);
                const canCancel = ![
                  "cancelled_by_shop",
                  "cancelled_by_buyer",
                  "delivered",
                  "failed",
                  "transit",
                ].includes(order.current_status);

                return (
                  <tr key={order._id} className="bg-white">
                    <td className="py-2 px-2 text-center break-all min-w-[130px]">
                      {order.order_id?.order_code || "-"}
                    </td>
                    {order?.shop_id && (
                      <td className="py-2 px-2 text-center break-all min-w-[150px]">
                        <button
                          onClick={() =>
                            navigate(`/admin/shop/detail/${order.shop_id?._id}`)
                          }
                          className="cursor-pointer text-indigo-500 font-semibold hover:font-bold px-1 hover:px-0"
                        >
                          {order.shop_id?.name || "N/A"}
                        </button>
                      </td>
                    )}
                    {order?.shop_id ? (
                      <td className="py-2 px-2 text-center break-all min-w-[130px]">
                        <button
                          onClick={() =>
                            user._id &&
                            navigate(`/admin/user/detail/${user._id}`)
                          }
                          className="cursor-pointer text-indigo-500 font-semibold hover:font-bold px-1 hover:px-0"
                        >
                          {user.fullName || (
                            <span className="text-gray-400 italic">
                              Đang tải...
                            </span>
                          )}
                        </button>
                      </td>
                    ) : (
                      <td className="py-2 px-2 text-center break-all min-w-[130px]">
                        {user.fullName || (
                          <span className="text-gray-400 italic">
                            Đang tải...
                          </span>
                        )}
                      </td>
                    )}
                    <td className="py-2 px-2 text-center whitespace-nowrap font-bold">
                      {order.amounts?.total?.toLocaleString("vi-VN") + " đ" ||
                        0}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusMapOrder[order.current_status]?.color
                        }`}
                      >
                        {statusMapOrder[order.current_status]?.label}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      {dayjs(
                        order.status_history?.[0]?.updatedAt || order.createdAt
                      ).format("DD/MM/YYYY HH:mm")}
                    </td>
                    {/* Cột duyệt nhanh */}
                    {order?.shop_id ? (
                      ""
                    ) : (
                      <td className="py-2 px-2 text-center whitespace-nowrap flex gap-2 justify-center">
                        <button
                          className={`p-1 cursor-pointer rounded border ${
                            canApprove
                              ? "bg-white text-[blue] hover:text-blue-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          title="Chuyển trạng thái tiếp theo"
                          disabled={!canApprove || updating}
                          onClick={() => {
                            const nextStatus =
                              currentIndex < statusSequence.length - 1
                                ? statusSequence[currentIndex + 1]
                                : null;
                            if (nextStatus)
                              openStatusModal(order._id, nextStatus);
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </button>
                        {canCancel ? (
                          <button
                            className={`p-1 cursor-pointer  rounded border ${
                              canCancel
                                ? "bg-white text-[red] hover:text-red-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                            title="Hủy đơn"
                            disabled={!canCancel || updating}
                            onClick={() => openCancelModal(order._id)}
                          >
                            <CancelIcon fontSize="small" />
                          </button>
                        ) : (
                          ""
                        )}
                      </td>
                    )}
                    {order?.shop_id ? (
                      <td className="py-2 px-2  whitespace-nowrap text-center">
                        <button
                          className="cursor-pointer rounded-full border border-[#b2c2b0] p-1 hover:bg-[#e3e9e2]"
                          title="View"
                          onClick={() => navigate(`/admin/order/${order._id}`)}
                        >
                          <VisibilityIcon />
                        </button>
                      </td>
                    ) : (
                      <td className="py-2 px-2  whitespace-nowrap text-center">
                        <button
                          className="cursor-pointer rounded-full border border-[#b2c2b0] p-1 hover:bg-[#e3e9e2]"
                          title="View"
                          onClick={() =>
                            navigate(`/seller/orders/${order._id}`)
                          }
                        >
                          <VisibilityIcon />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Popup xác nhận đổi trạng thái */}
      {isStatusModalOpen && nextStatusInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
            <h2 className="text-xl font-bold mb-4">Xác nhận đổi trạng thái</h2>
            <p className="text-gray-700 mb-3">
              Bạn có chắc chắn muốn đổi trạng thái đơn hàng sang
              <b className="ml-1 text-blue-600">
                {statusMapOrder[nextStatusInfo.nextStatus]?.label ||
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
      {/* Popup xác nhận hủy đơn */}
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
                onClick={handleCancelOrder}
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
