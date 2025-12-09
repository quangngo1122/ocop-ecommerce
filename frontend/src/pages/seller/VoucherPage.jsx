import React, { useState, useContext, useEffect, useMemo } from "react";
import { AuthContext } from "../../contexts/AuthProvider";
import dayjs from "dayjs";
import VoucherModal from "../../components/seller/VoucherModal.jsx";
import ColAllPageSeller from "../../components/seller/ColAllPageSeller.jsx";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { gql, useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { useToast } from "../../contexts/ToastProvider";

// ------------- GraphQL  -------------
const CREATE_VOUCHER = gql`
  mutation CreateVoucher($input: CreateVoucherInput!) {
    createVoucher(input: $input) {
      _id
      code
      description
      type
      value
      max_discount_amount
      min_order_value
      start_date
      end_date
      usage_limit
      usage_limit_per_user
      status
    }
  }
`;

const GET_VOUCHERS = gql`
  query Query($shopId: ID!) {
    shopVouchers(shopId: $shopId) {
      items {
        _id
        code
        description
        type
        max_discount_amount
        min_order_value
        value
        status
        usage_limit
        usage_count
        usage_limit_per_user
        start_date
        end_date
      }
    }
  }
`;

const GET_VOUCHER_BY_ID = gql`
  query Voucher($id: ID!) {
    voucher(_id: $id) {
      _id
      code
      description
      type
      value
      max_discount_amount
      min_order_value
      start_date
      end_date
      status
      usage_count
      usage_limit_per_user
      usage_limit
    }
  }
`;

const UPDATE_VOUCHER = gql`
  mutation UpdateVoucher($id: ID!, $input: UpdateVoucherInput!) {
    updateVoucher(_id: $id, input: $input) {
      _id
    }
  }
`;

const DELETE_VOUCHER = gql`
  mutation DeleteVoucher($id: ID!) {
    deleteVoucher(_id: $id)
  }
`;
// ------------- END -------------
export default function VoucherList() {
  const { shopData } = useContext(AuthContext);
  const [vouchers, setVouchers] = useState([]);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    max_discount_amount: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    usage_limit_per_user: "",
    status: "active",
  });

  // state lọc + tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { showToast } = useToast();
  const [createVoucher] = useMutation(CREATE_VOUCHER);
  const [updateVoucher] = useMutation(UPDATE_VOUCHER);
  const [deleteVoucher] = useMutation(DELETE_VOUCHER);

  const [loadDetailVoucher, { data: getVoucherById }] = useLazyQuery(
    GET_VOUCHER_BY_ID,
    {
      fetchPolicy: "network-only",
      onCompleted: () => {
        setOpenModal(true);
      },
    }
  );

  const { data: queryDataVouchers, refetch } = useQuery(GET_VOUCHERS, {
    variables: { shopId: shopData?._id },
  });

  useEffect(() => {
    if (queryDataVouchers) {
      setVouchers(queryDataVouchers?.shopVouchers?.items);
    }
  }, [queryDataVouchers]);

  // ----------------- HANDLE -----------------
  const handleDelete = async (voucherId) => {
    if (!voucherId) return;
    try {
      await deleteVoucher({
        variables: { id: String(voucherId) },
      });
      showToast("Xóa voucher thành công!", "success");
      await refetch();
    } catch (err) {
      showToast(err.message || "Xóa voucher thất bại!", "error");
    }
  };

  const handleSubmit = async (data) => {
    try {
      const input = {
        code: data.code,
        description: data.description,
        type: data.type === "percentage" ? "percentage" : "fixed_amount",
        value: Number(data.value),
        max_discount_amount: Number(data.max_discount_amount) || 0,
        min_order_value: Number(data.min_order_value) || 0,
        start_date: data.start_date,
        end_date: data.end_date,
        usage_limit: Number(data.usage_limit),
        usage_limit_per_user: Number(data.usage_limit_per_user),
      };

      const res = await createVoucher({ variables: { input } });

      if (res?.data?.createVoucher) {
        const v = res.data.createVoucher;
        setVouchers((vs) => [...vs, v]);
        setOpenModal(false);
        refetch();
        showToast("Tạo voucher thành công!", "success");
      }
    } catch (err) {
      showToast(err.message || "Tạo voucher thất bại!", "error");
    }
  };

  const handleUpdate = async (voucherId) => {
    try {
      const input = {
        description: form.description,
        value: Number(form.value),
        max_discount_amount: Number(form.max_discount_amount) || 0,
        min_order_value: Number(form.min_order_value) || 0,
        start_date: form.start_date,
        end_date: form.end_date,
        usage_limit: Number(form.usage_limit),
        usage_limit_per_user: Number(form.usage_limit_per_user),
        status: form.status, // 👈 phải gửi kèm
      };

      const res = await updateVoucher({
        variables: { id: voucherId, input },
      });

      if (res?.data?.updateVoucher) {
        showToast("Cập nhật voucher thành công!", "success");
        refetch();
        setOpenModal(false);
      }
    } catch (err) {
      showToast(err.message || "Cập nhật voucher thất bại!", "error");
    }
  };

  useEffect(() => {
    const voucher = getVoucherById?.voucher;
    if (!voucher) return;

    setForm({
      code: voucher.code || "",
      description: voucher.description || "",
      type: voucher.type === "percentage" ? "percentage" : "fixed_amount",
      value: voucher.value || "",
      max_discount_amount: voucher.max_discount_amount || "",
      min_order_value: voucher.min_order_value || "",
      start_date: voucher.start_date
        ? dayjs(voucher.start_date).format("YYYY-MM-DD")
        : "",
      end_date: voucher.end_date
        ? dayjs(voucher.end_date).format("YYYY-MM-DD")
        : "",
      usage_limit: voucher.usage_limit || "",
      usage_limit_per_user: voucher.usage_limit_per_user || "",
      status: voucher.status || "active",
    });
  }, [getVoucherById]);

  // ----------------- FILTER + SEARCH -----------------
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch =
        v.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vouchers, searchTerm, statusFilter]);
  console.log(filteredVouchers);
  // ----------------- RENDER -----------------
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold mb-4">Quản Lý Voucher</h2>
        <button
          className="bg-[#5aa32a] cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
          onClick={() => {
            setForm({
              code: "",
              description: "",
              type: "percentage",
              value: "",
              max_discount_amount: "",
              min_order_value: "",
              start_date: "",
              end_date: "",
              usage_limit: "",
              usage_limit_per_user: "",
              status: "active",
            });
            setOpenModal(true);
          }}
        >
          + Thêm Voucher
        </button>
      </div>

      {/* Thanh tìm kiếm & lọc */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hoặc mô tả..."
          className="border rounded-lg px-4 py-2 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border rounded-lg px-4 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="paused">Ngừng hoạt động</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <ColAllPageSeller type="voucher" />
            <tbody className="divide-y divide-gray-200">
              {filteredVouchers?.map((v) => (
                <tr
                  key={v._id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="border px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {v.code}
                  </td>
                  <td className="border px-4 py-3 text-sm text-gray-600">
                    {v?.description ? v.description : "Không có mô tả"}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {v?.type === "percentage"
                      ? "Phần trăm"
                      : v?.type === "fixed_amount"
                      ? "Số tiền cố định"
                      : "Không xác định"}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {v?.value}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {v?.max_discount_amount} đ
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {v?.min_order_value} đ
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {dayjs(v.start_date).format("DD/MM/YYYY")}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {dayjs(v.end_date).format("DD/MM/YYYY")}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {v?.usage_limit}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {v?.usage_count}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm text-gray-600">
                    {v?.usage_limit_per_user}
                  </td>
                  <td className="border px-4 py-3 text-center text-sm">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        v.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="border px-4 py-3 text-center text-sm">
                    <div className="flex justify-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={async () => {
                          setLoadingEdit(true);
                          try {
                            const { data } = await loadDetailVoucher({
                              variables: { id: v?._id },
                              fetchPolicy: "network-only",
                            });
                            setForm(data?.voucher);

                            setOpenModal(true);
                          } finally {
                            setLoadingEdit(false);
                          }
                        }}
                        disabled={loadingEdit}
                      >
                        {loadingEdit ? (
                          <span className="animate-spin border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4"></span>
                        ) : (
                          <DriveFileRenameOutlineIcon />
                        )}
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(v?._id)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVouchers.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-8 text-gray-500 text-sm"
                  >
                    Không có voucher nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VoucherModal
        onSubmit={handleSubmit}
        handleUpdate={() => handleUpdate(getVoucherById?.voucher?._id)}
        open={openModal}
        setOpen={setOpenModal}
        form={form}
        setForm={setForm}
        loadDetailVoucher={loadDetailVoucher}
      />
    </div>
  );
}
