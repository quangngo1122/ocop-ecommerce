import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import SelectAddressModal from "../../components/address/SelectAddressModal ";
import { useToast } from "../../contexts/ToastProvider";
import { AuthContext } from "../../contexts/AuthProvider";
import CircularProgress from "@mui/material/CircularProgress";
const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN;
// ---------------- GraphQL ----------------
const REGISTER_MUTATION = gql`
  mutation RegisterSeller($input: CreateShopInput!) {
    registerSeller(input: $input) {
      shop {
        _id
      }
    }
  }
`;

export default function RegisterSellerPage() {
  const { userData, loadingAuth } = useContext(AuthContext);

  const { showToast } = useToast();
  const [registerSeller] = useMutation(REGISTER_MUTATION);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    logo: null,
    coverImage: null,
    licenses: [],
    agreeTerms: false,
  });

  const [form, setForm] = useState({
    province: "",
    provinceId: "",
    district: "",
    districtId: "",
    ward: "",
    wardCode: "",
    address: "",
  });

  const [address, setAddress] = useState({
    provinces: [],
    districts: [],
    wards: [],
    loading: { province: false, district: false, ward: false },
    error: null,
  });

  const [errors, setErrors] = useState({});
  // ---------------- Handlers ----------------
  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, [field]: file }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: "Vui lòng chọn file ảnh hợp lệ",
      }));
    }
  };

  const handleAddLicense = () => {
    setFormData((prev) => ({
      ...prev,
      licenses: [
        ...prev.licenses,
        { files: [], name: "", description: "", code: "" },
      ],
    }));
  };

  const handleLicenseFilesChange = (idx, e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) return;

    setFormData((prev) => {
      const licenses = [...prev.licenses];
      const existing = licenses[idx].files || [];

      // Ghép file mới + file cũ rồi lọc trùng theo name + size
      const merged = [...existing, ...files].filter(
        (f, i, arr) =>
          arr.findIndex((x) => x.name === f.name && x.size === f.size) === i
      );

      licenses[idx].files = merged.slice(0, 2); // giới hạn tối đa 2 ảnh
      return { ...prev, licenses };
    });

    e.target.value = null; // reset input
  };

  const handleRemoveLicenseFile = (lidx, fidx) => {
    setFormData((prev) => {
      const licenses = [...prev.licenses];
      licenses[lidx].files = licenses[lidx].files.filter((_, i) => i !== fidx);
      return { ...prev, licenses };
    });
  };

  const handleLicenseFieldChange = (idx, field, value) => {
    setFormData((prev) => {
      const licenses = [...prev.licenses];
      licenses[idx][field] = value;
      return { ...prev, licenses };
    });
  };

  const handleRemoveLicense = (idx) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== idx),
    }));
  };

  // ---------------- Validate Form ----------------
  const validateForm = () => {
    const newErrors = {};

    // Thông tin cơ bản
    if (!formData.name.trim()) newErrors.name = "Tên cửa hàng là bắt buộc";
    if (!formData.email.trim()) newErrors.email = "Email là bắt buộc";

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại chỉ được chứa chữ số";
    }

    if (!formData.description.trim())
      newErrors.description = "Mô tả cửa hàng là bắt buộc";

    // Địa chỉ
    if (!form.provinceId) newErrors.province = "Vui lòng chọn tỉnh/thành phố";
    if (!form.districtId) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!form.wardCode) newErrors.ward = "Vui lòng chọn phường/xã";
    if (!form.address.trim())
      newErrors.address = "Vui lòng nhập địa chỉ cụ thể";

    // Giấy phép
    if (formData.licenses.length === 0) {
      newErrors.licenses = "Vui lòng thêm ít nhất 1 giấy phép kinh doanh";
    }

    formData.licenses.forEach((l, i) => {
      if (!l.name.trim())
        newErrors[`license_name_${i}`] = `Tên giấy phép #${i + 1} là bắt buộc`;
      if (!l.code.trim())
        newErrors[`license_code_${i}`] = `Mã giấy phép #${i + 1} là bắt buộc`;
      if (!l.description.trim())
        newErrors[`license_desc_${i}`] = `Mô tả giấy phép #${
          i + 1
        } là bắt buộc`;
      if (!l.files || l.files.length === 0)
        newErrors[
          `license_files_${i}`
        ] = `Vui lòng tải lên ít nhất 1 ảnh cho giấy phép #${i + 1}`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- Handle Submit ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      showToast("Vui lòng đồng ý với điều khoản!", "error");
      return;
    }

    if (!validateForm()) {
      showToast("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    try {
      setLoading(true);
      const input = {
        name: formData.name,
        description: formData.description,
        contact: { phone: formData.phone, email: formData.email },
        address: {
          name: formData.name,
          phone: formData.phone,
          province: form.province,
          district: form.district,
          ward: form.ward,
          province_id: form.provinceId,
          district_id: form.districtId,
          ward_code: parseInt(form.wardCode),
          address: form.address,
        },
        logo: formData.logo,
        coverImage: formData.coverImage,
        businessLicense: formData.licenses.map((l) => ({
          name: l.name,
          description: l.description,
          code: l.code,
          images: l.files || [],
        })),
      };
      const { data } = await registerSeller({ variables: { input } });

      if (data?.registerSeller?.shop?._id) {
        showToast("Đăng ký cửa hàng thành công!", "success");
        // reset form...
        setFormData({
          name: "",
          email: "",
          phone: "",
          description: "",
          logo: null,
          coverImage: null,
          licenses: [],
          agreeTerms: false,
        });
        setForm({
          province: "",
          provinceId: "",
          district: "",
          districtId: "",
          ward: "",
          wardCode: "",
          address: "",
        });
        navigate("/");
      } else {
        showToast("Đăng ký không thành công!", "error");
      }
    } catch (err) {
      console.error("❌ Lỗi đăng ký:", err);
      showToast("Có lỗi xảy ra khi đăng ký cửa hàng.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Fetch address GHN ----------------
  useEffect(() => {
    setAddress((prev) => ({
      ...prev,
      loading: { ...prev.loading, province: true },
      error: null,
    }));
    fetch(`${GHN_API_BASE_URL}province`, { headers: { Token: GHN_API_TOKEN } })
      .then((res) => res.json())
      .then((data) =>
        setAddress((prev) => ({
          ...prev,
          provinces: data.data || [],
          loading: { ...prev.loading, province: false },
        }))
      )
      .catch((err) =>
        setAddress((prev) => ({
          ...prev,
          error: err.message,
          loading: { ...prev.loading, province: false },
        }))
      );
  }, []);

  useEffect(() => {
    if (!form.provinceId) return;
    setAddress((prev) => ({
      ...prev,
      loading: { ...prev.loading, district: true },
    }));
    fetch(`${GHN_API_BASE_URL}district`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Token: GHN_API_TOKEN },
      body: JSON.stringify({ province_id: Number(form.provinceId) }),
    })
      .then((res) => res.json())
      .then((data) =>
        setAddress((prev) => ({
          ...prev,
          districts: data.data || [],
          loading: { ...prev.loading, district: false },
        }))
      )
      .catch((err) =>
        setAddress((prev) => ({
          ...prev,
          error: err.message,
          loading: { ...prev.loading, district: false },
        }))
      );
  }, [form.provinceId]);

  useEffect(() => {
    if (!form.districtId) return;
    setAddress((prev) => ({
      ...prev,
      loading: { ...prev.loading, ward: true },
    }));
    fetch(`${GHN_API_BASE_URL}ward?district_id=${Number(form.districtId)}`, {
      headers: { Token: GHN_API_TOKEN },
    })
      .then((res) => res.json())
      .then((data) =>
        setAddress((prev) => ({
          ...prev,
          wards: data.data || [],
          loading: { ...prev.loading, ward: false },
        }))
      )
      .catch((err) =>
        setAddress((prev) => ({
          ...prev,
          error: err.message,
          loading: { ...prev.loading, ward: false },
        }))
      );
  }, [form.districtId]);
  if (loadingAuth || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-10 h-10 border-4 border-gray-200 border-l-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Vui lòng đợi...</p>
      </div>
    );
  }

  // Redirect nếu không có user
  if (!userData?.fullName) {
    navigate("/login");
    showToast("Vui lòng đăng nhập để đăng ký cửa hàng!", "error");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Form chính */}
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Đăng ký bán hàng
          </h2>

          {/* Thông tin cơ bản */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Thông tin cơ bản
            </h3>
            <input
              required
              type="text"
              placeholder="Tên cửa hàng"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <input
              required
              type="tel"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Logo & Cover */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Hình ảnh</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Logo */}
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Logo</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 bg-green-50 border border-green-500 rounded-lg text-green-700 hover:bg-green-100 transition">
                    Chọn ảnh
                    <input
                      required
                      type="file"
                      onChange={handleFileChange("logo")}
                      className="hidden"
                    />
                  </label>
                  {formData.logo && (
                    <img
                      src={URL.createObjectURL(formData.logo)}
                      alt="Logo preview"
                      className="h-20 w-20 object-cover rounded border"
                    />
                  )}
                </div>
              </div>

              {/* Cover */}
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Ảnh bìa</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 bg-green-50 border border-green-500 rounded-lg text-green-700 hover:bg-green-100 transition">
                    Chọn ảnh
                    <input
                      required
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange("coverImage")}
                      className="hidden"
                    />
                  </label>
                  {formData.coverImage && (
                    <img
                      src={URL.createObjectURL(formData.coverImage)}
                      alt="Cover preview"
                      className="h-20 w-36 object-cover rounded border"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mô tả cửa hàng */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Mô tả cửa hàng
            </h3>
            <textarea
              required
              placeholder="Mô tả cửa hàng"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 mt-2"
              rows={3}
            />
          </div>

          {/* Địa chỉ */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Địa chỉ</h3>
            {form.province && form.district && form.ward ? (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-2">
                <span className="text-gray-700 text-sm">{`${
                  form.address ? form.address + ", " : ""
                }${form.ward}, ${form.district}, ${form.province}`}</span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  type="button"
                  className="text-blue-600 cursor-pointer hover:underline text-sm font-medium"
                >
                  Chỉnh sửa
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                type="button"
                className="mt-2 px-3 cursor-pointer py-1 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 text-sm font-medium"
              >
                + Thêm
              </button>
            )}
          </div>

          {/* Giấy phép */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Giấy phép (2 ảnh)
            </h3>
            <div className="space-y-3">
              {formData.licenses.map((l, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-3 relative bg-gray-50"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveLicense(idx)}
                    className="absolute cursor-pointer top-1 right-1 text-red-600 font-bold"
                  >
                    ×
                  </button>
                  <div className="flex gap-2 flex-wrap">
                    {l.files.map((f, fidx) => (
                      <div key={fidx} className="relative">
                        <img
                          src={URL.createObjectURL(f)}
                          alt={`license-${idx}-${fidx}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLicenseFile(idx, fidx)}
                          className="absolute top-0 cursor-pointer right-0 text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {l.files.length < 2 && (
                      <label className="w-16 h-16 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center text-green-600 text-xs cursor-pointer hover:bg-green-50">
                        Thêm ảnh
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLicenseFilesChange(idx, e)}
                        />
                      </label>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Tên giấy phép"
                      value={l.name}
                      onChange={(e) =>
                        handleLicenseFieldChange(idx, "name", e.target.value)
                      }
                      className="border rounded px-2 py-1 focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Mô tả"
                      value={l.description}
                      onChange={(e) =>
                        handleLicenseFieldChange(
                          idx,
                          "description",
                          e.target.value
                        )
                      }
                      className="border rounded px-2 py-1 focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Mã"
                      value={l.code}
                      onChange={(e) =>
                        handleLicenseFieldChange(idx, "code", e.target.value)
                      }
                      className="border rounded px-2 py-1 focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddLicense}
              className="mt-3 px-3 py-1 cursor-pointer bg-green-50 border border-green-400 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
            >
              + Thêm giấy phép
            </button>
          </div>
          {/* giữ nguyên đoạn giấy phép bạn đã có, chỉ không bọc bằng overlay */}

          {/* Đồng ý điều khoản */}
          <div className="flex justify-center items-center mt-6">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) =>
                setFormData({ ...formData, agreeTerms: e.target.checked })
              }
              className="h-4 w-4 rounded cursor-pointer border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Đồng ý với{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-green-600 hover:underline font-medium"
              >
                điều khoản & chính sách
              </a>
            </span>
          </div>

          {/* Submit */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full mt-6 cursor-pointer py-2 rounded-lg font-medium transition
              ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <CircularProgress size={20} color="inherit" />
                Đang đăng ký...
              </div>
            ) : (
              "Đăng ký"
            )}
          </button>

          {errors.submit && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {errors.submit}
            </p>
          )}

          <SelectAddressModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            form={form}
            setForm={setForm}
            address={address}
          />
        </div>

        {/* Nút về trang chủ */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 cursor-pointer py-2 rounded-lg font-medium border border-green-600 text-green-600 bg-white hover:bg-green-50 transition"
          >
            ← Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
