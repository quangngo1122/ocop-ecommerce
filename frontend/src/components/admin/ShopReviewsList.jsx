import React, { useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastProvider";
// ----------------------- GraphQL ------------------------
const GET_REVIEWS = gql`
  query Reviews($filter: ReviewsFilter, $pagination: PaginationInput) {
    reviews(filter: $filter, pagination: $pagination) {
      items {
        _id
        content
        product_id {
          _id
          name
          images
        }
        rating
        user_id {
          _id
          fullName
          email
        }
        status
        reply {
          content
        }
        createdAt
      }
      total
    }
  }
`;

const MUTATION_UPDATE_STATUS = gql`
  mutation UpdateReviewStatus($_id: ID!, $status: ReviewStatus!) {
    updateReviewStatus(_id: $_id, status: $status) {
      _id
      status
    }
  }
`;

const MUTATION_DELETE = gql`
  mutation DeleteReview($_id: ID!) {
    deleteReview(_id: $_id)
  }
`;
// ----------------------- GraphQL ------------------------
const STATUS_LABELS = {
  approved: "Hiển thị",
  pending: "Chờ duyệt",
  rejected: "Từ chối",
};

const STATUS_COLORS = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 10;

export default function ShopReviewsList({ shopId }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Query reviews của shop
  const { data, refetch, loading } = useQuery(GET_REVIEWS, {
    variables: {
      filter: {
        status: statusFilter || undefined,
        shop_id: shopId,
      },
      pagination: {
        offset: (currentPage - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      },
      fetchPolicy: "network-only",
    },
  });

  const [updateReviewStatus] = useMutation(MUTATION_UPDATE_STATUS);
  const [deleteReview] = useMutation(MUTATION_DELETE);

  const reviews = data?.reviews?.items || [];
  const total = data?.reviews?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Filter by search text
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.product_id.name.toLowerCase().includes(searchText.toLowerCase()) ||
      r.user_id.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.user_id.email?.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  // Modal handlers
  const handleOpenModal = (review) => {
    setSelectedReview(review);
    setNewStatus(review.status);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReview(null);
  };

  const handleStatusChange = async () => {
    if (!selectedReview || !newStatus) return;
    try {
      await updateReviewStatus({
        variables: { _id: selectedReview._id, status: newStatus },
      });
      showToast("Cập nhật trạng thái thành công!", "success");
      handleCloseModal();
      refetch();
    } catch (err) {
      showToast("Cập nhật trạng thái thất bại!", "error");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá đánh giá này?")) return;
    try {
      await deleteReview({ variables: { _id: reviewId } });
      showToast("Xóa review thành công!", "success");
      refetch();
    } catch (err) {
      showToast("Xoá thất bại!", "error");
    }
  };

  // Pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg min-h-[400px] font-sans">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-yellow-300 rounded-sm inline-block" />
        <h1 className="text-2xl font-bold">Đánh Giá Sản Phẩm Của Shop</h1>
      </div>
      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm sản phẩm, người đánh giá, email..."
          className="border border-gray-300 px-4 py-2 rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="cursor-pointer border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="approved">Hiển thị</option>
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white rounded-lg border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Ảnh
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Sản phẩm
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Người đánh giá
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Điểm
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Nội dung
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Trạng thái
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Phản hồi
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Ngày tạo
              </th>
              <th className="border-b border-gray-200 text-center px-3 py-3 text-sm font-semibold text-gray-700">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-8 text-gray-500 text-lg"
                >
                  Đang tải...
                </td>
              </tr>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((r, index) => (
                <tr
                  key={r._id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition duration-150 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {/* Ảnh sản phẩm */}
                  <td className="px-3 py-4 text-center">
                    {r.product_id.images[0] && (
                      <img
                        src={r.product_id.images[0]}
                        alt={r.product_id.name}
                        className="w-12 h-12 object-cover rounded-lg mx-auto"
                      />
                    )}
                  </td>
                  {/* Tên sản phẩm */}
                  <td className="px-3 py-4 min-w-[150px] text-gray-700 ">
                    {r.product_id.name}
                  </td>
                  {/* Người đánh giá */}
                  <td className="px-3 py-4 min-w-[150px] text-gray-700 text-center">
                    <button
                      onClick={() =>
                        navigate(`/admin/user/detail/${r.user_id._id}`)
                      }
                      className="text-sm cursor-pointer text-indigo-500 font-semibold hover:font-bold px-1 hover:px-0"
                    >
                      {r.user_id.fullName || "Chưa có"}
                    </button>
                  </td>
                  {/* Điểm */}
                  <td className="px-3 py-4 text-center">
                    <span className="font-bold text-yellow-500">
                      {r.rating}★
                    </span>
                  </td>
                  {/* Nội dung */}
                  <td className="px-3 py-4 min-w-[150px] text-gray-700">
                    {r.content}
                  </td>
                  {/* Trạng thái */}
                  <td className="px-3 py-4 text-center">
                    <div className="whitespace-nowrap flex items-center gap-2 justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[r.status] || "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                      <button
                        className="cursor-pointer text-blue-600 hover:text-blue-800 transition duration-200"
                        onClick={() => handleOpenModal(r)}
                        title="Đổi trạng thái"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                  {/* Phản hồi */}
                  <td className="px-3 py-4 min-w-[180px] ">
                    {r.reply && r.reply.content ? (
                      <span className="text-gray-600 italic text-sm">
                        Đã trả lời: {r.reply.content}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-sm">
                        (Chưa có phản hồi)
                      </span>
                    )}
                  </td>
                  {/* Ngày tạo */}
                  <td className="px-3 py-4 text-gray-700 text-center">
                    {dayjs(r.createdAt).format("DD/MM/YYYY HH:mm")}
                  </td>
                  {/* Thao tác */}
                  <td className="px-3 py-4 text-center">
                    <button
                      className="cursor-pointer text-red-600 hover:text-red-800 transition duration-200"
                      onClick={() => handleDelete(r._id)}
                      title="Xoá đánh giá"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-8 text-gray-500 text-lg"
                >
                  Không có đánh giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center gap-2 mt-6">
        <div className="text-sm text-gray-700">
          Trang {currentPage} / {totalPages}. Đánh giá từ{" "}
          {(currentPage - 1) * PAGE_SIZE + 1} đến{" "}
          {Math.min(currentPage * PAGE_SIZE, total)} trong tổng cộng {total}{" "}
          đánh giá
        </div>
        {totalPages > 1 && (
          <div className="flex gap-1 items-center">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "bg-white text-blue-600 cursor-pointer hover:bg-blue-50"
              }`}
            >
              <i className="fas fa-chevron-left mr-1"></i> Trang trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
              }`}
            >
              Trang sau <i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        )}
      </div>

      {/* Modal đổi trạng thái */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-md transform transition-all duration-200 scale-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Đổi trạng thái đánh giá
            </h3>
            <div className="mb-4">
              <select
                className="cursor-pointer border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="approved">Hiển thị</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 cursor-pointer rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
                onClick={handleCloseModal}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 cursor-pointer rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                onClick={handleStatusChange}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
