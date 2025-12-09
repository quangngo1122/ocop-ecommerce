import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";

const GET_BANNERS = gql`
  query Banners {
    banners {
      items {
        image
        status
      }
    }
  }
`;

export function BannerSlider({ scrollToProducts }) {
  const [banners, setBanners] = useState([]);
  const { data, loading } = useQuery(GET_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (data?.banners?.items) {
      setBanners(data.banners.items.filter((b) => b.status === "active"));
    }
  }, [data]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  if (loading || !banners.length) {
    return (
      <div className="flex items-center justify-center w-full h-[300px]">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner hiển thị */}
      <img
        src={banners[currentIndex]?.image}
        alt={`Banner ${currentIndex}`}
        className="w-full h-full object-cover"
      />

      {/* Overlay & nút Mua sắm */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
        <button
          onClick={scrollToProducts}
          className="bg-[#5aa32a] cursor-pointer text-[12px] md:text-sm text-white font-bold py-2 md:py-3 px-4 md:px-8 rounded-full hover:bg-[#4a8922] transition duration-300"
        >
          Mua sắm ngay
        </button>
      </div>

      {/* Nút Previous */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full transition-colors duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="white"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* Nút Next */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full transition-colors duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="white"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white scale-125"
                : "bg-white/50 scale-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
