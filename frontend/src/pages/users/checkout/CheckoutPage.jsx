import React, { useState, useEffect, useContext, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";
import { encodeId } from "../../../utils/encode";

// -----------------------GRAPHQL------------------------
const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      _id
      order_code
    }
  }
`;
const REMOVE_FROM_CART = gql`
  mutation Mutation($cartId: ID!) {
    removeFromCart(cartId: $cartId) {
      items {
        _id
      }
    }
  }
`;
const GET_CART_FOR_CHECKOUT = gql`
  query Checkout($input: OrderInput!) {
    checkout(input: $input) {
      orderSummary {
        total
        subtotal
        shippingFee
        discount
      }
      shopItems {
        shop {
          _id
          name
          vouchers {
            value
            code
            _id
            end_date
            start_date
            status
            min_order_value
            type
          }
        }
      }
    }
  }
`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  // loading
  const [placingOrder, setPlacingOrder] = useState(false);
  const { selectedItems } = location.state || { selectedItems: [] };
  const { userData } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderSummary, setOrderSummary] = useState(null);
  // Lưu voucher theo shop
  const [appliedVouchers, setAppliedVouchers] = useState({});
  const [availableVouchers, setAvailableVouchers] = useState([]);

  const [createOrder] = useMutation(CREATE_ORDER);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART);
  // Gom items theo shopId
  const groupedShopItems = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const shopId = item.shop?._id;
      if (!acc[shopId]) acc[shopId] = [];
      acc[shopId].push({
        productId: item.product._id,
        variantId: item.VariantId,
        quantity: item.quantity,
      });
      return acc;
    }, {});
  }, [selectedItems]);

  const shopOrderItems = useMemo(() => {
    return Object.entries(groupedShopItems).map(([shopId, orderItems]) => ({
      shopId,
      voucherId: appliedVouchers[shopId]?._id || null,
      orderItems,
    }));
  }, [groupedShopItems, appliedVouchers]);

  const total = selectedItems.reduce(
    (sum, item) => sum + (item.product?.price?.min_price || 0) * item.quantity,
    0
  );

  const { data: checkoutData, refetch: refetchCheckout } = useQuery(
    GET_CART_FOR_CHECKOUT,
    {
      variables: {
        input: {
          addressId: selectedAddressId,
          paymentMethod,
          shopOrderItems,
          total,
        },
      },
      fetchPolicy: "network-only",
    }
  );
  // Set addresses từ userData
  useEffect(() => {
    if (userData?.address) {
      setAddresses(userData.address);
      const defaultAddr = userData.address.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    }
  }, [userData]);
  console.log(checkoutData);
  // Refetch checkout khi thay đổi địa chỉ, voucher hoặc paymentMethod
  useEffect(() => {
    if (selectedAddressId) {
      console.log("🔄 Gọi refetchCheckout...");
      refetchCheckout({
        input: {
          addressId: selectedAddressId,
          paymentMethod,
          shopOrderItems,
          total,
        },
      });
    }
  }, [selectedAddressId, appliedVouchers, paymentMethod, total]);

  // Cập nhật orderSummary
  useEffect(() => {
    if (checkoutData?.checkout?.orderSummary) {
      setOrderSummary(checkoutData.checkout.orderSummary);
    }
  }, [checkoutData]);
  // Gộp voucher từ các shop
  useEffect(() => {
    if (checkoutData?.checkout?.shopItems) {
      const vouchers = checkoutData.checkout.shopItems.flatMap(
        (shopItem) =>
          shopItem.shop.vouchers?.map((v) => ({
            ...v,
            shopId: shopItem.shop._id,
            shopName: shopItem.shop.name,
          })) || []
      );
      setAvailableVouchers(vouchers);
    }
  }, [checkoutData?.checkout?.shopItems]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId)
      return showToast("Vui lòng chọn địa chỉ giao hàng!");
    if (!paymentMethod)
      return showToast("Vui lòng chọn phương thức thanh toán!");

    try {
      setPlacingOrder(true);
      // Chuẩn bị dữ liệu từng shop
      const shopOrdersInput = Object.entries(groupedShopItems).map(
        ([shopId, orderItems]) => ({
          shopId,
          voucherId: appliedVouchers[shopId]?._id || null,
          orderItems: orderItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        })
      );

      // Tạo đơn hàng
      const { data } = await createOrder({
        variables: {
          input: {
            addressId: selectedAddressId,
            paymentMethod,
            shopOrderItems: shopOrdersInput,
            total,
          },
        },
      });

      if (data?.createOrder) {
        const createdOrder = data.createOrder;
        // Xóa giỏ hàng song song
        for (const item of selectedItems) {
          try {
            await removeFromCart({ variables: { cartId: item._id } });
          } catch (err) {
            console.warn("Xóa cart item thất bại", item._id, err);
          }
        }

        if (paymentMethod === "cod") {
          showToast("Đặt hàng thành công!");
          navigate("/me/orders-history");
        } else if (paymentMethod === "online") {
          const encodedParams = encodeId(
            JSON.stringify({
              orderId: createdOrder._id,
              orderCode: createdOrder.order_code,
              total: orderSummary?.total,
            })
          );
          navigate(`/checkout/payment/${encodedParams}`);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi khi đặt hàng, vui lòng thử lại.");
    } finally {
      setPlacingOrder(false);
    }
  };
  // 🟢 Tự động gỡ voucher không đủ điều kiện
  useEffect(() => {
    Object.entries(appliedVouchers).forEach(([shopId, voucher]) => {
      const shopTotal = selectedItems
        .filter((i) => i.shop?._id === shopId)
        .reduce(
          (sum, i) => sum + (i.product?.price?.min_price || 0) * i.quantity,
          0
        );

      if (voucher.min_order_value && shopTotal < voucher.min_order_value) {
        // Gỡ bỏ
        setAppliedVouchers((prev) => {
          const newVouchers = { ...prev };
          delete newVouchers[shopId];
          return newVouchers;
        });
      }
    });
  }, [selectedItems, appliedVouchers]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon fontSize="medium" />
        </IconButton>
        <h1 className="text-xl font-semibold">Thanh toán</h1>
      </div>

      {/* Sản phẩm */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Sản phẩm đã chọn</h2>
        {selectedItems.map((item) => (
          <div key={item._id} className="flex items-center border-b py-3 gap-4">
            {/* Ảnh sản phẩm */}
            <img
              src={item.product?.images?.[0]}
              alt={item.product?.name}
              className="w-16 h-16 object-cover rounded"
            />

            {/* Thông tin sản phẩm */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" title={item.product?.name}>
                {item.product?.name}
              </p>

              {/* Tên shop */}
              {item.shop?.name && (
                <p
                  className="text-sm text-gray-500 truncate max-w-full"
                  title={item.shop.name}
                >
                  {item.shop.name}
                </p>
              )}

              {/* Thuộc tính */}
              {item.attributes?.length > 0 && (
                <p
                  className="text-sm text-gray-500 truncate"
                  title={item.attributes
                    .map((attr) => `${attr.name}: ${attr.value}`)
                    .join(", ")}
                >
                  {item.attributes
                    .map((attr) => `${attr.name}: ${attr.value}`)
                    .join(", ")}
                </p>
              )}

              <p className="text-sm text-gray-500">
                Số lượng: x{item.quantity}
              </p>
            </div>

            {/* Giá */}
            <div className="text-right min-w-[80px]">
              <p>{item.product?.price?.min_price?.toLocaleString()} ₫</p>
              <p className="text-sm text-gray-500">
                Tổng:{" "}
                {(
                  (item.product?.price?.min_price || 0) * item.quantity
                ).toLocaleString()}{" "}
                ₫
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Địa chỉ */}
      <div className="mb-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold mb-3">Địa chỉ giao hàng</h2>
          <button
            onClick={() => navigate("/me/address")}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Quản lý địa chỉ
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center border p-6 rounded bg-gray-50">
            <p className="mb-3 text-gray-700">Bạn chưa có địa chỉ nào!</p>
            <button
              onClick={() => navigate("/me/address")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Thêm địa chỉ mới
            </button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
            {addresses
              .slice() // copy mảng để không mutate
              .sort((a, b) =>
                a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
              )
              .map((addr) => (
                <label
                  key={addr._id}
                  className={`min-w-[300px] border p-3 rounded cursor-pointer shrink-0 relative ${
                    selectedAddressId === addr._id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mr-2"
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {addr.name} - {addr.phone}
                      </p>
                      {addr.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{addr.address}</p>
                    <p className="text-sm text-gray-600">
                      {addr.ward}, {addr.district}, {addr.province}
                    </p>
                  </div>
                </label>
              ))}
          </div>
        )}
      </div>

      {/* Phương thức thanh toán */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Phương thức thanh toán</h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            Thanh toán khi nhận hàng (COD)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
            />
            Chuyển khoản ngân hàng
          </label>
        </div>
      </div>

      {/* Voucher list */}
      {/* Voucher list */}
      {availableVouchers.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">
            Voucher có sẵn
          </h3>
          <div className="max-h-[220px] overflow-y-auto pr-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...availableVouchers]
                .sort((a, b) => {
                  // Tính tổng tiền của từng shop
                  const shopTotalA = selectedItems
                    .filter((i) => i.shop?._id === a.shopId)
                    .reduce(
                      (sum, i) =>
                        sum + (i.product?.price?.min_price || 0) * i.quantity,
                      0
                    );
                  const shopTotalB = selectedItems
                    .filter((i) => i.shop?._id === b.shopId)
                    .reduce(
                      (sum, i) =>
                        sum + (i.product?.price?.min_price || 0) * i.quantity,
                      0
                    );

                  const notEligibleA = shopTotalA < (a.min_order_value || 0);
                  const notEligibleB = shopTotalB < (b.min_order_value || 0);

                  // 🟢 Ưu tiên voucher đủ điều kiện lên trước
                  if (!notEligibleA && notEligibleB) return -1;
                  if (notEligibleA && !notEligibleB) return 1;
                  return 0;
                })
                .map((v) => {
                  const isApplied = appliedVouchers[v.shopId]?._id === v._id;

                  const now = new Date();
                  const startDate = new Date(v.start_date);
                  const endDate = new Date(v.end_date);
                  const isExpired = now > endDate;

                  // 👉 Tính tổng tiền của shop này
                  const shopTotal = selectedItems
                    .filter((i) => i.shop?._id === v.shopId)
                    .reduce(
                      (sum, i) =>
                        sum + (i.product?.price?.min_price || 0) * i.quantity,
                      0
                    );

                  const notEligible = shopTotal < (v.min_order_value || 0);

                  return (
                    <div
                      key={v._id}
                      onClick={() => {
                        if (!isExpired && !notEligible) {
                          setAppliedVouchers((prev) => {
                            if (isApplied) {
                              const newVouchers = { ...prev };
                              delete newVouchers[v.shopId];
                              return newVouchers;
                            } else {
                              return { ...prev, [v.shopId]: v };
                            }
                          });
                        }
                      }}
                      className={`relative rounded-xl border p-4 shadow-md transition-all duration-200
                  ${
                    isApplied
                      ? "border-green-600 bg-gradient-to-r from-green-100 to-green-50 ring-2 ring-green-300"
                      : "border-gray-200 bg-white hover:bg-green-50"
                  }
                  ${
                    isExpired || notEligible
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                  }
                `}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-800">
                          {v.code}
                        </span>
                        {isApplied && !isExpired && !notEligible && (
                          <span className="text-green-600 text-sm font-medium">
                            Đang áp dụng
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Giảm:{" "}
                        <span className="font-medium">
                          {v.type === "percentage"
                            ? `${v.value}%`
                            : v.type === "fixed_amount"
                            ? `${v.value.toLocaleString()} ₫`
                            : v.value}
                        </span>
                      </p>

                      <p className="text-sm text-gray-500 mb-1">
                        Shop: {v.shopName}
                      </p>
                      {v.min_order_value && (
                        <p className="text-xs text-gray-500 mb-1">
                          Đơn tối thiểu: {v.min_order_value.toLocaleString()} ₫
                        </p>
                      )}
                      <p
                        className={`text-xs mb-1 ${
                          isExpired
                            ? "text-red-500 font-semibold"
                            : notEligible
                            ? "text-orange-500"
                            : "text-gray-400"
                        }`}
                      >
                        {startDate.toLocaleDateString()} -{" "}
                        {endDate.toLocaleDateString()}
                        {isExpired && " (Hết hạn)"}
                        {notEligible && " (Chưa đủ điều kiện)"}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 mt-10 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Tóm tắt đơn hàng</h2>
        {orderSummary ? (
          <div className="flex flex-col gap-2 text-gray-700">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{orderSummary.subtotal.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span>{orderSummary.shippingFee.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá:</span>
              <span>-{orderSummary.discount.toLocaleString()} ₫</span>
            </div>
            <hr className="my-2 border-gray-300" />
            <div className="flex justify-between font-bold text-lg text-green-600">
              <span>Tổng cộng:</span>
              <span>{orderSummary.total.toLocaleString()} ₫</span>
            </div>
          </div>
        ) : (
          <p>Đang tính toán đơn hàng...</p>
        )}
      </div>

      {/* Button đặt hàng */}
      <div className="flex justify-end">
        <button
          onClick={handlePlaceOrder}
          disabled={placingOrder}
          className={`bg-green-600 cursor-pointer hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2 ${
            placingOrder ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {placingOrder && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {placingOrder ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </div>
    </div>
  );
}
