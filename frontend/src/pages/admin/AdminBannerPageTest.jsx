import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../contexts/ToastProvider";

const BANNERS_QUERY = gql`
  query {
    banners(pagination: { limit: 20, offset: 0 }) {
      items {
        id
        title
        image
        link
        status
        createdAt
      }
    }
  }
`;

const CREATE_BANNER = gql`
  mutation ($input: CreateBannerInput!) {
    createBanner(input: $input) {
      id
    }
  }
`;

const UPDATE_BANNER = gql`
  mutation UpdateBanner($updateBannerId: ID!, $input: UpdateBannerInput!) {
    updateBanner(id: $updateBannerId, input: $input) {
      id
    }
  }
`;

const DELETE_BANNER = gql`
  mutation DeleteBanner($deleteBannerId: ID!) {
    deleteBanner(id: $deleteBannerId) {
      id
    }
  }
`;

export default function AdminBannerPage() {
  const { data, loading, error, refetch } = useQuery(BANNERS_QUERY);
  const [createBanner] = useMutation(CREATE_BANNER);
  const [updateBanner] = useMutation(UPDATE_BANNER);
  const [deleteBanner] = useMutation(DELETE_BANNER);
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [form, setForm] = useState({
    title: "",
    image: null, // ← file object
    link: "",
    status: "active",
  });

  const handleOpenModal = () => {
    setForm({ title: "", image: null, link: "", status: "active" });
    setPreviewImage(null);
    setIsEdit(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (banner) => {
    setForm({
      title: banner.title,
      image: null, // không set ảnh cũ
      link: banner.link,
      status: banner.status,
    });
    setPreviewImage(banner.image);
    setIsEdit(true);
    setEditId(banner.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setForm({ title: "", image: null, link: "", status: "active" });
    setPreviewImage(null);
    setIsEdit(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, image, link, status } = form;

    if (!title || (!image && !isEdit) || !link || !status) {
      showToast("Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }

    try {
      const input = { title, link, status };
      if (image) input.image = image;

      if (isEdit && editId) {
        await updateBanner({ variables: { updateBannerId: editId, input } });
        showToast("Cập nhật banner thành công!", "success");
      } else {
        await createBanner({ variables: { input } });
        showToast("Tạo banner thành công!", "success");
      }

      handleCloseModal();
      refetch();
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này không?")) return;
    try {
      await deleteBanner({ variables: { deleteBannerId: id } });
      showToast("Đã xóa banner", "success");
      refetch();
    } catch (err) {
      showToast("Lỗi khi xóa: " + err.message, "error");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-blue-400 rounded-sm" />
        <h2 className="text-xl font-semibold">Quản lý Banner</h2>
        <button
          className="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleOpenModal}
        >
          + Thêm banner
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p>Lỗi: {error.message}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.banners.items.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded shadow">
              <img
                src={b.image}
                alt="banner"
                className="w-full h-40 object-cover mb-2 rounded"
              />
              <h4 className="font-semibold">{b.title}</h4>
              <a
                href={b.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 truncate block"
              >
                {b.link}
              </a>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    b.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {b.status === "active" ? "Hiển thị" : "Ẩn"}
                </span>
                <span className="text-gray-400">
                  {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => handleOpenEditModal(b)}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={handleCloseModal}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {isEdit ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Tiêu đề"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                name="link"
                placeholder="Đường dẫn"
                value={form.link}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="active">Hiển thị</option>
                <option value="inactive">Ẩn</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-32 object-cover mt-2 rounded"
                />
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {isEdit ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
