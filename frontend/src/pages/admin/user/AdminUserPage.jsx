import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ColAllPageSeller from "../../../components/seller/ColAllPageSeller";
import ToggleViewMode from "../../../components/admin/ToggleViewMode";
import CardView from "../../../components/admin/CardView";
import ExportButtons from "../../../components/seller/export/ExportButtons";
// -----------------------GRAPQL-----------------------
const USERS_QUERY = gql`
  query AllUsersQ {
    users {
      _id
      isActive
      fullName
      avatar
      email
      role
      createdAt
    }
  }
`;
// -----------------------GRAPQL-----------------------
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Khoá" },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

export default function AdminUserPage() {
  const { data, loading } = useQuery(USERS_QUERY);
  const navigate = useNavigate();
  // Lọc chỉ lấy user có role là "user"
  const users = (data?.users || []).filter((u) => u.role === "user");
  const [viewMode, setViewMode] = useState("table");
  const [statusTab, setStatusTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // New state for items per page

  const statusCounts = users.reduce(
    (acc, u) => {
      acc.all += 1;
      if (u.isActive) acc.active += 1;
      else acc.inactive += 1;
      return acc;
    },
    { all: 0, active: 0, inactive: 0 }
  );

  const filteredUsers = users.filter((u) => {
    let match = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      match =
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
    }
    if (match && statusTab !== "all") {
      match = statusTab === "active" ? u.isActive : !u.isActive;
    }
    return match;
  });

  // Handle change in items per page
  const handleItemsPerPageChange = (e) => {
    const value =
      e.target.value === "all" ? filteredUsers.length : Number(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1 h-6 bg-green-300 rounded-sm inline-block" />
          <h1 className="text-2xl font-bold">Quản Lý Người Dùng</h1>
        </div>
        <div className="justify-between items-center mb-6">
          <ExportButtons
            data={filteredUsers}
            columns={[
              { key: "stt", label: "STT", render: (_, idx) => idx + 1 },
              { key: "fullName", label: "Họ và tên" },
              { key: "email", label: "Email" },
              { key: "role", label: "Vai trò" },
              {
                key: "isActive",
                label: "Trạng thái",
                render: (row) => (row.isActive ? "Hoạt động" : "Khoá"),
              },
              {
                key: "createdAt",
                label: "Ngày tạo",
                render: (row) => formatDate(row.createdAt),
              },
            ]}
            fileName="users_export"
            excelLabel="Excel"
            csvLabel="CSV"
            title="Admin | Quản Lý Người Dùng"
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`px-4 cursor-pointer py-2 rounded border transition-all text-base font-medium ${
                statusTab === opt.value
                  ? "bg-cyan-100 border-cyan-400 text-cyan-700"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => {
                setStatusTab(opt.value);
                setCurrentPage(1);
              }}
            >
              {opt.label}{" "}
              {opt.value === "inactive" ? (
                <span className="text-white rounded-full bg-red-500 font-bold text-[12px] w-[16px] h-[16px] inline-flex items-center content-center justify-center">
                  {statusCounts[opt.value] || 0}
                </span>
              ) : (
                <> ({statusCounts[opt.value] || 0})</>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-end items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email"
            className="border px-3 py-2 rounded w-1/2"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
          {" "}
          <div className="flex items-center gap-2 mb-3">
            <span>Số người dùng mỗi trang:</span>
            <select
              value={
                itemsPerPage === filteredUsers.length ? "all" : itemsPerPage
              }
              onChange={handleItemsPerPageChange}
              className="border cursor-pointer  px-2 py-1 rounded border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              {/* <option value={100}>100</option>
              <option value="all">Tất cả</option> */}
            </select>
          </div>
          <ToggleViewMode viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {/* <table className="border min-w-full divide-y divide-gray-200"> */}
          <table
            className={
              viewMode === "table"
                ? "border min-w-full divide-y divide-gray-200"
                : "hidden"
            }
          >
            <ColAllPageSeller type={"adminUser"} />
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    Không có tài khoản nào.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, idx) => (
                  <tr
                    key={user._id}
                    className={
                      idx % 2 !== 0
                        ? "bg-gray-100 hover:bg-gray-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {indexOfFirstUser + idx + 1}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {user.fullName}
                    </td>

                    <td className="px-2 py-4 border text-center border-gray-300">
                      <div className="w-12 h-12 mx-auto rounded-full border overflow-hidden">
                        <img
                          src={
                            user.avatar && user.avatar.trim() !== ""
                              ? user.avatar
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          alt={user.fullName || "avatar"}
                          className="w-12 h-12 object-cover rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.fullName || "User"
                            )}&background=0D8ABC&color=fff`;
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {user.email}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {user.role}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {user.isActive ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded whitespace-nowrap">
                          Khoá
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-2 py-4 border text-center border-gray-300">
                      <button
                        className="text-blue-600 cursor-pointer hover:text-blue-800 p-2 rounded-full"
                        title="Xem chi tiết"
                        onClick={() =>
                          navigate(`/admin/user/detail/${user._id}`)
                        }
                      >
                        <VisibilityIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className={viewMode === "card" ? "block" : "hidden"}>
            <CardView
              data={currentUsers}
              getImage={(u) => u.avatar}
              getTitle={(u) => u.fullName}
              onViewDetail={(u) => navigate(`/admin/user/detail/${u._id}`)}
              fields={[
                { label: "Email", key: "email" },
                { label: "Vai trò", key: "role" },
                {
                  label: "Trạng thái",
                  // render: (u) => (u.isActive ? "Hoạt động" : "Khoá"),
                  render: (u) =>
                    u.isActive ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded whitespace-nowrap">
                        Khoá
                      </span>
                    ),
                },
                { label: "Ngày tạo", render: (u) => formatDate(u.createdAt) },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}. Người dùng từ{" "}
            {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} trong
            tổng cộng {filteredUsers.length} người dùng
          </div>
          {totalPages > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                }`}
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Trang trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                }`}
              >
                Trang sau
                <i className="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
