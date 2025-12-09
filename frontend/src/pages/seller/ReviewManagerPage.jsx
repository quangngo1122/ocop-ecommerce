import React, { useState, useContext } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { AuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../contexts/ToastProvider.jsx";

// ----------------------- GraphQL ------------------------
const GET_REVIEWS = gql`
  query Reviews($filter: ReviewsFilter) {
    reviews(filter: $filter) {
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
          fullName
        }
        status
        reply {
          content
        }
      }
    }
  }
`;

// Mutation để shop trả lời
const MUTATION_REPLY = gql`
  mutation Mutation($input: replyToReviewInput!) {
    replyToReview(input: $input) {
      content
    }
  }
`;

export default function ReviewManager() {
  const { showToast } = useToast();
  const { shopData } = useContext(AuthContext);
  const [loadingReplyId, setLoadingReplyId] = useState(null);
  const { data, refetch } = useQuery(GET_REVIEWS, {
    variables: { filter: { shop_id: shopData?._id } },
  });
  console.log(shopData?._id);
  const [replyToReview] = useMutation(MUTATION_REPLY);
  const reviews = data?.reviews?.items || [];

  const [replyContent, setReplyContent] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  // --- State tìm kiếm và lọc ---
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "approved" | "pending"

  const handleReply = (reviewId) => setReplyingId(reviewId);
  const handleReplyChange = (reviewId, value) => {
    setReplyContent((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleReplySubmit = async (reviewId) => {
    const reply = replyContent[reviewId];
    if (!reply) return;

    try {
      setLoadingReplyId(reviewId); // Bắt đầu loading

      await replyToReview({
        variables: {
          input: {
            content: reply,
            review_id: reviewId,
          },
        },
      });

      showToast("Phản hồi đánh giá thành công");
      setReplyContent((prev) => ({ ...prev, [reviewId]: "" }));
      setReplyingId(null);
      refetch();
    } catch (error) {
      console.error(error);
      showToast("Đã có lỗi xảy ra");
    } finally {
      setLoadingReplyId(null); // Tắt loading
    }
  };

  // --- Lọc dữ liệu theo search và status ---
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.product_id.name.toLowerCase().includes(searchText.toLowerCase()) ||
      r.user_id.fullName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Quản Lý Đánh Giá Sản Phẩm</h2>

      {/* --- Search & Filter --- */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm sản phẩm hoặc người đánh giá..."
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="approved">Hiển thị</option>
          <option value="pending">Chưa được duyệt</option>
        </select>
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Ảnh</th>
              <th className="border px-4 py-2">Sản phẩm</th>
              <th className="border px-4 py-2">Người đánh giá</th>
              <th className="border px-4 py-2">Điểm</th>
              <th className="border px-4 py-2">Nội dung</th>
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Phản hồi</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((r) => {
                const reviewId = r._id;
                return (
                  <tr key={reviewId} className="border-t align-top">
                    {/* Ảnh sản phẩm */}
                    <td className="border px-4 py-2">
                      {r.product_id.images[0] && (
                        <img
                          src={r.product_id.images[0]}
                          alt={r.product_id.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                    </td>

                    {/* Tên sản phẩm */}
                    <td className="border px-4 py-2 max-w-[150px] truncate">
                      <span title={r.product_id.name}>{r.product_id.name}</span>
                    </td>

                    {/* Người đánh giá */}
                    <td className="border px-4 py-2">{r.user_id.fullName}</td>

                    {/* Điểm */}
                    <td className="border px-4 py-2">
                      <span className="font-bold text-yellow-500">
                        {r.rating}★
                      </span>
                    </td>

                    {/* Nội dung */}
                    <td className="border px-4 py-2 max-w-[300px]">
                      <div className="line-clamp-3 text-gray-700">
                        {r.content}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="border px-4 py-2">
                      <span
                        className={`px-2 py-1 whitespace-nowrap rounded text-xs ${
                          r.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {r.status === "approved" ? "Hiển thị" : "Chưa duyệt"}
                      </span>
                    </td>

                    {/* Phản hồi */}
                    <td className="border px-4 py-2 min-w-[180px]">
                      {r.reply && r.reply.content ? (
                        <span className="text-gray-700 italic text-sm">
                          Đã trả lời: {r.reply.content}
                        </span>
                      ) : replyingId === reviewId ? (
                        <div className="flex gap-2 mt-1">
                          <input
                            autoFocus
                            className="border border-gray-300 rounded px-2 py-1 flex-1 text-sm"
                            value={replyContent[reviewId] || ""}
                            onChange={(e) =>
                              handleReplyChange(reviewId, e.target.value)
                            }
                            placeholder="Nhập phản hồi..."
                          />
                          <button
                            className="bg-[#5aa32a] cursor-pointer text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleReplySubmit(reviewId)}
                          >
                            Gửi
                          </button>
                          <button
                            className="text-gray-400 cursor-pointer px-2"
                            onClick={() => setReplyingId(null)}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          className="text-green-600 cursor-pointer hover:underline text-sm"
                          onClick={() => handleReply(reviewId)}
                        >
                          Trả lời
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  Không có đánh giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
