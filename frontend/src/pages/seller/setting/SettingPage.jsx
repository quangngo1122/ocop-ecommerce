import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";
import FormInput from "../../../components/seller/form/FormInput";
import FileUploader from "../../../components/seller/form/FileUploaderSettingShop";
import AddressSelector from "../../../components/seller/form/AddressSelector";

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN;

// -----------------------GRAPQL-----------------------

const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      _id
      name
      description
      logo
      address {
        name
        address
        phone
        province
        district
        ward
        province_id
        district_id
        ward_code
      }
      contact {
        email
        phone
      }
      owner {
        _id
      }
      coverImage
      status
    }
  }
`;
const UPDATE_SHOP = gql`
  mutation UpdateShop($id: ID!, $input: UpdateShopInput!) {
    updateShop(_id: $id, input: $input) {
      name
    }
  }
`;

const UPDATE_SHOP_STATUS = gql`
  mutation UpdateShopStatus($updateShopStatusId: ID!, $status: ShopStatus!) {
    updateShopStatus(updateShopStatusId: $updateShopStatusId, status: $status) {
      name
    }
  }
`;

// ----------------------------------------------------

export default function SettingPage() {
  const fileInputRef = useRef(null);

  const coverImageInputRef = useRef(null);

  const { userData } = useContext(AuthContext);
  const userId = userData?._id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  // Query all shops
  // const { data: shopsData, loading: shopsLoading } = useQuery(SHOPS_QUERY);
  const [updateShop] = useMutation(UPDATE_SHOP);

  // Find shop owned by current user
  // const myShop = shopsData?.shops?.items?.find(
  //   (shop) => shop.owner?.id === userId
  // );
  const {
    data: myShopData,
    loading: myShopLoading,
    refetch,
  } = useQuery(MY_SHOP_QUERY);
  const myShop = myShopData?.myShop;
  const [updateShopStatus] = useMutation(UPDATE_SHOP_STATUS);

  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    logoFile: null,
    logoFileName: "Không có tệp nào được chọn",

    coverImageFile: null,
    coverImageFileName: "Không có tệp nào được chọn",
    coverImagePreview: null,

    contactEmail: "",
    phoneNumber: "",
    shopAddressName: "",
    address: "",
    province: "",
    provinceId: "",
    district: "",
    districtId: "",
    ward: "",
    wardCode: "",
    status: "",
  });
  const [isConfigInfoExpanded, setIsConfigInfoExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const initialLoadedRef = useRef(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    province: false,
    district: false,
    ward: false,
  });

  useEffect(() => {
    if (myShop && !initialLoadedRef.current) {
      initialLoadedRef.current = true;

      const provinceIdStr = myShop.address?.province_id?.toString() || "";
      const districtIdStr = myShop.address?.district_id?.toString() || "";
      const wardCodeStr = myShop.address?.ward_code?.toString() || "";

      setFormData((prev) => ({
        ...prev,
        storeName: myShop.name || "",
        description: myShop.description || "",
        // logoFile: null,
        logoFile: myShop.logo,
        logoFileName: myShop.logo
          ? myShop.logo.split("/").pop()
          : "Không có tệp nào được chọn",

        coverImageFile: myShop.coverImage,
        coverImageFileName: myShop.coverImage
          ? myShop.coverImage.split("/").pop()
          : "Không có tệp nào được chọn",
        coverImagePreview: null,

        contactEmail: myShop.contact?.email || "",
        phoneNumber: myShop.contact?.phone || "",
        shopAddressName: myShop.address?.name || "",
        address: myShop.address?.address || "",
        province: myShop.address?.province || "",
        provinceId: provinceIdStr,
        district: myShop.address?.district || "",
        districtId: districtIdStr,
        ward: myShop.address?.ward || "",
        wardCode: wardCodeStr,
        status: myShop.status || "",
      }));

      if (provinceIdStr) {
        fetchDistricts(provinceIdStr, districtIdStr);
      }
      if (districtIdStr) {
        fetchWards(districtIdStr, wardCodeStr);
      }

      setIsLoading(false);
    } else if (!myShopLoading) {
      setIsLoading(false);
    }
  }, [myShop, myShopLoading]);

  // Lấy danh sách tỉnh
  useEffect(() => {
    setLoading((l) => ({ ...l, province: true }));
    fetch(`${GHN_API_BASE_URL}province`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data.data || []);
        setLoading((l) => ({ ...l, province: false }));
      })
      .catch(() => setLoading((l) => ({ ...l, province: false })));
  }, []);

  // // Lấy quận/huyện khi chọn tỉnh

  const fetchDistricts = (provinceId, districtIdToSet) => {
    setLoading((l) => ({ ...l, district: true }));
    fetch(`${GHN_API_BASE_URL}district`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
      body: JSON.stringify({ province_id: Number(provinceId) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.data || []);
        setLoading((l) => ({ ...l, district: false }));

        if (districtIdToSet) {
          const found = data.data?.find((d) => d.DistrictID == districtIdToSet);
          if (found) {
            setFormData((prev) => ({
              ...prev,
              districtId: found.DistrictID.toString(),
              district: found.DistrictName,
            }));
          }
        }
      })
      .catch(() => setLoading((l) => ({ ...l, district: false })));
  };

  const fetchWards = (districtId, wardCodeToSet) => {
    setLoading((l) => ({ ...l, ward: true }));
    fetch(`${GHN_API_BASE_URL}ward?district_id=${districtId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setWards(data.data || []);
        setLoading((l) => ({ ...l, ward: false }));

        if (wardCodeToSet) {
          const found = data.data?.find((w) => w.WardCode == wardCodeToSet);
          if (found) {
            setFormData((prev) => ({
              ...prev,
              wardCode: found.WardCode.toString(),
              ward: found.WardName,
            }));
          }
        }
      })
      .catch(() => setLoading((l) => ({ ...l, ward: false })));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Xử lý chọn tỉnh
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const provinceObj = provinces.find(
      (p) => String(p.ProvinceID) === String(provinceId),
    );
    setFormData((prev) => ({
      ...prev,
      province: provinceObj ? provinceObj.ProvinceName : "",
      provinceId: provinceId,
      district: "",
      districtId: "",
      ward: "",
      wardCode: "",
    }));

    if (provinceId) {
      fetchDistricts(provinceId);
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  // Xử lý chọn quận/huyện
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const districtObj = districts.find(
      (d) => String(d.DistrictID) === String(districtId),
    );
    setFormData((prev) => ({
      ...prev,
      district: districtObj ? districtObj.DistrictName : "",
      districtId: districtId,
      ward: "",
      wardCode: "",
    }));

    if (districtId) {
      fetchWards(districtId);
    } else {
      setWards([]);
    }
  };

  // Xử lý chọn phường/xã
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardObj = wards.find((w) => String(w.WardCode) === String(wardCode));
    setFormData((prev) => ({
      ...prev,
      ward: wardObj ? wardObj.WardName : "",
      wardCode: wardCode,
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        coverImageFile: file,
        coverImageFileName: file.name,
      }));
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevState) => ({
          ...prevState,
          coverImagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        coverImageFile: null,
        coverImageFileName: "Không có tệp nào được chọn",
        coverImagePreview: null,
      }));
    }
  };

  const handleChooseCoverImageClick = () => {
    coverImageInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        logoFile: file,
        logoFileName: file.name,
      }));
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevState) => ({
          ...prevState,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        logoFile: null,
        logoFileName: "Không có tệp nào được chọn",
        logoPreview: null,
      }));
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  const handleConfirmCloseShop = async () => {
    setShowCloseConfirm(false);
    setSaving(true);
    try {
      await updateShop({
        variables: {
          id: myShop._id,
          input: {
            name: formData.storeName || myShop.name,
            description: formData.description || myShop.description,
            address: {
              name: formData.shopAddressName || myShop.address?.name || "",
              address: formData.address || myShop.address?.address || "",
              phone: formData.phoneNumber || myShop.address?.phone || "",
              province: formData.province || myShop.address?.province || "",
              district: formData.district || myShop.address?.district || "",
              ward: formData.ward || myShop.address?.ward || "",
              province_id:
                Number(formData.provinceId) ||
                myShop.address?.province_id ||
                null,
              district_id:
                Number(formData.districtId) ||
                myShop.address?.district_id ||
                null,
              ward_code:
                Number(formData.wardCode) || myShop.address?.ward_code || null,
            },
            contact: {
              email: formData.contactEmail || myShop.contact?.email || "",
              phone: formData.phoneNumber || myShop.contact?.phone || "",
            },
          },
        },
      });

      if (formData.status && formData.status !== myShop.status) {
        await updateShopStatus({
          variables: {
            updateShopStatusId: myShop._id,
            status: formData.status,
          },
        });
      }

      showToast("Shop đã đóng cửa!", "warning");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      showToast("Đóng shop thất bại: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };
  //----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myShop) return;

    //----------------------------
    if (formData.status === "closed" && myShop.status !== "closed") {
      setShowCloseConfirm(true);
      return;
    }
    if (!formData.storeName) {
      showToast("Tên cửa hàng không được để trống!", "warning");
      return;
    }
    if (!formData.description) {
      showToast("Mô tả cửa hàng không được để trống!", "warning");
      return;
    }
    if (!formData.address) {
      showToast("Địa chỉ không được để trống!", "warning");
      return;
    }
    if (!formData.shopAddressName) {
      showToast("Tên liên hệ không được để trống!", "warning");
      return;
    }
    if (!formData.phoneNumber) {
      showToast("Số điện thoại liên hệ không được để trống!", "warning");
      return;
    }
    if (!formData.province) {
      showToast("Tỉnh thành không được để trống!", "warning");
      return;
    }
    if (!formData.district) {
      showToast("Quận / Huyện không được để trống!", "warning");
      return;
    }
    if (!formData.ward) {
      showToast("Phường / Xã không được để trống!", "warning");
      return;
    }
    if (!formData.contactEmail) {
      showToast("Email liên hệ không được để trống!", "warning");
      return;
    }

    //----------------------------

    setSaving(true);

    const input = {
      name: formData.storeName || myShop.name,
      description: formData.description || myShop.description,
      address: {
        name: formData.shopAddressName || myShop.address?.name || "",
        address: formData.address || myShop.address?.address || "",
        phone: formData.phoneNumber || myShop.address?.phone || "",
        province: formData.province || myShop.address?.province || "",
        district: formData.district || myShop.address?.district || "",
        ward: formData.ward || myShop.address?.ward || "",
        province_id:
          Number(formData.provinceId) || myShop.address?.province_id || null,
        district_id:
          Number(formData.districtId) || myShop.address?.district_id || null,
        ward_code:
          Number(formData.wardCode) || myShop.address?.ward_code || null,
      },
      contact: {
        email: formData.contactEmail || myShop.contact?.email || "",
        phone: formData.phoneNumber || myShop.contact?.phone || "",
      },
    };

    // const input = {
    //   name: formData.storeName,
    //   description: formData.description,

    //   address: {

    //     name: formData.shopAddressName,
    //     address: formData.address,
    //     phone: formData.phoneNumber,
    //     province: formData.province,
    //     district: formData.district,
    //     ward: formData.ward,
    //     province_id: Number(formData.provinceId),
    //     district_id: Number(formData.districtId),
    //     ward_code: Number(formData.wardCode),

    //   },
    //   contact: {
    //     email: formData.contactEmail,
    //     phone: formData.phoneNumber,
    //   },
    // };
    if (formData.logoFile && typeof formData.logoFile !== "string") {
      input.logo = formData.logoFile;
    }
    // if (
    //   formData.coverImageFile &&
    //   typeof formData.coverImageFile !== "string"
    // ) {
    //   // input.coverImage = formData.coverImageFile;
    //   showToast("backend chưa hỗ trợ ảnh bìa, hãy thử vào dịp khác", "warning");
    //   return;
    // }

    if (
      formData.coverImageFile &&
      typeof formData.coverImageFile !== "string"
    ) {
      input.coverImage = formData.coverImageFile;
    }

    // await updateShop({
    //   variables: {
    //     updateShopId: myShop._id,
    //     input,
    //   },
    // });

    // showToast("Cập nhật thành công", "success");
    try {
      await updateShop({
        variables: {
          id: myShop._id,
          input,
        },
      });

      if (formData.status && formData.status !== myShop.status) {
        await updateShopStatus({
          variables: {
            updateShopStatusId: myShop._id,
            status: formData.status,
          },
        });
      }

      // await refetch();
      const { data: refreshedData } = await refetch();

      setFormData((prev) => ({
        ...prev,
        storeName: refreshedData.myShop.name,
        description: refreshedData.myShop.description,
        logoFile: refreshedData.myShop.logo,
        logoFileName: refreshedData.myShop.logo
          ? refreshedData.myShop.logo.split("/").pop()
          : "Không có tệp nào được chọn",
        coverImageFile: refreshedData.myShop.coverImage,
        coverImageFileName: refreshedData.myShop.coverImage
          ? refreshedData.myShop.coverImage.split("/").pop()
          : "Không có tệp nào được chọn",
        contactEmail: refreshedData.myShop.contact?.email || "",
        phoneNumber: refreshedData.myShop.contact?.phone || "",
        shopAddressName: refreshedData.myShop.address?.name || "",
        address: refreshedData.myShop.address?.address || "",
        province: refreshedData.myShop.address?.province || "",
        provinceId: refreshedData.myShop.address?.province_id?.toString() || "",
        district: refreshedData.myShop.address?.district || "",
        districtId: refreshedData.myShop.address?.district_id?.toString() || "",
        ward: refreshedData.myShop.address?.ward || "",
        wardCode: refreshedData.myShop.address?.ward_code?.toString() || "",
        status: refreshedData.myShop.status || "",
      }));

      showToast("Cập nhật thành công", "success");
    } catch (error) {
      showToast("Cập nhật thất bại: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNavigateToAdditionalSettings = () => {
    navigate("/seller/setting/additional-settings");
  };

  if (isLoading || myShopLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cấu Hình Shop</h1>
        <button
          onClick={handleNavigateToAdditionalSettings}
          className=" cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cấu Hình Bổ Sung
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Thông tin cấu hình
          </h2>
          <button
            onClick={() => setIsConfigInfoExpanded(!isConfigInfoExpanded)}
            className="text-gray-500 cursor-pointer  hover:text-gray-700 focus:outline-none"
          >
            {isConfigInfoExpanded ? <RemoveIcon /> : <AddIcon />}
          </button>
        </div>

        {isConfigInfoExpanded && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <FormInput
              label="Tên Cơ Sở"
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              required
            />
            <FileUploader
              label="Logo Cửa Hàng"
              id="logoFile"
              name="logoFile"
              fileRef={fileInputRef}
              onFileChange={handleFileChange}
              onChooseFileClick={handleChooseFileClick}
              fileName={formData.logoFileName}
              preview={formData.logoPreview}
              existingImage={myShop.logo}
              required
            />

            <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
              <label
                htmlFor="coverImageFile"
                className="text-sm font-medium text-gray-700 col-span-1"
              >
                Ảnh Bìa<span className="text-red-500">*</span>
              </label>
              <div className="col-span-2 flex items-center">
                <div>
                  <input
                    type="file"
                    id="coverImageFile"
                    name="coverImageFile"
                    ref={coverImageInputRef}
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleChooseCoverImageClick}
                    className=" cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Chọn tệp
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    {formData.coverImageFileName}
                  </span>
                  {formData.coverImagePreview ? (
                    <img
                      src={formData.coverImagePreview}
                      alt="Cover preview"
                      className="h-32 w-full object-cover rounded border border-gray-200 shadow mt-1"
                    />
                  ) : myShop.coverImage ? (
                    <img
                      src={myShop.coverImage}
                      alt="Ảnh bìa hiện tại"
                      className="h-32 w-full object-cover rounded border border-gray-200 shadow mt-1"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <AddressSelector
              formData={formData}
              provinces={provinces}
              districts={districts}
              wards={wards}
              handleProvinceChange={handleProvinceChange}
              handleDistrictChange={handleDistrictChange}
              handleWardChange={handleWardChange}
              loading={loading}
            />

            <FormInput
              label="Tên Liên Hệ"
              id="shopAddressName"
              name="shopAddressName"
              value={formData.shopAddressName}
              onChange={handleChange}
              placeholder="Nhập tên liên hệ (ví dụ: Nguyễn Văn A)"
              required
            />
            <FormInput
              label="Số điện thoại"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Email Liên Hệ"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              type="email"
              required
            />

            <div className="grid grid-cols-3 items-center border-b border-gray-200 py-4 mb-0">
              <label
                htmlFor="status"
                className="text-sm font-medium text-gray-700 col-span-1"
              >
                Trạng Thái Shop<span className="text-red-500">*</span>
              </label>
              <div className="col-span-2 flex gap-6 items-center">
                <label className="text-[green] font-semibold cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === "active"}
                    // disabled={formData.status !== "active"}
                    onChange={handleChange}
                  />
                  Hoạt động
                </label>
                <label className="text-[red] font-semibold cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="closed"
                    checked={formData.status === "closed"}
                    onChange={handleChange}
                  />
                  Đóng cửa
                </label>
              </div>
            </div>

            <FormInput
              label="Giới Thiệu"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              isTextarea
              required
            />
            {/* <div className="border-t border-gray-200 p-6 flex justify-end"> */}
            <div className="mt-3 p-6 flex justify-end">
              <button
                type="submit"
                className=" cursor-pointer px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Lưu Cấu Hình
              </button>
            </div>
          </form>
        )}
      </div>
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Warning! Xác nhận đóng shop
            </h3>
            <p className="mb-4">
              Bạn có chắc chắn muốn <b>đóng cửa shop</b>? Sau khi đóng, bạn phải
              liên hệ quản trị viên để có thể đưa shop hoạt động trở lại.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="hover:opacity-75 cursor-pointer px-4 py-2 rounded bg-gray-200 text-gray-700"
                onClick={() => setShowCloseConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="hover:opacity-75 cursor-pointer px-4 py-2 rounded bg-red-600 text-white"
                onClick={handleConfirmCloseShop}
              >
                Xác nhận đóng shop
              </button>
            </div>
          </div>
        </div>
      )}
      {saving && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang lưu thay đổi...</p>
          </div>
        </div>
      )}
    </div>
  );
}
