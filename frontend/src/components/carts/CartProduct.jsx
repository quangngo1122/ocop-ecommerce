import React, { useState, useRef, useEffect } from "react";
import { CircularProgress } from "@mui/material";

export default function CartProduct({
  products,
  checkedItems,
  onShopChange,
  onItemChange,
  onQuantityChange,
  onRemove,
  deletingItems,
  shop,
}) {
  const [updating, setUpdating] = useState({});
  const [deleting, setDeleting] = useState({});
  const [quantities, setQuantities] = useState({});
  const updateTimeout = useRef({});

  // Sync quantities khi products thay đổi
  useEffect(() => {
    const newQuantities = products.reduce((acc, p) => {
      acc[p.VariantId] = p.quantity || 1;
      return acc;
    }, {});
    setQuantities(newQuantities);
  }, [products]);

  const debounceUpdate = (VariantId, value) => {
    if (updateTimeout.current[VariantId]) {
      clearTimeout(updateTimeout.current[VariantId]);
    }
    updateTimeout.current[VariantId] = setTimeout(async () => {
      try {
        setUpdating((prev) => ({ ...prev, [VariantId]: true }));
        await onQuantityChange(VariantId, value);
      } catch (err) {
        console.error(err);
      } finally {
        setUpdating((prev) => ({ ...prev, [VariantId]: false }));
        delete updateTimeout.current[VariantId];
      }
    }, 500);
  };

  const handleIncrease = (id) => {
    const product = products.find((p) => p.VariantId === id);
    if (!product) return;

    const maxQty = product.stock_quantity || 9999; // Tồn kho
    const newQty = Math.min(quantities[id] + 1, maxQty);

    setQuantities((prev) => ({ ...prev, [id]: newQty }));
    debounceUpdate(id, newQty);
  };

  const handleDecrease = (id) => {
    const newQty = Math.max(1, quantities[id] - 1);
    setQuantities((prev) => ({ ...prev, [id]: newQty }));
    debounceUpdate(id, newQty);
  };

  const handleRemoveClick = async (VariantId, cartId) => {
    setDeleting((prev) => ({ ...prev, [VariantId]: true }));
    try {
      await onRemove(VariantId, cartId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting((prev) => ({ ...prev, [VariantId]: false }));
    }
  };

  return (
    <div className="w-300 h-auto bg-white ml-40 mt-3">
      <div className="flex p-6 text-[14px]">
        <label className="font-bold">
          <input
            type="checkbox"
            checked={products.every((p) => checkedItems[p.VariantId])}
            onChange={(e) => onShopChange(products, e.target.checked)}
            className="mr-2"
          />
          {shop}
        </label>
      </div>
      <hr className="border-t border-gray-600" />

      {products.map((product) => (
        <div
          key={product.VariantId}
          className="p-6 flex justify-between items-center mr-5 border-b"
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={checkedItems[product.VariantId] || false}
              onChange={(e) =>
                onItemChange(product.VariantId, e.target.checked)
              }
              className="mr-2"
            />
            <div className="px-4">
              <img
                src={product?.product?.images?.[0]}
                alt={product?.product?.name || ""}
                className="w-20 h-20 object-cover rounded-md shadow-sm"
              />
            </div>
            <div className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
              {product?.product?.name}
            </div>
            <div className="text-sm text-gray-500 ml-[100px] w-40">
              {product?.attributes?.map((attr, index) => (
                <span key={index}>
                  {attr.name}:{attr.value}
                  {index < product.attributes.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>

          <div className="pr-10">
            đ {product?.product?.price?.min_price?.toLocaleString("vi-VN")}
          </div>

          <div className="flex items-center pr-10">
            <button
              onClick={() => handleDecrease(product.VariantId)}
              type="button"
              disabled={updating[product.VariantId]}
              className={`px-4 h-6 cursor-pointer font-semibold ${
                updating[product.VariantId]
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {updating[product.VariantId] ? (
                <CircularProgress size={14} />
              ) : (
                "-"
              )}
            </button>
            <input
              type="number"
              min={1}
              max={product.stock_quantity || 9999}
              value={quantities[product.VariantId]}
              onChange={(e) => {
                // Lấy value người dùng gõ
                let value = e.target.value;

                // Cho phép để trống để người dùng sửa số, hoặc nhập số >0
                if (value === "") {
                  setQuantities((prev) => ({
                    ...prev,
                    [product.VariantId]: "",
                  }));
                  return;
                }

                value = parseInt(value);
                if (isNaN(value) || value < 1) value = 1;
                // Không vượt quá stock
                if (value > product.stock_quantity)
                  value = product.stock_quantity;

                setQuantities((prev) => ({
                  ...prev,
                  [product.VariantId]: value,
                }));
                debounceUpdate(product.VariantId, value);
              }}
              className="w-12 h-6 text-[12px] text-center font-bold bg-white border-t border-b border-gray-200
  [&::-webkit-inner-spin-button]:appearance-none
  [&::-webkit-outer-spin-button]:appearance-none
  [&::-moz-appearance]:textfield"
            />

            <button
              onClick={() => handleIncrease(product.VariantId)}
              type="button"
              disabled={updating[product.VariantId]}
              className={`px-4 h-6 cursor-pointer font-semibold ${
                updating[product.VariantId]
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {updating[product.VariantId] ? (
                <CircularProgress size={14} />
              ) : (
                "+"
              )}
            </button>
          </div>

          <div className="text-red-600 pr-20">
            đ{" "}
            {(
              product?.product?.price?.min_price * quantities[product.VariantId]
            ).toLocaleString("vi-VN")}
          </div>

          <div>
            <button
              onClick={() => onRemove(product.VariantId)}
              className="cursor-pointer px-2 py-1 rounded"
              disabled={deletingItems[product.VariantId]}
            >
              {deletingItems[product.VariantId] ? (
                <CircularProgress size={14} />
              ) : (
                "Xóa"
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
