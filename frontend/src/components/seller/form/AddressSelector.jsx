import React from "react";

const AddressSelector = ({
  formData,
  provinces,
  districts,
  wards,
  handleProvinceChange,
  handleDistrictChange,
  handleWardChange,
  loading,
}) => (
  <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
    <label className="text-sm font-medium text-gray-700 col-span-1">
      Địa chỉ<span className="text-red-500">*</span>
    </label>
    <div className="col-span-2 grid grid-cols-1 md:grid-cols-1 gap-2">
      <span className="text-sm text-gray-500 mb-2">Nhập địa chỉ bổ sung:</span>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={formData.handleChange}
        placeholder="Số nhà, tên đường..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2 md:mb-0"
      />
      <span className="text-sm text-gray-500 mb-2">Chọn địa chỉ:</span>
      <select
        value={formData.provinceId}
        onChange={handleProvinceChange}
        className="hover:border-blue-400 cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        required
      >
        <option value="">Chọn tỉnh/thành</option>
        {provinces.map((province) => (
          <option key={province.ProvinceID} value={province.ProvinceID}>
            {province.ProvinceName}
          </option>
        ))}
      </select>
      <select
        value={formData.districtId}
        onChange={handleDistrictChange}
        className={`hover:border-blue-400 cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          !formData.provinceId
            ? "opacity-50 border-gray-400 cursor-not-allowed"
            : ""
        }`}
        required
        title={`${
          !formData.provinceId ? "Vui lòng chọn tỉnh/thành trước" : ""
        }`}
        disabled={!formData.provinceId}
      >
        <option value="">Chọn quận/huyện</option>
        {districts.map((district) => (
          <option key={district.DistrictID} value={district.DistrictID}>
            {district.DistrictName}
          </option>
        ))}
      </select>
      <select
        value={formData.wardCode}
        onChange={handleWardChange}
        className={`hover:border-blue-400 cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          !formData.districtId
            ? "opacity-50 border-gray-400 cursor-not-allowed"
            : ""
        }`}
        required
        title={`${!formData.district ? "Vui lòng chọn quận huyện trước" : ""}`}
        disabled={!formData.districtId}
      >
        <option value="">Chọn phường/xã</option>
        {wards.map((ward) => (
          <option key={ward.WardCode} value={ward.WardCode}>
            {ward.WardName}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default AddressSelector;
