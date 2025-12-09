import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

export default function RevenueChart({
  data,
  chartType,
  onChartTypeChange,
  title,
  expanded,
  onToggleExpand,
}) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-lg ${
        expanded ? "h-auto" : "h-26"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onChartTypeChange("daily")}
            className={`cursor-pointer px-4 py-2 rounded ${
              chartType === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Theo Ngày
          </button>
          <button
            onClick={() => onChartTypeChange("monthly")}
            className={`cursor-pointer px-4 py-2 rounded ${
              chartType === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Theo Tháng
          </button>
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
      </div>
      {expanded && (
        <div className="h-[300px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartType === "daily" ? "date" : "month"} />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value)
                }
              />
              <Legend />
              <Bar dataKey="total" name="Doanh Thu" fill="#00CAFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
