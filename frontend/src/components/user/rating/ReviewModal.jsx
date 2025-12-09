import React, { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export default function ReviewModal({
  order,
  existingReviews,
  onClose,
  onSubmit,
  loading,
}) {
  const [reviewsState, setReviewsState] = useState({});

  const handleChange = (variantId, field, value) => {
    setReviewsState((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value },
    }));
  };

  const hasPendingReviews = order.items.some(
    (item) => !existingReviews[item.variant?.product_id?._id]
  );

  const handleSubmit = () => {
    onSubmit(reviewsState);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="relative bg-white w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Đánh giá đơn hàng</h2>

        {order.items.map((item) => {
          const variantId = item.variant?._id;
          const productId = item.variant?.product_id?._id;
          const existing = existingReviews[productId];

          return (
            <div key={variantId} className="mb-4 border-b pb-2">
              <div className="flex items-center gap-4 mb-2">
                {item.variant?.product_id?.images?.[0] && (
                  <img
                    src={item.variant.product_id.images[0]}
                    alt={item.variant.product_id.name}
                    className="w-16 h-16 object-cover"
                  />
                )}
                <span>{item.variant?.product_id?.name}</span>
              </div>

              {existing ? (
                <div className="bg-gray-100 p-2 rounded">
                  <p className="font-semibold">Đã đánh giá:</p>
                  <p>⭐ {existing.rating}</p>
                  <p>{existing.content}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    Đánh giá sao:
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleChange(variantId, "rating", star)}
                        className="cursor-pointer"
                      >
                        {reviewsState[variantId]?.rating >= star ? (
                          <StarIcon style={{ color: "#FFD700" }} />
                        ) : (
                          <StarBorderIcon style={{ color: "#CCC" }} />
                        )}
                      </span>
                    ))}
                  </div>
                  <label>
                    Nội dung:
                    <textarea
                      value={reviewsState[variantId]?.content || ""}
                      onChange={(e) =>
                        handleChange(variantId, "content", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                      placeholder="Viết đánh giá của bạn..."
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 cursor-pointer bg-gray-400 rounded text-white"
          >
            Đóng
          </button>

          {hasPendingReviews && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 rounded text-white flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
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
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  ></path>
                </svg>
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
