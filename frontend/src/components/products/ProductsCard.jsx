import React from "react";
import { useNavigate } from "react-router-dom";
import { encodeId } from "../../utils/encode";

export default function ProductsCard({ product }) {
  const navigate = useNavigate();
  const encodedId = product?._id ? encodeId(product._id) : "";

  return (
    <div
      className="
        w-full
        max-w-[250px]
        h-full
        border border-[#5aa32a]
        hover:scale-105
        transition-all duration-300 ease-in-out
        rounded-lg
        cursor-pointer
        mx-auto
        flex flex-col
      "
      onClick={() => navigate(`/product/${encodedId}`)}
    >
      <div className="p-2 sm:p-4 flex flex-col h-full">
        {/* Ảnh */}
        <div className="w-full max-w-[110px] sm:max-w-[150px] mx-auto">
          <img
            src={product?.images[0] || "../../public/default-product.jpg"}
            alt={product?.name || "Product"}
            className="object-contain w-full h-24 sm:h-42"
          />
        </div>

        <p
          className="font-bold text-xs sm:text-sm text-center mt-2 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: "1rem", // 16px
            minHeight: "2rem", // 16px * 2 = 32px, luôn 2 dòng
          }}
        >
          {product?.name}
        </p>

        {/* Giá */}
        <div className="text-center font-bold text-[#5aa32a] py-3">
          {product?.price?.min_price?.toLocaleString("vi-VN")} đ
        </div>

        {/* Sale */}
        <p className="text-center text-[#5aa32a] font-bold text-sm">
          {product?.price?.sale}
        </p>

        {/* ======= Rating + Shop luôn ở cuối ======= */}
        <div className="mt-auto">
          <div className="flex items-center justify-center mt-2">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, idx) => {
                const rating = product?.rating?.average || 0;
                const filled = idx < Math.floor(rating); // sao đầy
                const half = idx === Math.floor(rating) && rating % 1 >= 0.5; // sao nửa

                return (
                  <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={filled ? "gold" : half ? "url(#half-grad)" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500"
                  >
                    {/* Gradient để hiển thị sao nửa */}
                    {half && (
                      <defs>
                        <linearGradient id="half-grad">
                          <stop offset="50%" stopColor="gold" />
                          <stop
                            offset="50%"
                            stopColor="transparent"
                            stopOpacity="1"
                          />
                        </linearGradient>
                      </defs>
                    )}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </svg>
                );
              })}
            </div>
            {/* số trung bình */}
            <span className="ml-2 text-xs text-gray-600">
              {product?.rating?.average?.toFixed(1) || "0.0"}
            </span>
          </div>
          <hr className="my-2 border-t border-gray-300" />

          {/* Shop */}
          <div className="flex items-center justify-center gap-2">
            {product?.shop_id?.logo && (
              <img
                src={product.shop_id.logo}
                alt={product.shop_id.name}
                className="w-6 h-6 object-cover rounded-full"
              />
            )}
            <p className="text-xs font-bold text-gray-600">
              {product?.shop_id?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
