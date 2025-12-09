import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../contexts/ToastProvider";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthProvider";
const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN;

// ----------------------- GraphQL ------------------------

const USER_QUERY = gql`
  query User($userId: ID!) {
    user(_id: $userId) {
      _id
      avatar
      fullName
      email
      phoneNumber
      gender
      dateOfBirth
      address {
        _id
        name
        phone
        address
        province
        district
        ward
        province_id
        district_id
        ward_code
        isDefault
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($_id: ID!, $input: UpdateUserInput!) {
    updateUser(_id: $_id, input: $input) {
      _id
    }
  }
`;

// ----------------------- End GraphQL ------------------------

// dữ lịu giả định mà shop nhập lúc đăng ký
const initialProfileData = {
  fullName: "",
  email: "",
  phone: "",
  province: "",
  provinceId: "",
  district: "",
  districtId: "",
  ward: "",
  wardCode: "",
  address: "",
};

export default function ProfilePage() {
  const { userData } = useContext(AuthContext);
  const userId = userData?._id;
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState(initialProfileData);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputRef = useRef();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    province: false,
    district: false,
    ward: false,
  });

  // Query user thực tế
  const {
    data,
    loading: userLoading,
    refetch,
  } = useQuery(USER_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.user) {
        const addr =
          data.user.address && data.user.address[0] ? data.user.address[0] : {};
        setProfileData({
          fullName: data.user.fullName || "",
          email: data.user.email || "",
          phone: data.user.phoneNumber || "",
          //------------------
          gender: data.user.gender || "",
          dateOfBirth: data.user.dateOfBirth
            ? new Date(data.user.dateOfBirth).toISOString().split("T")[0]
            : "",
          //------------------
          province: addr.province || "",
          provinceId: addr.province_id || "",
          district: addr.district || "",
          districtId: addr.district_id || "",
          ward: addr.ward || "",
          wardCode: addr.ward_code || "",
          address: addr.address || "",
        });
      }
    },
  });

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);
  // Set initial avatar preview from user data
  useEffect(() => {
    if (data?.user?.avatar) setAvatarPreview(data.user.avatar);
  }, [data?.user?.avatar]);

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  // Lấy danh sách tỉnh/thành từ api giao hàng nhanh GHN
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

        const found = data.data?.find(
          (p) => p.ProvinceName === initialProfileData.province
        );
        if (found) {
          setProfileData((prev) => ({ ...prev, provinceId: found.ProvinceID }));
        }
      })
      .catch(() => setLoading((l) => ({ ...l, province: false })));
  }, []);

  // Lấy quận/huyện khi đã chọn tỉnh
  useEffect(() => {
    if (!profileData.provinceId) {
      setDistricts([]);
      setWards([]);
      setProfileData((prev) => ({
        ...prev,
        district: "",
        districtId: "",
        ward: "",
        wardCode: "",
      }));
      return;
    }
    setLoading((l) => ({ ...l, district: true }));
    fetch(`${GHN_API_BASE_URL}district`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
      body: JSON.stringify({ province_id: Number(profileData.provinceId) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.data || []);
        setLoading((l) => ({ ...l, district: false }));

        const found = data.data?.find(
          (d) => d.DistrictName === initialProfileData.district
        );
        if (found) {
          setProfileData((prev) => ({ ...prev, districtId: found.DistrictID }));
        }
      })
      .catch(() => setLoading((l) => ({ ...l, district: false })));
  }, [profileData.provinceId]);

  // Lấy phường/xã khi đã chọn quận/huyện
  useEffect(() => {
    if (!profileData.districtId) {
      setWards([]);
      setProfileData((prev) => ({
        ...prev,
        ward: "",
        wardCode: "",
      }));
      return;
    }
    setLoading((l) => ({ ...l, ward: true }));
    fetch(`${GHN_API_BASE_URL}ward?district_id=${profileData.districtId}`, {
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

        const found = data.data?.find(
          (w) => w.WardName === initialProfileData.ward
        );
        if (found) {
          setProfileData((prev) => ({ ...prev, wardCode: found.WardCode }));
        }
      })
      .catch(() => setLoading((l) => ({ ...l, ward: false })));
  }, [profileData.districtId]);

  // Xử lý khi chọn tỉnh
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const provinceObj = provinces.find(
      (p) => String(p.ProvinceID) === String(provinceId)
    );
    setProfileData((prev) => ({
      ...prev,
      province: provinceObj ? provinceObj.ProvinceName : "",
      provinceId,
      district: "",
      districtId: "",
      ward: "",
      wardCode: "",
    }));
  };

  // Xử lý khi chọn huận huyện
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const districtObj = districts.find(
      (d) => String(d.DistrictID) === String(districtId)
    );
    setProfileData((prev) => ({
      ...prev,
      district: districtObj ? districtObj.DistrictName : "",
      districtId,
      ward: "",
      wardCode: "",
    }));
  };

  // Xử lý khi chọn phường xã
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardObj = wards.find((w) => String(w.WardCode) === String(wardCode));
    setProfileData((prev) => ({
      ...prev,
      ward: wardObj ? wardObj.WardName : "",
      wardCode,
    }));
  };

  // Các trường khác
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    const addressInput = [
      {
        name: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        province:
          provinces.find(
            (p) => String(p.ProvinceID) === String(profileData.provinceId)
          )?.ProvinceName || "",
        district:
          districts.find(
            (d) => String(d.DistrictID) === String(profileData.districtId)
          )?.DistrictName || "",
        ward:
          wards.find((w) => String(w.WardCode) === String(profileData.wardCode))
            ?.WardName || "",
        province_id: Number(profileData.provinceId) || null,
        district_id: Number(profileData.districtId) || null,
        ward_code: Number(profileData.wardCode) || null,
        isDefault: true,
      },
    ];

    const input = {
      fullName: profileData.fullName,
      email: profileData.email,
      phoneNumber: profileData.phone,
      gender: profileData.gender,
      dateOfBirth: profileData.dateOfBirth,
      address: addressInput,
    };

    if (avatarFile instanceof File) {
      input.avatar = avatarFile;
    }

    try {
      await updateUser({
        variables: {
          _id: userId,
          input,
        },
      });
      refetch();
      showToast("Cập nhật thành công", "success");
    } catch (error) {
      showToast("Cập nhật thất bại: " + error.message, "error");
    }
  };

  return (
    <div className="relative ">
      {(userLoading || updating) && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Hồ Sơ Cá Nhân</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="border shadow border-gray-400 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-4 border-b border-gray-400 ">
              <h2 className="text-lg font-semibold text-gray-700">
                Hồ sơ cá nhân
              </h2>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/4 bg-gray-200 px-4 py-3 text-gray-600">
                      Họ Và Tên
                    </div>
                    <div className="w-3/4">
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={profileData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded py-3"
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/4 bg-gray-200 px-4 py-3 text-gray-600">
                      Email
                    </div>
                    <div className="w-3/4">
                      <input
                        type="email"
                        name="email"
                        required
                        value={profileData.email}
                        onChange={handleChange}
                        className="w-full px-4 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded py-3"
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/4 bg-gray-200 px-4 py-3 text-gray-600">
                      Số Điện Thoại
                    </div>
                    <div className="w-3/4">
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        className="w-full px-4 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded py-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <div className="flex mb-4 gap-4 p-2 pl-0">
                        <label className="block text-sm font-medium mt-2">
                          Giới tính
                        </label>
                        <div className="flex gap-4 mt-2">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={profileData?.gender === "male"}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  gender: e.target.value,
                                }))
                              }
                              className="cursor-pointer form-radio text-primary h-4 w-4"
                            />
                            <span className="ml-2">Nam</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              checked={profileData?.gender === "female"}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  gender: e.target.value,
                                }))
                              }
                              className="cursor-pointer form-radio text-primary h-4 w-4"
                            />
                            <span className="ml-2">Nữ</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex mb-4 gap-4">
                        <label
                          htmlFor="birthdate"
                          className="block text-sm font-medium mt-2"
                        >
                          Ngày sinh
                        </label>
                        <input
                          value={profileData?.dateOfBirth || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              dateOfBirth: e.target.value,
                            }))
                          }
                          type="date"
                          id="birthdate"
                          name="birthdate"
                          className="w-70 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-22 h-22 rounded-full overflow-hidden mb-2 border">
                        <img
                          src={avatarPreview || null}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded cursor-pointer"
                      >
                        Chọn ảnh
                      </label>
                    </div>
                  </div>
                  {/* ---------- */}

                  <div className="flex">
                    <div className="w-1/4 bg-gray-200 px-4 pr-1 py-3 text-gray-600">
                      Tỉnh, Thành Phố
                    </div>
                    <div className="w-3/4">
                      <select
                        name="provinceId"
                        value={profileData.provinceId}
                        onChange={handleProvinceChange}
                        className=" hover:border-blue-400  cursor-pointer w-full px-4 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded py-3"
                        required
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {provinces.map((province) => (
                          <option
                            key={province.ProvinceID}
                            value={province.ProvinceID}
                          >
                            {province.ProvinceName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/4 bg-gray-200 px-4 py-3 text-gray-600">
                      Quận, Huyện
                    </div>
                    <div className="w-3/4">
                      <select
                        name="districtId"
                        value={profileData.districtId}
                        onChange={handleDistrictChange}
                        className={` hover:border-blue-400  cursor-pointer w-full px-4 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded py-3 ${
                          !profileData.provinceId
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title={`${
                          !profileData.provinceId
                            ? "Vui lòng chọn tỉnh/thành trước"
                            : ""
                        }`}
                        disabled={!profileData.provinceId}
                        required
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                          <option
                            key={district.DistrictID}
                            value={district.DistrictID}
                          >
                            {district.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/4 bg-gray-200 px-4 py-3 text-gray-600">
                      Phường, Xã
                    </div>
                    <div className="w-3/4">
                      <select
                        name="wardCode"
                        value={profileData.wardCode}
                        onChange={handleWardChange}
                        className={` hover:border-blue-400  cursor-pointer w-full px-4 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded py-3 ${
                          !profileData.districtId
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        required
                        title={`${
                          !profileData.districtId
                            ? "Vui lòng chọn quận/huyện trước"
                            : ""
                        }`}
                        disabled={!profileData.districtId}
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
                  <div className="flex">
                    <div className="w-1/4 bg-gray-200 px-4 py-3 text-gray-600">
                      Số Nhà
                    </div>
                    <div className="w-3/4">
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleChange}
                        className="w-full px-4 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded py-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="px-6  cursor-pointer py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      disabled={updating}
                    >
                      {updating ? "Đang cập nhật..." : "Cập Nhật"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
//backup old code
