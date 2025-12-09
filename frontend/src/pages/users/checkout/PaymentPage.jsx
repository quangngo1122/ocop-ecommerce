import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { decodeId } from "../../../utils/encode";
import { gql, useLazyQuery } from "@apollo/client";
import { useToast } from "../../../contexts/ToastProvider";

const GET_ORDER_DETAIL = gql`
  query GetOrderDetail($filter: OrderFilterInput) {
    order(filter: $filter) {
      payment {
        status
      }
    }
  }
`;
export default function PaymentPage() {
  const { encodedParams } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orderData, setOrderData] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  // Thông tin ngân hàng, luôn cố định
  const bank = "970422";
  const account = "0354514832";
  const accountName = "CAM DAI HUNG";

  const [getOrderDetail] = useLazyQuery(GET_ORDER_DETAIL, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const status = data?.order?.payment?.status || "PENDING";
      setPaymentStatus(status.toUpperCase());
      if (status.toLowerCase() === "paid") {
        showToast("Đã thanh toán thành công!", "success");
        navigate("/me/orders-history");
      }
    },
  });

  useEffect(() => {
    if (!encodedParams) return;

    try {
      const decoded = JSON.parse(decodeId(encodedParams));
      setOrderData(decoded);

      // QR tạo 1 lần duy nhất
      const qrText = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${
        decoded.total
      }&addInfo=${encodeURIComponent(
        `OCOP ${decoded.orderCode}`
      )}&accountName=${encodeURIComponent(accountName)}`;
      setQrUrl(qrText);

      // Polling mỗi 2 giây
      const interval = setInterval(() => {
        getOrderDetail({
          variables: { filter: { id: decoded.orderId } },
        });
      }, 2000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error("Invalid encoded params", err);
    }
  }, [encodedParams, getOrderDetail]);

  if (!orderData) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Không tìm thấy đơn hàng!</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mt-10 mx-auto p-6 bg-white rounded shadow-md text-center">
      <h1 className="text-xl font-bold mb-4">Thanh toán đơn hàng</h1>
      <p className="mb-2">Mã đơn hàng: {orderData.orderCode}</p>
      <p className="mb-4">
        Số tiền:{" "}
        <span className="text-red-600 font-bold">
          {Number(orderData.total).toLocaleString()} ₫
        </span>
      </p>

      <div className="flex justify-center mb-2">
        {qrUrl ? (
          <img src={qrUrl} alt="QR thanh toán" className="w-60 h-60" />
        ) : (
          <p>Đang tạo QR...</p>
        )}
      </div>

      <p className="mb-4 justify-center items-center text-left">
        <br />
        <div className="flex flex-col items-center">
          <span className="font-semibold">Số tài khoản: {account}</span>
          <span className="font-semibold">Chủ tài khoản: {accountName}</span>
        </div>
      </p>
      <span className="font-semibold">Trạng thái thanh toán: </span>
      <span
        className={
          paymentStatus.toLowerCase() === "paid"
            ? "text-green-600 font-bold"
            : "text-yellow-600 font-bold"
        }
      >
        {paymentStatus.toLowerCase() === "paid"
          ? "Đã thanh toán"
          : "Chưa thanh toán"}
      </span>
      <button
        onClick={() => navigate("/me/orders-history")}
        className="mt-6 cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
      >
        Xem lịch sử đơn hàng
      </button>
    </div>
  );
}
