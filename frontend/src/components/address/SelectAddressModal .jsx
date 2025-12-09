export default function SelectAddressModal({
  isOpen,
  onClose,
  form,
  setForm,
  address,
}) {
  if (!isOpen) return null;

  const handleProvinceChange = (e) => {
    const selectedProvince = address?.provinces?.find(
      (item) => String(item.ProvinceID) === e.target.value
    );
    if (selectedProvince) {
      setForm((prev) => ({
        ...prev,
        province: selectedProvince.ProvinceName,
        provinceId: selectedProvince.ProvinceID,
        district: "",
        districtId: "",
        ward: "",
        wardCode: "",
      }));
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = address?.districts?.find(
      (item) => String(item.DistrictID) === e.target.value
    );
    if (selectedDistrict) {
      setForm((prev) => ({
        ...prev,
        district: selectedDistrict.DistrictName,
        districtId: selectedDistrict.DistrictID,
        ward: "",
        wardCode: "",
      }));
    }
  };

  const handleWardChange = (e) => {
    const selectedWard = address?.wards?.find(
      (item) => String(item.WardCode) === e.target.value
    );
    if (selectedWard) {
      setForm((prev) => ({
        ...prev,
        ward: selectedWard.WardName,
        wardCode: selectedWard.WardCode,
      }));
    }
  };

  const handleAddressChange = (e) => {
    setForm((prev) => ({ ...prev, address: e.target.value }));
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Thêm địa chỉ</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Tỉnh/Thành phố */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tỉnh/Thành phố
            </label>
            <select
              required
              value={form?.provinceId || ""}
              onChange={handleProvinceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Chọn tỉnh/thành</option>
              {address?.provinces?.slice(4).map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>
          </div>

          {/* Quận/Huyện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quận/Huyện
            </label>
            <select
              required
              value={form?.districtId || ""}
              onChange={handleDistrictChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Chọn quận/huyện</option>
              {address?.districts?.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
          </div>

          {/* Phường/Xã */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phường/Xã
            </label>
            <select
              required
              value={form?.wardCode || ""}
              onChange={handleWardChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Chọn phường/xã</option>
              {address?.wards?.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>
          </div>

          {/* Địa chỉ cụ thể */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ cụ thể (số nhà, tên đường)
            </label>
            <input
              required
              type="text"
              value={form.address}
              onChange={handleAddressChange}
              placeholder="Nhập số nhà, tên đường"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:text-sm"
            />
          </div>

          {/* Nút */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 cursor-pointer py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Lưu địa chỉ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
