import GridOnIcon from "@mui/icons-material/GridOn";
import TableRowsIcon from "@mui/icons-material/TableRows";
import GridViewIcon from "@mui/icons-material/GridView";

export default function ToggleViewMode({ viewMode, setViewMode }) {
  return (
    <div className="text-right gap-2 hidden md:table w-full mb-3">
      <button
        onClick={() => setViewMode("table")}
        className={`px-4 py-2 rounded-lg border mr-1 ${
          viewMode === "table"
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50"
        } transition-colors cursor-pointer`}
      >
        <GridOnIcon />
      </button>
      <button
        onClick={() => setViewMode("card")}
        className={`px-4 py-2 rounded-lg border ${
          viewMode === "card"
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50"
        } transition-colors cursor-pointer`}
      >
        <GridViewIcon />
      </button>
    </div>
  );
}
