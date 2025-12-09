import React from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
export default function RatingChart({
  average,
  roundedUp,
  total,
  percentages,
  expanded,
  onToggleExpand,
}) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-lg ${
        expanded ? "h-auto" : "h-26"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex float-left">
          <h2 className="text-lg font-semibold mr-2">Tỉ lệ đánh giá</h2>
        </div>
        {/* <button
          onClick={onToggleExpand}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          {expanded ? "-" : "+"}
        </button> */}
        <button
          onClick={onToggleExpand}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          {expanded ? (
            <span className="w-5 h-5">
              <RemoveIcon />
            </span>
          ) : (
            <span className="w-5 h-5">
              <AddIcon />
            </span>
          )}
        </button>
      </div>
      {expanded && (
        <div className="lg:h-[300px]">
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, index) => {
              const isFull = index < roundedUp;
              return (
                <svg
                  key={index}
                  className={`w-4 h-4 mr-1 ${
                    isFull ? "text-yellow-300" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 22 20"
                >
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
              );
            })}
            <p className="ms-1 text-sm font-medium text-gray-500">{average}</p>
            <p className="ms-1 text-sm font-medium text-gray-500">trên</p>
            <p className="ms-1 text-sm font-medium text-gray-500">5</p>
          </div>
          <p className="text-sm font-medium text-gray-500">
            {total.toLocaleString()} tổng đánh giá
          </p>
          {percentages
            .sort((a, b) => b.star - a.star)
            .map(({ star, percent }) => (
              <div key={star} className="flex items-center mt-5">
                <span className="text-sm font-medium text-blue-600">
                  {star} star
                </span>
                <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded-sm">
                  <div
                    className="h-5 bg-yellow-300 rounded-sm"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {percent}%
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
