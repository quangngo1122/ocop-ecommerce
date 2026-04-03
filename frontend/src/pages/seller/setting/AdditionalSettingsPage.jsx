import React, { useState, useRef, useContext } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// GraphQL -----------------------------------
const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      _id
      businessLicense {
        _id
        code
        name
        # images {
        #   imageUrl
        # }
        images
        description
      }
      owner {
        _id
      }
    }
  }
`;

const ADD_BUSINESS_LICENSE = gql`
  mutation AddBusinessLicense(
    $shopId: ID!
    $businessLicense: AddBusinessLicenseInput!
  ) {
    addBusinessLicense(shopId: $shopId, businessLicense: $businessLicense) {
      businessLicense {
        _id
        # name
        # code
        # description
        # images {
        #   imageUrl
        # }
      }
    }
  }
`;

const UPDATE_BUSINESS_LICENSE = gql`
  mutation UpdateBusinessLicense(
    $businessLicenseId: ID!
    $businessLicense: BusinessLicenseInput!
  ) {
    updateBusinessLicense(
      businessLicenseId: $businessLicenseId
      businessLicense: $businessLicense
    ) {
      businessLicense {
        _id
        # name
        # code
        # description
        # images {
        #   imageUrl
        # }
      }
    }
  }
`;

const DELETE_BUSINESS_LICENSE = gql`
  mutation DeleteBusinessLicense($shopId: ID!, $businessLicenseId: ID!) {
    deleteBusinessLicense(
      shopId: $shopId
      businessLicenseId: $businessLicenseId
    ) {
      businessLicense {
        _id
      }
    }
  }
