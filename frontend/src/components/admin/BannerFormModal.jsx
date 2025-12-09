import React from "react";

export default function BannerFormModal({
  isOpen,
  isEdit,
  form,
  previewImage,
  onClose,
  onChange,
  onSubmit,
  onImageUpload,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Sửa Banner" : "Thêm Banner Mới"}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Hình ảnh <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="w-full px-3 py-2 border rounded"
              required={!isEdit}
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="preview"
                className="mt-2 h-24 rounded"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Liên kết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="link"
              value={form.link}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="cursor-pointer hover:border-blue-400 w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
            >
              {isEdit ? "Cập nhật banner" : "Thêm banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
