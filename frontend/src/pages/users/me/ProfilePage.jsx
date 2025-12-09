import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";
import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

// -------------------GQL-------------------
const UPDATE_USER_PROFILE = gql`
  mutation Mutation($updateUserId: ID!, $input: UpdateUserInput!) {
    updateUser(_id: $updateUserId, input: $input) {
      fullName
    }
  }
`;
const GET_USER_PROFILE = gql`
  query Query($id: ID!) {
    user(_id: $id) {
      _id
      fullName
      phoneNumber
      role
      avatar
      gender
      dateOfBirth
    }
  }
`;
// --------------------------------------
export default function ProfilePage() {
  const { showToast } = useToast();
  const { userData, refetch: refetchProfile } = useContext(AuthContext);
  const {
    data,
    loading: loadingProfile,
    refetch,
  } = useQuery(GET_USER_PROFILE, {
    variables: { id: userData?._id },
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || "");
  const [isLoading, setIsLoading] = useState(false);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().split("T")[0];
  };
  const [formData, setFormData] = useState({
    avatar: "",
    name: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async () => {
    // Kiểm tra bắt buộc fullName
    if (!formData.name?.trim()) {
      showToast("Vui lòng nhập họ và tên", "error");
      return;
    }

    setIsLoading(true);

    const input = {
      fullName: formData.name.trim(),
      phoneNumber: formData.phone?.trim() || null,
      gender: formData.gender?.trim() || null,
      dateOfBirth: formData.dateOfBirth?.trim() || null,
    };

    if (avatarFile instanceof File) {
      input.avatar = avatarFile;
    }

    try {
      await updateUserProfile({
        variables: {
          updateUserId: userData?._id,
          input,
        },
      });
      refetch();
      showToast("Cập nhật thông tin thành công", "success");
      refetchProfile();
    } catch (error) {
      console.error("Update error:", error);
      showToast("Có lỗi xảy ra khi cập nhật thông tin", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data?.user) {
      setFormData({
        avatar: data.user.avatar || "",
        name: data.user.fullName || "",
        phone: data.user.phoneNumber || "",
        gender: data.user.gender || "",
        dateOfBirth: formatDate(data.user.dateOfBirth) || "",
      });
      setAvatarPreview(data.user.avatar || "");
    }
  }, [data]);

  {
    isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  useEffect(() => {
    if (data?.user) {
      setFormData({
        avatar: data.user.avatar || "",
        name: data.user.fullName || "",
        phone: data.user.phoneNumber || "",
        gender: data.user.gender || "",
        dateOfBirth: formatDate(data.user.dateOfBirth) || "",
      });
      setAvatarPreview(data.user.avatar || "");
    }
  }, [data]);
  return (
    <>
      <div className="w-full max-w-4xl mx-auto mt-10 bg-white rounded shadow">
        <div className="p-4 md:p-6">
          <h1 className="text-xl mb-4">Hồ sơ của tôi</h1>
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Form bên trái */}
            <div className="w-full md:w-2/3 grid grid-cols-1 gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <label
                  htmlFor="name"
                  className="block text-[16px] font-medium mt-2 md:mt-0 md:w-32"
                >
                  Tên
                </label>
                <input
                  value={formData?.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  type="text"
                  id="name"
                  name="name"
                  className="w-full md:w-70 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <label
                  htmlFor="phone"
                  className="block text-[16px] font-medium mt-2 md:mt-0 md:w-32"
                >
                  Số điện thoại
                </label>
                <input
                  value={formData?.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="phone"
                  name="phone"
                  className="w-full md:w-70 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <label className="block text-sm font-medium mt-2 md:mt-0 md:w-32">
                  Giới tính
                </label>
                <div className="flex gap-4 mt-2 md:mt-0">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData?.gender === "male"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="form-radio text-primary h-4 w-4"
                    />
                    <span className="ml-2">Nam</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData?.gender === "female"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="form-radio text-primary h-4 w-4"
                    />
                    <span className="ml-2">Nữ</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <label
                  htmlFor="birthdate"
                  className="block text-sm font-medium mt-2 md:mt-0 md:w-32"
                >
                  Ngày sinh
                </label>
                <input
                  value={formData?.dateOfBirth || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  className="w-full md:w-70 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex justify-center w-full mt-5">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-[#5aa32a] text-white w-full md:w-30 h-10 cursor-pointer rounded flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
            {/* Phần avatar bên phải */}
            <div className="flex flex-col items-center mb-6 md:mr-10 mt-5 md:mt-0 w-full md:w-1/3">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img
                  src={avatarPreview || formData?.avatar || ""}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer"
              >
                Chọn ảnh
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
