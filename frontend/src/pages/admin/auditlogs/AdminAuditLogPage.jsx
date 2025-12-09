import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { Eye, Tag, Lock, Store, Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Giả lập dữ liệu audit log sản phẩm
const mockProductAuditLogs = [
  {
    id: "1",
    admin: { id: "a", fullName: "admin", email: "admin@email.com" },
    action_type: "product_create",
    product: { id: "1234561", name: "Áo thun nam" },
    createdAt: "2024-07-24T09:15:00Z",
  },
  {
    id: "2",
    admin: { id: "a", fullName: "admin", email: "admin@email.com" },
    action_type: "product_update",
    product: { id: "1234561", name: "Áo thun nam" },
    createdAt: "2024-07-25T10:00:00Z",
  },
  {
    id: "3",
    admin: { id: "a", fullName: "admin", email: "admin@email.com" },
    action_type: "product_delete",
    product: { id: "1234562", name: "Quần jean nữ" },
    createdAt: "2024-07-26T11:30:00Z",
  },
  {
    id: "4",
    admin: { id: "a", fullName: "admin", email: "admin@email.com" },
    action_type: "product_status_update",
    product: { id: "1234563", name: "Giày thể thao" },
    createdAt: "2024-07-27T12:45:00Z",
  },
  {
    id: "5",
    admin: { id: "a", fullName: "admin", email: "admin@email.com" },
    action_type: "variant_update",
    product: { id: "1234561", name: "Áo thun nam" },
    createdAt: "2024-07-28T13:20:00Z",
  },
];

// Map action_type sang nhãn và icon
const actionTypeMap = {
  product_create: {
    label: "Tạo sản phẩm",
    icon: <Plus className="w-4 h-4 text-green-500" />,
  },
  product_update: {
    label: "Cập nhật sản phẩm",
    icon: <Edit className="w-4 h-4 text-blue-500" />,
  },
  product_delete: {
    label: "Xóa sản phẩm",
    icon: <Trash2 className="w-4 h-4 text-red-500" />,
  },
  product_status_update: {
    label: "Đổi trạng thái sản phẩm",
    icon: <Tag className="w-4 h-4 text-yellow-500" />,
  },
  variant_create: {
    label: "Tạo biến thể",
    icon: <Plus className="w-4 h-4 text-green-500" />,
  },
  variant_update: {
    label: "Cập nhật biến thể",
    icon: <Edit className="w-4 h-4 text-blue-500" />,
  },
};

export default function AdminAuditLogPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const navigate = useNavigate();

  // Lọc dữ liệu
  const filteredLogs = useMemo(() => {
    return mockProductAuditLogs.filter((log) => {
      const matchSearch =
        !search ||
        log.product.name.toLowerCase().includes(search.toLowerCase()) ||
        log.admin.fullName.toLowerCase().includes(search.toLowerCase());
      const matchAction = !actionFilter || log.action_type === actionFilter;
      return matchSearch && matchAction;
    });
  }, [search, actionFilter]);

  // Phân trang
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLast = currentPage * logsPerPage;
  const indexOfFirst = indexOfLast - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);

  // Lấy options action
  const actionOptions = useMemo(
    () => [
      { value: "", label: "Tất cả" },
      ...Object.entries(actionTypeMap).map(([value, { label }]) => ({
        value,
        label,
      })),
    ],
    []
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-8 bg-blue-600 rounded-sm" />
        <h1 className="text-3xl font-semibold text-gray-800">
          Nhật Ký Hành Động
        </h1>
      </div> */}
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-teal-300 rounded-sm inline-block" />
        <h1 className="text-2xl font-bold ">Nhật Ký Hành Động</h1>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm hoặc admin..."
          className="px-4 py-2 border border-gray-300 rounded-lg min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg min-w-[180px]"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          {actionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border border-gray-200">STT</th>
              <th className="px-3 py-2 border border-gray-200">Thời gian</th>
              <th className="px-3 py-2 border border-gray-200">Sản phẩm</th>
              <th className="px-3 py-2 border border-gray-200">Sản phẩm</th>
              <th className="px-3 py-2 border border-gray-200">Hành động</th>
              {/* <th className="px-3 py-2 border border-gray-200">
                Quản trị viên
              </th> */}
              <th className="px-3 py-2 border border-gray-200">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Không có nhật ký nào.
                </td>
              </tr>
            ) : (
              currentLogs.map((log, idx) => (
                <tr key={log.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="px-3 py-2 border border-gray-200 text-center">
                    {indexOfFirst + idx + 1}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-center">
                    {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    {log.product.id}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    {log.product.name}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 ">
                    <div className="flex  items-center gap-2">
                      {actionTypeMap[log.action_type]?.icon}
                      {actionTypeMap[log.action_type]?.label || log.action_type}
                    </div>
                  </td>
                  {/* <td className="px-3 py-2 border border-gray-200">
                    {log.admin.fullName}
                  </td> */}
                  <td className="px-3 py-2 border border-gray-200 text-center">
                    <button
                      className="p-2 rounded hover:bg-blue-100"
                      title="Xem chi tiết thay đổi"
                      onClick={() => navigate(`/admin/audit-log/${log.id}`)}
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-100 text-gray-600"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-100 text-gray-600"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
