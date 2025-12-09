import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function AddressModal({
  isOpen,
  onClose,
  onSubmit,
  address,
  form,
  setForm,
  handleUpdateAddress, // nếu cần, có thể truyền từ ProfileAddressPage
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (form?.id && handleUpdateAddress) {
        await handleUpdateAddress(form?.id);
      } else {
        await onSubmit();
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-full md:w-[500px] p-4 md:p-6 mx-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {form?.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={form?.fullName || ""}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={form?.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ cụ thể
            </label>
            <input
              type="text"
              value={form?.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Các select tỉnh/quận/phường */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Tỉnh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố
              </label>
              <select
                value={form?.provinceId || ""}
                onChange={(e) => {
                  const selectedProvince = address?.provinces?.find(
                    (p) => String(p.ProvinceID) === e.target.value
                  );
                  if (selectedProvince)
                    setForm((prev) => ({
                      ...prev,
                      province: selectedProvince.ProvinceName,
                      provinceId: selectedProvince.ProvinceID,
                    }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Chọn tỉnh/thành</option>
                {address?.provinces?.slice(4).map((p) => (
                  <option key={p.ProvinceID} value={p.ProvinceID}>
                    {p.ProvinceName}
                  </option>
                ))}
              </select>
            </div>

            {/* Quận */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện
              </label>
              <select
                value={form?.districtId || ""}
                onChange={(e) => {
                  const selectedDistrict = address?.districts?.find(
                    (d) => String(d.DistrictID) === e.target.value
                  );
                  if (selectedDistrict)
                    setForm((prev) => ({
                      ...prev,
                      district: selectedDistrict.DistrictName,
                      districtId: selectedDistrict.DistrictID,
                    }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Chọn quận/huyện</option>
                {address?.districts?.map((d) => (
                  <option key={d.DistrictID} value={d.DistrictID}>
                    {d.DistrictName}
                  </option>
                ))}
              </select>
            </div>

            {/* Phường */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phường/Xã
              </label>
              <select
                value={form?.wardCode || ""}
                onChange={(e) => {
                  const selectedWard = address?.wards?.find(
                    (w) => String(w.WardCode) === e.target.value
                  );
                  if (selectedWard)
                    setForm((prev) => ({
                      ...prev,
                      ward: selectedWard.WardName,
                      wardCode: selectedWard.WardCode,
                    }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Chọn phường/xã</option>
                {address?.wards?.map((w) => (
                  <option key={w.WardCode} value={w.WardCode}>
                    {w.WardName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Đặt mặc định */}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="default-address"
              checked={form?.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="default-address"
              className="ml-2 block text-sm text-gray-900"
            >
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          {/* Nút */}
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border cursor-pointer border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full md:w-auto"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-4 py-2 cursor-pointer bg-[#5aa32a] text-white rounded-md w-full md:w-auto flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && (
                <CircularProgress size={20} color="inherit" className="mr-2" />
              )}
              {form?.id ? "Cập nhật" : "Lưu địa chỉ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
