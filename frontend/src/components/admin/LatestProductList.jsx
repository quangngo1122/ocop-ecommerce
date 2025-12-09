import VisibilityIcon from "@mui/icons-material/Visibility";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import React from "react";
import { useNavigate } from "react-router-dom";
const statusMap = {
  active: "Đang bán",
  draft: "Nháp",
  pending: "Chờ duyệt",
  suspended: "Tạm ngưng",
  deleted: "Đã xóa",
};
export default function LatestProductList({
  products = [],
  categoriesMap = {},
}) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#f7faf7] rounded-xl p-4 mt-8 mb-8 border border-[#e3e9e2]">
      <div className="flex items-center mb-2">
        <div className="bg-[#c8f0c1] rounded-full p-2 pb-3 mr-3">
          <span role="img" aria-label="inventory" className="text-2xl p-1">
            {/* <img src="/logo.jpg" alt="icon" className="w-6 h-6" /> */}
            <ShoppingCartIcon className="text-[green]" />
          </span>
        </div>
        <div>
          <div className="font-semibold text-lg">Sản phẩm mới nhất</div>
          <div className="text-gray-500 text-sm">
            10 Sản phẩm chờ duyệt gần nhất
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left ">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-2">Sản phẩm</th>
              <th className="py-2 px-2">Danh mục</th>
              {/* <th className="py-2 px-2 text-center">Shop</th> */}
              {products.some((p) => p?.shop_id) && (
                <th className="py-2 px-2 text-center">Shop</th>
              )}
              <th className="py-2 px-2">Tồn kho</th>
              <th className="py-2 px-2">Giá cao nhất</th>
              <th className="py-2 px-2">Giá thấp nhất</th>
              <th className="py-2 px-2">Trạng thái</th>
              <th className="py-2 px-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  Không có sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod._id} className="bg-white">
                  <td className="py-2 px-2 min-w-[240px]">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          prod.images && prod.images.length > 0
                            ? prod.images[0]
                            : "/logo.jpg"
                        }
                        alt={prod.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-800 line-clamp-2 break-words">
                          {prod.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {prod._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 ">
                    <div className="break-all min-w-[150px] text-center">
                      {prod?.category_id?.name || ""}
                    </div>
                    <div className="text-xs text-gray-400 break-all min-w-[150px] text-center">
                      {prod?.category_id?.parent?._id
                        ? "< " + categoriesMap[prod.category_id.parent._id] ||
                          "-NA-"
                        : "-NA-"}
                    </div>
                  </td>
                  {prod?.shop_id && (
                    <td
                      className="py-2 break-all min-w-[130px] px-2 text-center text-indigo-500 font-medium hover:underline cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/shop/detail/${prod?.shop_id?._id}`)
                      }
                    >
                      {prod?.shop_id?.name || "-"}
                    </td>
                  )}
                  <td className="py-2 px-2 text-center">
                    {prod?.stock || "0"}
                  </td>
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    {prod.price?.max_price?.toLocaleString("vi-VN") + " đ" || 0}
                  </td>
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    {prod.price?.min_price?.toLocaleString("vi-VN") + " đ" || 0}
                  </td>
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        prod.status === "active"
                          ? "bg-green-100 text-green-700"
                          : prod.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : prod.status === "suspended"
                          ? "bg-gray-100 text-gray-700"
                          : prod.status === "deleted"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {statusMap[prod.status]}
                    </span>
                  </td>
                  <td className="py-2 px-2 gap-3 text-center">
                    {prod?.shop_id ? (
                      <button
                        className="cursor-pointer rounded-full border border-[#b2c2b0] p-1 hover:bg-[#e3e9e2]"
                        title="View"
                        onClick={() =>
                          navigate(`/admin/product/detail/${prod._id}`)
                        }
                      >
                        <span role="img" aria-label="view">
                          <VisibilityIcon />
                        </span>
                      </button>
                    ) : (
                      <button
                        className="cursor-pointer rounded-full border border-[#b2c2b0] p-1 hover:bg-[#e3e9e2]"
                        title="View"
                        onClick={() =>
                          navigate(`/seller/products/edit/${prod._id}`)
                        }
                      >
                        <span role="img" aria-label="view">
                          <VisibilityIcon />
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
