import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../../contexts/ToastProvider";

// -----------------------GRAPQL-----------------------
const USER_QUERY = gql`
  query OnlyUserQ($id: ID!) {
    user(_id: $id) {
      avatar
      email
      phoneNumber
      isActive
      _id
      gender
      fullName
      role
      address {
        district
        province
        ward
        isDefault
        address
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(_id: $id, input: $input) {
      _id
      isActive
      role
    }
  }
`;

const roleOptions = [
  // { value: "admin", label: "Admin" },
  { value: "seller", label: "Seller" },
  { value: "user", label: "User" },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
}

export default function AdminDetailUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, loading, error, refetch } = useQuery(USER_QUERY, {
    variables: { id: id },
    fetchPolicy: "network-only",
  });
  const user = data?.user;

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(null);
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    if (user) {
      setEditRole(user.role);
      setEditActive(user.isActive);
    }
  }, [user]);

  if (loading)
    return (
      // <div className="fixed inset-0 bg-black/10 backdrop-blur-sm p-6 flex justify-center items-center h-screen z-50">
      //   <div className="flex flex-col items-center">
      //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      //     <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
      //   </div>
      // </div>
      <div className="relative ">
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
      // <div className="p-6">Đang tải dữ liệu...</div>;
    );
  if (error)
    return <div className="p-6 text-red-500">Lỗi: {error.message}</div>;
  if (!user) return <div className="p-6">Không tìm thấy người dùng.</div>;

  const handleUpdate = async () => {
    try {
      await updateUser({
        variables: {
          id: user._id,
          input: {
            role: editRole,
            isActive: editActive,
          },
        },
      });
      setMessage("Cập nhật thành công!");
      showToast("Cập nhật thành công!", "success");
      refetch();
    } catch (err) {
      setMessage("Cập nhật thất bại: " + err.message);
      showToast("Cập nhật thất bại: " + err.message, "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8 mb-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 cursor-pointer  text-blue-600 font-semibold hover:underline"
      >
        ← Quay lại
      </button>
      <h1 className="text-2xl font-bold mb-4">
        Chi tiết người dùng: {user.fullName}
        {/* Chi tiết {user.role}: {user.fullName} */}
      </h1>
      <div className="flex gap-6 mb-6 items-center">
        {/* <div className="mx-8">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-24 h-24 object-cover rounded-full border shadow"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400 rounded-full">
              No Avatar
            </div>
          )}
        </div> */}

        <div className="mx-8">
          <img
            src={
              user.avatar && user.avatar.trim() !== ""
                ? user.avatar
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={user.fullName || "avatar"}
            className="w-24 h-24 object-cover rounded-full border shadow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.fullName || "User"
              )}&background=0D8ABC&color=fff`;
            }}
          />
        </div>

        <div className="flex-1 my-2 grid grid-cols-1 gap-x-6  gap-y-2 w-full bg-gray-100 p-6">
          {/* <div className="flex-1"> */}
          <div className="mb-2">
            <b>ID:</b> {user._id}
          </div>
          <div className="mb-2">
            <b>Họ tên:</b>{" "}
            {user.fullName || (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Email:</b>{" "}
            {user.email || (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Số điện thoại:</b>{" "}
            {user.phoneNumber ? (
              user.phoneNumber
            ) : (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Giới tính:</b>{" "}
            {/* {user.gender || (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )} */}
            {user.gender === "male" ? (
              "Nam"
            ) : user.gender === "female" ? (
              "Nữ"
            ) : (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Vai trò:</b> {user.role}
          </div>
          <div className="mb-2">
            <b>Trạng thái:</b>{" "}
            {user.isActive ? (
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded">
                Hoạt động
              </span>
            ) : (
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                Khoá
              </span>
            )}
          </div>
          <div className="mb-2">
            <b>Ngày tạo:</b> {formatDate(user.createdAt)}
          </div>
          <div className="mb-2">
            <b>Ngày cập nhật:</b> {formatDate(user.updatedAt)}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <b>Địa chỉ:</b>
        {user.address && user.address.length > 0 ? (
          <ul className="list-disc ml-6">
            {user.address.map((addr, idx) => (
              <li
                key={idx}
                className={addr.isDefault ? "font-bold text-blue-700" : ""}
              >
                {/* {addr.address}, {addr.ward}, {addr.district}, {addr.province} */}
                {addr.ward}, {addr.district}, {addr.province}
                {addr.isDefault && (
                  <span className="ml-2 text-xs text-blue-600">(Mặc định)</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <span className="italic text-gray-400">(Chưa cập nhật địa chỉ)</span>
        )}
      </div>
      {/* // ------------------- */}
      {user.role !== "admin" && (
        // -------------------
        <>
          <div className="font-bold mb-2">Cập nhật trạng thái:</div>
          <div className="mb-6 p-4 pt-2 bg-gray-50 rounded-lg border border-gray-400">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Trạng thái:
                </label>
                <select
                  className=" hover:border-blue-400 cursor-pointer border px-3 py-2 rounded min-w-[120px]"
                  value={editActive === true ? "active" : "inactive"}
                  onChange={(e) => setEditActive(e.target.value === "active")}
                  disabled={updating}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Khoá</option>
                </select>
              </div>
              <button
                onClick={handleUpdate}
                className=" cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-6"
                disabled={
                  updating ||
                  (editRole === user.role && editActive === user.isActive)
                }
              >
                {updating ? "Đang lưu..." : "Lưu"}
              </button>
              {message && (
                <span className="ml-2 text-green-600 mt-6">{message}</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
