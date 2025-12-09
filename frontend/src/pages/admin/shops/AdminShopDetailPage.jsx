import React, { useState } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";
import ShopProductList from "../../../components/admin/ShopProductList";
import ShopOrderList from "../../../components/admin/ShopOrderList";
import ShopReviewsList from "../../../components/admin/ShopReviewsList";
import { useToast } from "../../../contexts/ToastProvider";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarBorderIcon from "@mui/icons-material/StarBorder";
// -----------------------GRAPHQL-----------------------
const SHOP_DETAIL_QUERY = gql`
  # query Shop($id: ID!) {
  #   shop(_id: $id) {
  query Query($filter: ShopFilter!) {
    shop(filter: $filter) {
      _id
      name
      logo
      owner {
        fullName
        email
        phoneNumber
      }
      description
      contact {
        email
        phone
      }
      address {
        address
        district
        province
        ward
        isDefault
      }
      businessLicense {
        name
        # images {
        #   imageUrl
        # }
        images
        description
        code
        _id
      }
      status
      createdAt
      updatedAt
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
// -----------------------GRAPHQL-----------------------
const statusMap = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-800" },
  suspended: { label: "Bị cấm", color: "bg-red-100 text-red-800" },
  pending: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
  closed: { label: "Đã đóng", color: "bg-gray-100 text-gray-800" },
  locked: { label: "Đã khóa", color: "bg-blue-100 text-blue-800" },
};

const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "suspended", label: "Từ chối" },
  { value: "closed", label: "Đóng Shop" },
  { value: "locked", label: "Khóa Shop" },
];

function formatDate(dateStr) {
  if (!dateStr) return "Chưa có";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminShopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [previewImage, setPreviewImage] = useState(null);

  const { data, loading, error, refetch } = useQuery(SHOP_DETAIL_QUERY, {
    variables: { filter: { _id: id } },
    fetchPolicy: "network-only",
  });

  //-----------------------------
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "description";
  //-----------------------------

  const [updateShopStatus, { loading: updating }] = useMutation(
    UPDATE_SHOP_STATUS,
    {
      onCompleted: () => {
        setSuccessMsg("Cập nhật trạng thái thành công!");
        showToast("Cập nhật trạng thái thành công!", "success");
        setErrorMsg("");
        setEditMode(false);
        refetch();
        setTimeout(() => setSuccessMsg(""), 2000);
      },
      onError: (err) => {
        setErrorMsg(err.message || "Có lỗi xảy ra!");
        showToast("Cập nhật trạng thái thất bại: " + err.message, "error");
        setSuccessMsg("");
      },
    }
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <CircularProgress />
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-red-600">
        <ErrorIcon className="mr-2" />
        <span className="text-lg">Lỗi tải dữ liệu: {error.message}</span>
      </div>
    );

  const shop = data?.shop;
  if (!shop)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">
        <span className="text-lg">Không tìm thấy thông tin shop.</span>
      </div>
    );

  const statusInfo = statusMap[shop.status] || {
    label: shop.status,
    color: "bg-gray-100 text-gray-800",
  };

  const handleEditStatus = () => {
    setEditMode(true);
    setSelectedStatus(shop.status);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSaveStatus = async () => {
    if (!selectedStatus || selectedStatus === shop.status) {
      setEditMode(false);
      return;
    }
    await updateShopStatus({
      variables: {
        updateShopStatusId: id,
        status: selectedStatus,
      },
    });
  };

  const handleImageClick = (images) => {
    setPreviewImage(images);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors duration-200"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon className="mr-2" />
          <span className="text-sm font-medium">Quay lại</span>
        </button>

        {/* ---------------------------------- */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => navigate(`/admin/shop/detail/${shop._id}`)}
            className={`flex cursor-pointer items-center gap-2 pb-2 ${
              currentTab === "description"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            <StorefrontIcon
              className={`${
                currentTab === "description"
                  ? "text-indigo-600 "
                  : "text-red-600 "
              }`}
            />{" "}
            Mô tả
          </button>

          <button
            onClick={() =>
              navigate(`/admin/shop/detail/${shop._id}?tab=product`)
            }
            className={`cursor-pointer flex items-center gap-2 pb-2 ${
              currentTab === "product"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            <ShoppingBasketIcon
              className={`${
                currentTab === "product"
                  ? "text-indigo-600 "
                  : "text-orange-600 "
              }`}
            />{" "}
            Sản phẩm
          </button>

          <button
            onClick={() =>
              navigate(`/admin/shop/detail/${shop._id}?tab=orders`)
            }
            className={`cursor-pointer flex items-center gap-2 pb-2 ${
              currentTab === "orders"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            <ShoppingCartIcon
              className={`${
                currentTab === "orders" ? "text-indigo-600 " : "text-green-600 "
              }`}
            />{" "}
            Orders
          </button>

          <button
            onClick={() =>
              navigate(`/admin/shop/detail/${shop._id}?tab=reviews`)
            }
            className={`cursor-pointer flex items-center gap-2 pb-2 ${
              currentTab === "reviews"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            <StarBorderIcon
              className={`${
                currentTab === "reviews"
                  ? "text-indigo-600 "
                  : "text-yellow-600 "
              }`}
            />{" "}
            Reviews
          </button>
        </div>

        {currentTab === "description" && (
          // ----------------------------------

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                <img
                  src={shop.logo}
                  alt="Logo shop"
                  className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover shadow-sm"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {shop.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    {!editMode && (
                      <button
                        className="text-indigo-600 cursor-pointer  hover:text-indigo-800 transition-colors duration-200"
                        onClick={handleEditStatus}
                        title="Đổi trạng thái"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                  {editMode && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                      <select
                        className="  hover:border-blue-400 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        disabled={updating}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        className=" cursor-pointer flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                        onClick={handleSaveStatus}
                        disabled={updating}
                      >
                        {updating ? (
                          <CircularProgress
                            size={18}
                            className="text-white mr-2"
                          />
                        ) : (
                          <CheckCircleIcon fontSize="small" className="mr-2" />
                        )}
                        Lưu
                      </button>
                      <button
                        className=" cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                        onClick={() => setEditMode(false)}
                        disabled={updating}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                  {successMsg && (
                    <div className="mt-4 flex items-center text-green-600">
                      <CheckCircleIcon fontSize="small" className="mr-2" />
                      <span className="text-sm">{successMsg}</span>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="mt-4 flex items-center text-red-600">
                      <ErrorIcon fontSize="small" className="mr-2" />
                      <span className="text-sm">{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Liên hệ
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {shop.contact?.email || "Chưa có"}
                    </p>
                    <p>
                      <span className="font-medium">SĐT:</span>{" "}
                      {shop.contact?.phone || "Chưa có"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Chủ shop
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-medium">Họ tên:</span>{" "}
                      {shop.owner?.fullName || "Chưa có"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {shop.owner?.email || "Chưa có"}
                    </p>
                    <p>
                      <span className="font-medium">SĐT:</span>{" "}
                      {shop.owner?.phoneNumber ||
                        shop.contact?.phone ||
                        "Chưa có"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Địa chỉ
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {shop.address?.address || "Chưa có"}
                  </p>
                  <p>
                    <span className="font-medium">Phường/Xã:</span>{" "}
                    {shop.address?.ward || "Chưa có"}
                  </p>
                  <p>
                    <span className="font-medium">Quận/Huyện:</span>{" "}
                    {shop.address?.district || "Chưa có"}
                  </p>
                  <p>
                    <span className="font-medium">Tỉnh/Thành:</span>{" "}
                    {shop.address?.province || "Chưa có"}
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Giới thiệu
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {shop.description || "Chưa có"}
                </p>
              </div>
              {/* <div className="mt-8 bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Giấy phép kinh doanh
              </h3>
              {shop.businessLicense && shop.businessLicense.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded shadow">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">Tên giấy phép</th>
                        <th className="px-4 py-2 border">Mã số</th>
                        <th className="px-4 py-2 border">Mô tả</th>
                        <th className="px-4 py-2 border">Ảnh</th>
                        <th className="px-4 py-2 border">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shop.businessLicense.map((license) => (
                        <tr
                          key={license._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 border">{license.name}</td>
                          <td className="px-4 py-2 border">{license.code}</td>
                          <td className="px-4 py-2 border">
                            {license.description}
                          </td>
                          <td className="px-4 py-2 border">
                            <div className="flex gap-2 flex-wrap">
                              {license.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.imageUrl}
                                  alt={`Giấy phép ${idx + 1}`}
                                  className="h-12 rounded border border-gray-200 shadow"
                                />
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2 border text-xs text-gray-500">
                            {license._id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  Chưa cập nhật giấy chứng nhận.
                </div>
              )}
            </div> */}
              <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Giấy chứng nhận
                </h3>
                {shop.businessLicense && shop.businessLicense.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {shop.businessLicense.map((license) => (
                      <div
                        key={license._id}
                        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                      >
                        <h4 className="text-base text-center font-semibold text-gray-900 mb-2">
                          {license.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Mã số:</span>{" "}
                          {license.code}
                        </p>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                          <span className="font-medium">Mô tả:</span>{" "}
                          {license.description || "Không có mô tả"}
                        </p>
                        {/* <div className="flex flex-wrap gap-2 mb-3">
                        {license.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.imageUrl}
                            alt={`Giấy phép ${idx + 1}`}
                            className="h-24 w-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            onClick={() => handleImageClick(img.imageUrl)}
                          />
                        ))}
                      </div> */}
                        <div className="flex justify-center">
                          <div className="flex overflow-x-auto whitespace-nowrap gap-2 mb-3 ">
                            {license.images.map((img, idx) => (
                              <div
                                onClick={() => handleImageClick(img)}
                                key={idx}
                                className="relative group cursor-pointer inline-block shrink-0"
                              >
                                <img
                                  src={img}
                                  alt={`Giấy phép ${idx + 1}`}
                                  className="h-24 w-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="bg-black/50 bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Phóng to
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          ID: {license._id}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Chưa cập nhật giấy chứng nhận.
                  </div>
                )}
              </div>

              {previewImage && (
                <div
                  className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50"
                  onClick={closePreview}
                >
                  <div className="relative max-w-[90vw] max-h-[90vh] overflow-auto">
                    <img
                      src={previewImage}
                      alt="Xem trước giấy phép"
                      className="w-full h-auto object-contain  min-w-[40vw] min-h-[40vh]  rounded-lg shadow-lg"
                    />
                    <button
                      className="absolute cursor-pointer top-2 right-2 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200"
                      onClick={closePreview}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <span className="font-medium text-gray-700">Ngày tạo:</span>
                  <p className="text-gray-900">{formatDate(shop.createdAt)}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <span className="font-medium text-gray-700">
                    Ngày cập nhật:
                  </span>
                  <p className="text-gray-900">{formatDate(shop.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          // ---------------------------------
        )}
        {currentTab === "product" && <ShopProductList shopId={shop._id} />}

        {currentTab === "orders" && <ShopOrderList shopId={shop._id} />}

        {currentTab === "reviews" && <ShopReviewsList shopId={shop._id} />}

        {/* ---------------------------------------------- */}
      </div>
    </div>
  );
}

// backup
