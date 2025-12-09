import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

const today = new Date().toISOString().split("T")[0];
export default function VoucherModal({
  open,
  setOpen,
  onSubmit,
  form,
  setForm,
  handleUpdate,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 pb-5 pt-4 w-[600px] h-auto relative">
        <button
          className="absolute cursor-pointer top-2 right-2 text-gray-500 hover:text-black"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-3 text-center">
          {!form?._id ? "Thêm" : "Cập nhật"} Voucher
        </h2>
        <form>
          <input
            className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
            value={form?.code}
            placeholder="Nhập mã voucher (VD: SALE1)"
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            required
            disabled={!!form?._id}
          />

          <div>
            <label className="block text-sm mb-1 font-medium ">Mô tả</label>
            <textarea
              // className="border rounded px-2  w-full"
              className="w-full border border-gray-400 rounded-md py-3 px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
              value={form?.description}
              placeholder="Nhập mô tả voucher ..."
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Loại giảm giá
            </label>
            <div className="flex gap-6 mt-1">
              <label className="inline-flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="type"
                  value="percentage"
                  checked={form?.type === "percentage"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className="form-radio text-[#5aa32a] h-4 w-4"
                />
                <span className="ml-2 text-sm">Phần trăm (%)</span>
              </label>

              <label className="inline-flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="type"
                  value="fixed_amount"
                  checked={form?.type === "fixed_amount"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className="form-radio text-[#5aa32a] h-4 w-4"
                />
                <span className="ml-2 text-sm">Giảm tiền (VNĐ)</span>
              </label>
            </div>
          </div>

          {form.type === "percentage" && (
            <div>
              <label className="block text-sm mb-1 font-medium ">
                Giá trị (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                // className="border rounded px-2  w-full"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={form?.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: Number(e.target.value) }))
                }
                required
              />
            </div>
          )}
          {form.type === "fixed_amount" && (
            <div>
              <label className="block text-sm mb-1 font-medium ">
                Giá trị (VNĐ)
              </label>
              <input
                type="number"
                min={1}
                // className="border rounded px-2  w-full"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={form?.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: Number(e.target.value) }))
                }
                required
              />
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium ">
                Giảm tối đa (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                // className="border rounded px-2  w-full"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={form?.max_discount_amount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    max_discount_amount: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium ">
                Đơn tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                // className="border rounded px-2  w-full"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={form?.min_order_value}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    min_order_value: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium ">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={
                  form?.start_date
                    ? dayjs(form.start_date).format("YYYY-MM-DD")
                    : ""
                }
                onChange={(e) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    start_date: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium">
                Ngày kết thúc
              </label>
              <input
                type="date"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={
                  form?.end_date
                    ? dayjs(form.end_date).format("YYYY-MM-DD")
                    : ""
                }
                onChange={(e) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    end_date: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium ">
                Giới hạn lượt dùng
              </label>
              <input
                type="number"
                min={1}
                // className="border rounded px-2  w-full"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={form?.usage_limit}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    usage_limit: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium ">
                Giới hạn/người
              </label>
              <input
                type="number"
                min={1}
                // className="border rounded px-2  w-full"
                className="w-full border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
                value={form?.usage_limit_per_user}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    usage_limit_per_user: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium ">
              Trạng thái
            </label>
            <select
              // className="border rounded px-2  w-full"
              className="w-50% border border-gray-400 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-[#5aa32a]/50"
              value={form?.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="active">Đang hoạt động</option>
              <option value="paused">Ngừng hoạt động</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 cursor-pointer rounded bg-gray-200"
              onClick={() => setOpen(false)}
            >
              Hủy
            </button>

            {!form?._id ? (
              <button
                type="button"
                className="px-4 py-2 cursor-pointer rounded bg-[#5aa32a] text-white"
                onClick={() => onSubmit(form)}
              >
                Thêm
              </button>
            ) : (
              <button
                type="button"
                className="update px-4 py-2 cursor-pointer rounded bg-[#5aa32a] text-white"
                onClick={() => handleUpdate(form?._id)}
              >
                Cập nhật
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
