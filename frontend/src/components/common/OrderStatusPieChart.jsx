import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
export default function OrderStatusPieChart({
  data,
  title,
  expanded,
  onToggleExpand,
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800 ">{title}</h2>
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
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              // label={({ name, percent }) =>
              //   `${name}: ${(percent * 100).toFixed(0)}%`
              // }
              label={({ name, percent, value }) =>
                value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
              }
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