`;
// end GraphQL -----------------------------------
export default function AdditionalSettingsPage() {
  const fileInputRef = useRef(null);
  const { userData } = useContext(AuthContext);
  const { showToast } = useToast();
  const userId = userData?._id;
  const navigate = useNavigate();

  const { data: myShopData, loading } = useQuery(MY_SHOP_QUERY, {
    // fetchPolicy: "network-only",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const myShop = myShopData?.myShop;
  const shopId = myShop?._id;

  const [saving, setSaving] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);

  const [addBusinessLicense, { loading: adding }] =
    useMutation(ADD_BUSINESS_LICENSE);
  const [updateBusinessLicense, { loading: updating }] = useMutation(
    UPDATE_BUSINESS_LICENSE,
  );
  const [deleteBusinessLicense, { loading: deleting }] = useMutation(
    DELETE_BUSINESS_LICENSE,
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    images: [],
    imagesFileName: "Không có tệp nào được chọn",
    imagesPreview: [],
  });

  // Chế độ sửa hay thêm
  const [editMode, setEditMode] = useState(false);
  const [editingLicenseId, setEditingLicenseId] = useState(null);

  const handleEdit = (license) => {
    setEditMode(true);
    setEditingLicenseId(license._id);
    setFormData({
      name: license.name || "",
      code: license.code || "",
      description: license.description || "",
      images: [],
      imagesFileName:
        license.images && license.images.length > 0
          ? license.images
              .map((img) => {
                const parts = img.split("/");
                return parts[parts.length - 1];
              })
              .join(", ")
          : "Không có tệp nào được chọn",
      imagesPreview: license.images ? [...license.images] : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Khi nhấn xóa, gọi mutation
  const handleDelete = async (licenseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa giấy phép này?")) return;
    try {
      await deleteBusinessLicense({
        variables: { shopId, businessLicenseId: licenseId },
        refetchQueries: [{ query: MY_SHOP_QUERY }],
      });
      showToast("Đã xóa giấy phép!", "success");
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    }
  };

  // Khi nhấn thêm mới, reset form
  const handleAddNew = () => {
    setEditMode(false);
    setEditingLicenseId(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      images: [],
      imagesFileName: "Không có tệp nào được chọn",
      imagesPreview: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedExtensions = ["png", "jpg", "jpeg"];
    const validFiles = files.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return allowedExtensions.includes(ext);
    });
    setFormData((prev) => ({
      ...prev,
      // Nối thêm file mới vào mảng ảnh cũ (nếu đang sửa)
      images: [...prev.images, ...validFiles],
      imagesFileName: [...prev.images, ...validFiles].length
        ? [...prev.images, ...validFiles].map((f) => f.name).join(", ")
        : "Không có tệp nào được chọn",
      // imagesPreview: [
      //   ...prev.imagesPreview,
      //   ...validFiles.map((file) => URL.createObjectURL(file)),
      // ],
      imagesPreview: [
        ...validFiles.map((file) => URL.createObjectURL(file)),
        ...prev.imagesPreview,
      ],
    }));
  };

  const handleRemoveImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      imagesPreview: prev.imagesPreview.filter((_, i) => i !== idx),
      imagesFileName: prev.images.filter((_, i) => i !== idx).length
        ? prev.images
            .filter((_, i) => i !== idx)
            .map((f) => f.name)
            .join(", ")
        : "Không có tệp nào được chọn",
    }));
  };

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    if (!shopId) {
      showToast("Không tìm thấy shop của bạn!", "error");
      return;
    }
    if (!formData.name || !formData.code) {
      showToast("Vui lòng nhập đầy đủ tên và mã số giấy phép!", "error");
      return;
    }
    if (!editMode && formData.images.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 ảnh giấy phép!", "error");
      return;
    }
    try {
      if (editMode) {
        // Chỉ truyền images nếu có file mới
        const businessLicenseInput = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
        };
        if (formData.images.length > 0) {
          businessLicenseInput.images = formData.images;
        }
        await updateBusinessLicense({
          variables: {
            businessLicenseId: editingLicenseId,
            businessLicense: businessLicenseInput,
          },
          refetchQueries: [{ query: MY_SHOP_QUERY }],
        });
        showToast("Cập nhật giấy phép thành công!", "success");
      } else {
        await addBusinessLicense({
          variables: {
            shopId,
            businessLicense: {
              name: formData.name,
              code: formData.code,
              description: formData.description,
              images: formData.images,
            },
          },
          refetchQueries: [{ query: MY_SHOP_QUERY }],
        });
        showToast("Thêm giấy phép thành công!", "success");
      }
      handleAddNew();
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {editMode
            ? "Cập Nhật Giấy Phép Kinh Doanh"
            : "Thêm Giấy Phép Kinh Doanh"}
        </h1>
        <button
          onClick={() => navigate("/seller/setting")}
          className="px-4 py-2 cursor-pointer  bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Quay lại Cấu hình Website
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 col-span-1"
            >
              Tên Giấy Phép <span className="text-red-500">*</span>
            </label>
            <div className="col-span-2">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className=" hover:border-blue-400 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
            <label
              htmlFor="code"
              className="text-sm font-medium text-gray-700 col-span-1"
            >
              Số Giấy Phép <span className="text-red-500">*</span>
            </label>
            <div className="col-span-2">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
                className=" hover:border-blue-400 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 col-span-1"
            >
              Mô Tả Xác Nhận
            </label>
            <div className="col-span-2">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows="4"
                className=" hover:border-blue-400 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
            <label
              htmlFor="images"
              className="text-sm font-medium text-gray-700 col-span-1"
            >
              Ảnh Giấy Phép <span className="text-red-500">*</span>
            </label>
            <div className="col-span-2 items-center">
              <input
                type="file"
                id="images"
                name="images"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                multiple
              />
              <button
                type="button"
                onClick={handleChooseFileClick}
                className="  hover:border-blue-400 cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Chọn tệp
              </button>
              <span className="ml-3 text-sm text-gray-500">
                {formData.imagesFileName}
              </span>
              {/* <div className="flex flex-wrap gap-2 ml-4">
                {formData.imagesPreview.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Ảnh giấy phép ${idx + 1}`}
                    className="h-20 rounded border border-gray-200 shadow"
                  />
                ))}
              </div> */}

              <div className="flex flex-wrap gap-2 mt-3">
                {formData.imagesPreview.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Ảnh giấy phép ${idx + 1}`}
                      className="h-20 min-w-20 rounded border border-gray-200 shadow cursor-pointer"
                      onClick={() => setPreviewImage(img)}
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                      onClick={() => handleRemoveImage(idx)}
                      title="Xóa ảnh này"
                    >
                      <span className="text-red-500 font-bold">×</span>
                    </button>
                    {formData.images[idx] instanceof File && (
                      <span className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-br">
                        Ảnh mới
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* <div className="flex flex-wrap gap-2 ml-4">
                {formData.imagesPreview.map((img, idx) => (
                  <div key={idx} className="relative">
                   
                    <img
                      src={img}
                      alt={`Ảnh giấy phép ${idx + 1}`}
                      className="mt-3 h-20 rounded border border-gray-200 shadow cursor-pointer"
                      onClick={() => setPreviewImage(img)}
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-white rounded-full p-1 shadow"
                      onClick={() => handleRemoveImage(idx)}
                      title="Xóa ảnh này"
                    >
                      <span className="text-red-500 font-bold">×</span>
                    </button>
                  </div>
                ))}
              </div> */}
            </div>
          </div>
          <div className="border-t border-gray-200 p-6 pb-3 flex justify-end gap-2">
            <button
              type="submit"
              className=" cursor-pointer px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
              disabled={adding || updating}
            >
              {(adding || updating) && (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              )}
              {editMode
                ? updating
                  ? "Đang cập nhật..."
                  : "Cập nhật giấy phép"
                : adding
                  ? "Đang thêm..."
                  : "Thêm giấy phép"}
            </button>
            {editMode && (
              <button
                type="button"
                className=" cursor-pointer px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={handleAddNew}
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>
        {saving && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-white text-lg">Đang lưu thay đổi...</p>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách giấy phép */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-3">
          Danh sách giấy phép kinh doanh
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 border border-gray-300">STT</th>
                <th className="px-3 py-2 border border-gray-300">Tên</th>
                <th className="px-3 py-2 border border-gray-300">Mã số</th>
                <th className="px-3 py-2 border border-gray-300">Mô tả</th>
                <th className="px-3 py-2 border border-gray-300">Ảnh</th>
                <th className="px-3 py-2 border border-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {myShop?.businessLicense?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Chưa có giấy phép nào.
                  </td>
                </tr>
              ) : (
                myShop.businessLicense.map((license, idx) => (
                  <tr
                    key={license._id}
                    className="border border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-2 py-2 text-center border border-gray-300">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      {license.name}
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      {license.code}
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      {license.description}
                    </td>
                    <td className="px-3 py-1 border border-gray-300">
                      <div className="flex justify-center">
                        <div className="flex gap-2 overflow-x-auto whitespace-nowrap ">
                          {license.images.map((img, idx) => (
                            // // <img
                            // //   key={idx}
                            // //   src={img.imageUrl}
                            // //   alt={`Ảnh ${idx + 1}`}
                            // //   className="h-12 w-12 rounded border border-gray-200 shadow"
                            // // />
                            // <img
                            //   key={idx}
                            //   src={img.imageUrl}
                            //   alt={`Ảnh ${idx + 1}`}
                            //   title="Xem ảnh"
                            //   className="h-12 w-12 object-cover rounded border border-gray-200 shadow cursor-pointer"
                            //   onClick={() => setPreviewImage(img.imageUrl)}
                            // />
                            <img
                              key={idx}
                              src={img}
                              alt={`Ảnh ${idx + 1}`}
                              title="Xem ảnh"
                              className="h-14 w-14 object-cover rounded border border-gray-200 shadow cursor-pointer"
                              onClick={() => setPreviewImage(img)}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center border border-gray-300">
                      <button
                        className=" cursor-pointer p-2 rounded bg-blue-100 hover:bg-blue-200 mx-2"
                        title="Sửa"
                        onClick={() => handleEdit(license)}
                      >
                        <EditIcon className="text-blue-600" />
                      </button>
                      <button
                        className=" cursor-pointer p-2 rounded bg-red-100 hover:bg-red-200"
                        title="Xóa"
                        onClick={() => handleDelete(license._id)}
                        disabled={deleting}
                      >
                        <DeleteIcon className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
              title="Đóng"
            >
              <span className="cursor-pointer text-xl font-bold text-gray-700">
                ×
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
