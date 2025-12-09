import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
];

export default function BestSellingProductsChart({
  data,
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
        <h2 className="text-lg font-semibold">Sản phẩm bán chạy nhất</h2>
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
        <div className="h-[300px] flex">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => ` ${percent}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} sản phẩm`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/3 pl-4 overflow-y-auto">
            {data.map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <div
                  style={{
                    width: "15px",
                    height: "15px",
                    backgroundColor: COLORS[index % COLORS.length],
                    marginRight: "8px",
                  }}
                ></div>
                <span className="text-sm">
                  {item.name.length > 20
                    ? item.name.slice(0, 20) + "..."
                    : item.name}{" "}
                  ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
