import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../../contexts/ToastProvider";
// -----------------------GRAPHQL-----------------------
// Query lấy thông tin seller
const SELLER_QUERY = gql`
  query SellerQ($id: ID!) {
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

// Query lấy tất cả shop
const SHOPS_QUERY = gql`
  query Shops {
    shops {
      items {
        _id
        logo
        name
        owner {
          _id
          fullName
        }
        status
        createdAt
      }
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
// -----------------------GRAPHQL-----------------------
const roleOptions = [
  { value: "seller", label: "Seller" },
  { value: "user", label: "User" },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
}

const shopStatusMap = {
  active: { label: "Hoạt động", color: "bg-green-100 text-green-800" },
  pending: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
  suspended: { label: "Bị cấm", color: "bg-red-100 text-red-800" },
  closed: { label: "Đã đóng", color: "bg-gray-100 text-gray-800" },
  locked: { label: "Đã khóa", color: "bg-blue-100 text-blue-800" },
};

export default function AdminSellerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Query seller info
  const { data, loading, error, refetch } = useQuery(SELLER_QUERY, {
    variables: { id: id },
    fetchPolicy: "network-only",
  });
  const seller = data?.user;

  // Query all shops
  const { data: shopsData, loading: loadingShops } = useQuery(SHOPS_QUERY, {
    fetchPolicy: "network-only",
  });
  const allShops = shopsData?.shops?.items || [];
  // Lọc shop của seller này
  const sellerShops = allShops.filter((shop) => shop.owner?._id === id);

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(null);
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    if (seller) {
      setEditRole(seller.role);
      setEditActive(seller.isActive);
    }
  }, [seller]);

  if (loading || loadingShops)
    return (
      <div className="relative ">
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  if (error)
    return <div className="p-6 text-red-500">Lỗi: {error.message}</div>;
  if (!seller) return <div className="p-6">Không tìm thấy người bán.</div>;

  const handleUpdate = async () => {
    try {
      await updateUser({
        variables: {
          id: seller._id,
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
        Chi tiết người bán: {seller.fullName}
      </h1>
      <div className="flex gap-6 mb-6 items-center">
        {/* <div className="mx-8">
          {seller.avatar ? (
            <img
              src={seller.avatar}
              alt={seller.fullName}
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
              seller.avatar && seller.avatar.trim() !== ""
                ? seller.avatar
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={seller.fullName || "avatar"}
            className="w-24 h-24 object-cover rounded-full border shadow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                seller.fullName || "seller"
              )}&background=0D8ABC&color=fff`;
            }}
          />
        </div>
        {/* <div className="flex-1"> */}
        <div className="flex-1 my-2 grid grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-2 gap-y-2 w-full rounded-lg bg-gray-100 p-6">
          <div className="mb-2">
            <b>ID:</b> {seller._id}
          </div>
          <div className="mb-2">
            <b>Họ tên:</b>{" "}
            {seller.fullName || (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Email:</b>{" "}
            {seller.email || (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Số điện thoại:</b>{" "}
            {seller.phoneNumber || (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Giới tính:</b>{" "}
            {/* {seller.gender || (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )} */}
            {seller.gender === "male" ? (
              "Nam"
            ) : seller.gender === "female" ? (
              "Nữ"
            ) : (
              <span className="italic text-gray-400">(Chưa cập nhật)</span>
            )}
          </div>
          <div className="mb-2">
            <b>Vai trò:</b> {seller.role}
          </div>
          <div className="mb-2">
            <b>Trạng thái:</b>{" "}
            {seller.isActive ? (
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
            <b>Ngày tạo:</b> {formatDate(seller.createdAt)}
          </div>
          <div className="mb-2">
            <b>Ngày cập nhật:</b> {formatDate(seller.updatedAt)}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <b>Địa chỉ:</b>
        {seller.address && seller.address.length > 0 ? (
          <ul className="list-disc ml-6">
            {seller.address.map((addr, idx) => (
              <li
                key={idx}
                className={addr.isDefault ? "font-bold text-blue-700" : ""}
              >
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
      <div className="font-bold mb-2">Cập trạng thái người bán:</div>
      <div className="mb-6 p-4 pt-2 bg-gray-50 rounded-lg border border-gray-400">
        <div className="flex flex-wrap gap-4 items-center">
          {/* <div>
            <label className="block text-sm font-medium mb-1">Quyền</label>
            <select
              className="  hover:border-blue-400 cursor-pointer border px-3 py-2 rounded min-w-[120px]"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              disabled={updating}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div> */}
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              className="  hover:border-blue-400 cursor-pointer border px-3 py-2 rounded min-w-[120px]"
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
              (editRole === seller.role && editActive === seller.isActive)
            }
          >
            {updating ? "Đang lưu..." : "Lưu"}
          </button>
          {message && (
            <span className="ml-2 text-green-600 mt-6">{message}</span>
          )}
        </div>
      </div>

      {/* Hiển thị shop của seller */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Shop của người bán</h2>
        {sellerShops.length === 0 ? (
          <div className="text-gray-500 italic">
            Người bán này chưa có shop nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border border-gray-400">ID</th>
                  {/* <th className="px-4 py-2 border border-gray-400">Logo</th> */}
                  <th className="px-4 py-2 border border-gray-400">Tên shop</th>
                  {/* <th className="px-4 py-2 border border-gray-400">Chủ shop</th> */}
                  <th className="px-4 py-2 border border-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-4 py-2 border border-gray-400">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {sellerShops.map((shop) => (
                  <tr
                    key={shop._id}
                    className="border border-gray-400 text-center hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 border border-gray-400">
                      {shop._id}
                    </td>
                    {/* <td className="px-4 py-2 border border-gray-400">
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="w-12 h-12 object-cover rounded "
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded border border-gray-400">
                          No Logo
                        </div>
                      )}
                    </td> */}
                    <td className=" px-2 py-4 border border-gray-400 text-center">
                      <button
                        onClick={() =>
                          navigate(`/admin/shop/detail/${shop?._id}`)
                        }
                        className="cursor-pointer text-indigo-500 font-bold hover:underline"
                      >
                        {shop.name}
                      </button>
                    </td>
                    {/* <td className="px-4 py-2 border border-gray-400 font-semibold">
                      <a
                        href={`/admin/shop/detail/${shop._id}`}
                        className="text-indigo-500 font-bold hover:underline"
                      >
                        {shop.name}
                      </a>
                    </td> */}
                    {/* <td className="px-4 py-2 border border-gray-400">{shop.owner?.fullName}</td> */}
                    <td className="whitespace-nowrap px-4 py-2 border border-gray-400">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          shopStatusMap[shop.status]?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {shopStatusMap[shop.status]?.label || shop.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-gray-400">
                      {formatDate(shop.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
