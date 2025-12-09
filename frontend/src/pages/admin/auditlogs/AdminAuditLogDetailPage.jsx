import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

// giả lập dữ liệu thêm sản phẩm trong database
const mockAuditLog = {
  _id: { $oid: "6887cf738901e74faac3e823" },
  product_id: { $oid: "6887cf718901e74faac3e81b" },
  action_type: "product_create",
  changes: [
    {
      field: "_id",
      old_value: null,
      new_value: { $oid: "6887cf718901e74faac3e81b" },
    },
    {
      field: "name",
      old_value: null,
      new_value: "Mật Ong Rừng",
    },
    {
      field: "slug",
      old_value: null,
      new_value: "mat-ong-rung",
    },
    {
      field: "shop_id",
      old_value: null,
      new_value: { $oid: "685527fc7c8c57aa30ef572e" },
    },
    {
      field: "category_id",
      old_value: null,
      new_value: { $oid: "6864c5759155ec0a25a8012d" },
    },
    {
      field: "description",
      old_value: null,
      new_value: { short: "1234", full: "1234" },
    },
    {
      field: "images",
      old_value: null,
      new_value: [
        "https://res.cloudinary.com/dtexmphc4/image/upload/v1753730930/OCOP-ECOMMERCE/olmeegfgwnk36tmgv2gs.png",
      ],
    },
    {
      field: "price",
      old_value: null,
      new_value: { regular: 1234, sale: null },
    },
    {
      field: "specifications",
      old_value: null,
      new_value: [{ name: "1234", value: "1234" }],
    },
    {
      field: "rating",
      old_value: null,
      new_value: { average: 0, count: 0 },
    },
    {
      field: "status",
      old_value: null,
      new_value: "draft",
    },
    {
      field: "stock",
      old_value: null,
      new_value: 0,
    },
    {
      field: "createdAt",
      old_value: null,
      new_value: { $date: "2025-07-28T19:28:49.958Z" },
    },
    {
      field: "updatedAt",
      old_value: null,
      new_value: { $date: "2025-07-28T19:28:49.958Z" },
    },
    {
      field: "__v",
      old_value: null,
      new_value: 0,
    },
  ],
  createdAt: { $date: "2025-07-28T19:28:51.482Z" },
  updatedAt: { $date: "2025-07-28T19:28:51.482Z" },
  __v: 0,
};

function renderValue(val) {
  if (val === null || val === undefined)
    return <span className="text-gray-400 italic">null</span>;
  if (
    typeof val === "string" ||
    typeof val === "number" ||
    typeof val === "boolean"
  )
    return <span className="text-gray-700">{String(val)}</span>;
  if (Array.isArray(val)) {
    if (
      val.length > 0 &&
      typeof val[0] === "string" &&
      val[0].startsWith("http")
    ) {
      return (
        <div className="flex gap-2 flex-wrap">
          {val.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`img-${idx}`}
              className="w-20 h-20 object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform duration-200"
            />
          ))}
        </div>
      );
    }
    return (
      <ul className="list-disc pl-5 text-sm text-gray-700">
        {val.map((item, idx) => (
          <li key={idx}>
            {typeof item === "object"
              ? Object.entries(item)
                  .filter(([k]) => k !== "_id")
                  .map(([k, v]) => (
                    <span key={k} className="mr-3">
                      <b className="font-medium">{k}:</b>{" "}
                      {v === null ? (
                        <span className="text-gray-400 italic">null</span>
                      ) : (
                        String(v)
                      )}
                    </span>
                  ))
              : String(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (val.$oid)
    return <span className="text-blue-600 font-mono">{val.$oid}</span>;
  if (val.$date)
    return (
      <span className="text-gray-700">
        {dayjs(val.$date).format("DD/MM/YYYY HH:mm:ss")}
      </span>
    );
  // Handle nested objects (e.g., price, description)
  if (typeof val === "object") {
    return (
      <div className="space-y-1">
        {Object.entries(val).map(([key, value]) => (
          <div key={key} className="flex gap-2 text-sm text-gray-700">
            <span className="font-medium capitalize">{key}:</span>
            <span>
              {value === null ? (
                <span className="text-gray-400 italic">null</span>
              ) : (
                String(value)
              )}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <pre className="bg-gray-50 rounded-md p-3 text-xs text-gray-700 font-mono">
      {JSON.stringify(val, null, 2)}
    </pre>
  );
}

const actionTypeMap = {
  product_create: "Tạo sản phẩm",
  product_update: "Cập nhật sản phẩm",
  product_delete: "Xóa sản phẩm",
  product_status_update: "Đổi trạng thái sản phẩm",
  variant_create: "Tạo biến thể",
  variant_update: "Cập nhật biến thể",
};

export default function AdminAuditLogDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      try {
        setLog(mockAuditLog);
        setIsLoading(false);
      } catch (err) {
        setError("Không thể tải nhật ký hành động");
        setIsLoading(false);
      }
    }, 500);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto flex items-center gap-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
              onClick={() => navigate(-1)}
              title="Quay lại"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết nhật ký hành động
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin chung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Thời gian:</span>{" "}
                <span className="text-gray-900">
                  {dayjs(log.createdAt?.$date || log.createdAt).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Loại hành động:
                </span>{" "}
                <span className="text-gray-900">
                  {actionTypeMap[log.action_type] || log.action_type}
                </span>
                <span className="text-gray-900"> ({log.action_type})</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Product ID:</span>{" "}
                <span className="text-blue-600 font-mono">
                  {log.product_id?.$oid || log.product_id}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Chi tiết thay đổi
            </h2>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 pr-0 py-4  border border-gray-300 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Trường
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Giá trị cũ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Giá trị mới
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {log.changes.map((change, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-100 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 pr-0  text-sm  border border-gray-300 font-semibold text-gray-900">
                        {change.field}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {renderValue(change.old_value)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {renderValue(change.new_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
