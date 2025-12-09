import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import StarIcon from "@mui/icons-material/Star";

export default function ShopHeader({ shop }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
      <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
        <div className="relative w-full">
          <img
            src={shop?.coverImage}
            alt="Shop Cover"
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className=" left-4 -bottom-8 flex items-center">
            <img
              src={shop?.logo || "/shop-avatar.jpg"}
              alt={shop?.name}
              className="w-20 h-20 rounded-full border-4 border-white shadow"
            />
            <span className="ml-3 bg-green-600 text-white text-xs px-2 py-1 rounded">
              Đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 mt- md:mt-0 md:pl-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          {shop.name}{" "}
          <CheckCircleIcon className="text-green-500" fontSize="small" />
        </h2>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-1 ">
          {Array.from({ length: 5 }).map((_, index) => (
            <StarIcon key={index} fontSize="small" />
          ))}
        </div>

        <p className="text-gray-500 text-sm mt-1">
          {shop.totalReviews} đánh giá lượt xem
        </p>

        {/* Rating breakdown */}
        <div className="mt-3">
          {Array.from({ length: 5 }, (_, i) => {
            const star = 5 - i;
            const count = 0; // giá trị mặc định (có thể thay đổi thành số cố định ví dụ 10, 20,...)
            const maxCount = 1; // để tránh chia cho 0, bạn có thể để 1
            const percent = (count / maxCount) * 100;

            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-10">{star} SAO</span>
                <div className="flex-1 bg-gray-200 rounded h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="text-sm w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
