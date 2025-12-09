import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../contexts/ToastProvider";
import BannerFormModal from "../../components/admin/BannerFormModal";

// -----------------------GRAPQL-----------------------

const BANNERS_QUERY = gql`
  query {
    banners(pagination: { limit: 20, offset: 0 }) {
      items {
        _id
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
      _id
    }
  }
`;

const UPDATE_BANNER = gql`
  mutation UpdateBanner($id: ID!, $input: UpdateBannerInput!) {
    updateBanner(_id: $id, input: $input) {
      _id
    }
  }
`;

const DELETE_BANNER = gql`
  mutation DeleteBanner($id: ID!) {
    deleteBanner(_id: $id)
  }
`;
export default function AdminBannerPage() {
  const { data, loading, error, refetch } = useQuery(BANNERS_QUERY);
  const [createBanner, { loading: creating }] = useMutation(CREATE_BANNER);
  const [updateBanner, { loading: updating }] = useMutation(UPDATE_BANNER);
  const [deleteBanner, { loading: deleting }] = useMutation(DELETE_BANNER);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    image: null,
    link: "",
    status: "active",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // const BannersPerPage = 8;
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Lọc banner client-side
  const banners = data?.banners?.items || [];
  // const filteredBanners = banners.filter((b) => {
  //   let match = true;
  //   if (searchTerm) {
  //     const term = searchTerm.toLowerCase();
  //     match =
  //       b.title.toLowerCase().includes(term) ||
  //       b.link.toLowerCase().includes(term);
  //   }
  //   if (match && statusFilter) {
  //     match = b.status === statusFilter;
  //   }
  //   return match;
  // });

  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      let match = true;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        match =
          b.title.toLowerCase().includes(term) ||
          b.link.toLowerCase().includes(term);
      }
      if (match && statusFilter) {
        match = b.status === statusFilter;
      }
      return match;
    });
  }, [banners, searchTerm, statusFilter]);

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
      image: null,
      link: banner.link,
      status: banner.status,
    });
    setPreviewImage(banner.image);
    setIsEdit(true);
    setEditId(banner._id);
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

    setSaving(true);

    const { title, image, link, status } = form;

    if (!title || (!image && !isEdit) || !link || !status) {
      showToast("Vui lòng nhập đầy đủ thông tin banner", "warning");
      return;
    }

    try {
      const input = { title, link, status };
      if (image) input.image = image;

      if (isEdit && editId) {
        await updateBanner({ variables: { id: editId, input } });
        showToast("Cập nhật banner thành công!", "success");
      } else {
        await createBanner({ variables: { input } });
        showToast("Thêm banner thành công!", "success");
      }

      handleCloseModal();
      refetch();
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) return;
    try {
      await deleteBanner({ variables: { id: id } });
      showToast("Xóa banner thành công!", "success");
      refetch();
    } catch (err) {
      showToast("Lỗi khi xóa banner: " + err.message, "error");
    }
  };

  // const totalPages = Math.ceil(filteredBanners.length / BannersPerPage);
  // const indexOfLastBanner = currentPage * BannersPerPage;
  // const indexOfFirstBanner = indexOfLastBanner - BannersPerPage;
  // const currentBanners = filteredBanners.slice(
  //   indexOfFirstBanner,
  //   indexOfLastBanner
  // );

  const totalBanners = filteredBanners.length;
  const totalPages = Math.ceil(totalBanners / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBanners = filteredBanners.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (e) => {
    const value =
      e.target.value === "all" ? totalBanners : Number(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchTerm, filteredBanners]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  return (
    <div className="relative ">
      {loading && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6 pt-5 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1 h-6 bg-violet-400 rounded-sm inline-block" />
          <h2 className="text-2xl font-bold">Quản lý Banner</h2>
          <button
            onClick={handleOpenModal}
            className=" cursor-pointer ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow font-medium transition"
          >
            + Thêm banner
          </button>
        </div>

        {/* Thanh tìm kiếm và lọc */}
        <div className="flex justify-end flex-wrap gap-2 mb-4 items-end">
          <input
            type="text"
            placeholder="Theo tiêu đề hoặc đường dẫn"
            className="border px-3 py-2 rounded w-64  border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            // className="border px-3 py-2 rounded w-64"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="border  cursor-pointer  px-3 py-2 rounded border-gray-400  focus:outline-none focus:ring-2 focus:ring-blue-500"
            // className="border  cursor-pointer  px-3 py-2 rounded"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="active">Hiển thị</option>
            <option value="inactive">Ẩn</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span>Số banner mỗi trang:</span>
            <select
              value={itemsPerPage === totalBanners ? "all" : itemsPerPage}
              onChange={handleItemsPerPageChange}
              className=" cursor-pointer border px-2 py-1 rounded border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              {/* <option value={8}>8</option> */}
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              {/* <option value={100}>100</option>
              <option value="all">Tất cả</option> */}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          // <div className="flex justify-center py-8">
          //   <div className="animate-spin h-6 w-6 border-4 border-blue-300 border-t-transparent rounded-full"></div>
          // </div>
          <div className=" p-6 flex justify-center items-center h-screen z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            Lỗi tải dữ liệu banner!
          </div>
        ) : // ) : data?.banners?.items?.length === 0 ? (
        // filteredBanners.length === 0 ? (
        currentBanners.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Không có banner nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* {data.banners.items.map((b) => ( */}
            {/* {filteredBanners.map((b) => ( */}
            {currentBanners.map((b) => (
              <div
                key={b._id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  className="shadow border border-gray-100 w-full h-40 object-cover rounded mb-3"
                />
                <h4 className="font-semibold text-lg truncate">{b.title}</h4>
                <a
                  href={b.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm hover:underline block truncate"
                >
                  {b.link}
                </a>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span
                    className={`px-3 py-1 rounded-full font-medium text-xs ${
                      b.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-200 text-gray-600"
                    }`}
                  >
                    {b.status === "active" ? "Hiển thị" : "Ẩn"}
                  </span>
                  <span className="text-gray-400">
                    {new Date(Number(b.createdAt)).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="px-3 cursor-pointer  py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="px-3 py-1 cursor-pointer  bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal thêm/sửa banner */}

        <BannerFormModal
          isOpen={showModal}
          isEdit={isEdit}
          form={form}
          previewImage={previewImage}
          onClose={handleCloseModal}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onImageUpload={handleImageUpload}
        />
        {saving && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-white text-lg">Đang lưu thay đổi...</p>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            {/* Trang {currentPage} / {totalPages}. Banner từ{" "}
            {(currentPage - 1) * BannersPerPage + 1} đến{" "}
            {Math.min(currentPage * BannersPerPage, filteredBanners.length)}{" "}
            trong tổng cộng {filteredBanners.length} Banner */}
            Trang {currentPage} / {totalPages}. Banner từ{" "}
            {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, filteredBanners.length)} trong
            tổng cộng {filteredBanners.length} Banner
          </div>
          {/* {totalPages > 1 && ( */}
          {totalPages > 1 && itemsPerPage !== totalBanners && (
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                }`}
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Trang trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                }`}
              >
                Trang sau
                <i className="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
