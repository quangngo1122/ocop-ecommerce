import React, { useState } from "react";
import { CircularProgress } from "@mui/material";

export default function CartFooter({
  selectAll,
  handleSelectAll,
  totalSelectedPrice,
  selectedCount,
  handleBuyNow,
  handleRemoveSelected,
}) {
  const [loading, setLoading] = useState(false);

  const handleBuyNowClick = async () => {
    setLoading(true);
    try {
      await handleBuyNow();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-300 h-25 bottom-0 bg-white ml-40 mt-100 fixed border border-gray-300 shadow-md">
      <div className="flex justify-between p-6 text-[14px]">
        <div className="w-full">
          <div className="flex justify-between">
            <div className="flex justify-start items-center gap-10">
              <div className="flex items-center gap-2 font-bold">
                <input
                  className="mr-2"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  type="checkbox"
                />
                Chọn tất cả ({selectedCount})
              </div>
              <button
                onClick={handleRemoveSelected}
                className="font-bold cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="flex justify-end gap-10 items-center">
              <div className="flex items-center gap-2 font-bold">
                Tổng cộng ({selectedCount} Sản phẩm) :{" "}
                <p className="text-[20px] text-red-600 pr-10">
                  {totalSelectedPrice.toLocaleString("vi-VN")} đ
                </p>
              </div>
              <div>
                <button
                  onClick={handleBuyNowClick}
                  className={`w-[210px] h-[40px] cursor-pointer bg-[#5aa32a] text-white flex justify-center items-center gap-2 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={18} color="inherit" /> Đang xử lý
                    </>
                  ) : (
                    "Mua hàng"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
