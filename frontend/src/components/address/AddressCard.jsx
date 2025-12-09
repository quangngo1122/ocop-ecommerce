import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function AddressCard({
  address,
  setIsModalOpen,
  handleChangeStatus,
  loadDetailAddress,
  userData,
  handleDeleteAddress,
  form,
  setForm,
}) {
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);

  const handleUpdateClick = async () => {
    setIsLoadingUpdate(true);
    try {
      const { data } = await loadDetailAddress({
        variables: {
          userId: userData?._id,
          addressId: address._id,
        },
      });
      if (data?.address) {
        const detail = data.address;
        setForm({
          id: detail._id,
          fullName: detail.name || "",
          phone: detail.phone || "",
          address: detail.address || "",
          province: detail.province || "",
          provinceId: detail.province_id || "",
          district: detail.district || "",
          districtId: detail.district_id || "",
          ward: detail.ward || "",
          wardCode: detail.ward_code || "",
          isDefault: detail.isDefault || false,
        });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Lỗi khi load chi tiết địa chỉ:", err);
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  const handleDeleteClick = async () => {
    setIsLoadingDelete(true);
    try {
      await handleDeleteAddress(address?._id);
    } catch (err) {
      console.error("Lỗi xóa địa chỉ:", err);
    } finally {
      setIsLoadingDelete(false);
    }
  };

  const handleSetDefaultClick = async () => {
    setIsLoadingDefault(true);
    try {
      await handleChangeStatus(address?._id);
    } catch (err) {
      console.error("Lỗi thiết lập mặc định:", err);
    } finally {
      setIsLoadingDefault(false);
    }
  };

  return (
    <div className="text-[14px] flex items-center justify-between mb-5">
      <div>
        <div className="flex gap-2 font-bold">
          {address?.name} <p className="font-normal"> | {address?.phone}</p>
        </div>
        <div className="flex gap-2">
          {address?.ward}, {address?.district}, {address?.province}
        </div>
        {address?.isDefault && (
          <button className="mt-2 text-[10px] text-[red] h-5 p-1 border border-[red] flex items-center">
            Mặc định
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-5 ml-10">
          <button
            type="button"
            onClick={handleUpdateClick}
            className={`flex justify-end text-sky-500 ${
              isLoadingUpdate
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            disabled={isLoadingUpdate} // chỉ disable khi đang loading
          >
            {isLoadingUpdate ? <CircularProgress size={20} /> : "Cập nhật"}
          </button>

          <button
            type="button"
            onClick={handleDeleteClick}
            className={`flex justify-end text-sky-500 ${
              address?.isDefault || isLoadingDelete
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            disabled={address?.isDefault || isLoadingDelete}
          >
            {isLoadingDelete ? <CircularProgress size={20} /> : "Xóa"}
          </button>
        </div>

        <button
          value={address?._id}
          onClick={handleSetDefaultClick}
          type="button"
          className={`flex justify-end h-6 px-3 border border-gray-400 ${
            address.isDefault || isLoadingDefault
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-sky-50"
          }`}
          disabled={address.isDefault || isLoadingDefault}
          s
        >
          {isLoadingDefault ? (
            <CircularProgress size={16} />
          ) : (
            "Thiết lập mặc định"
          )}
        </button>
      </div>
    </div>
  );
}
