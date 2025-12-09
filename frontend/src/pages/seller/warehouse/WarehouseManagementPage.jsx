import React, { useState, useContext, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { AuthContext } from "../../../contexts/AuthProvider";

// GraphQL query lấy sản phẩm của shop
const GET_PRODUCTS = gql`
  query User($pagination: PaginationInput, $filter: ProductFilter) {
    products(pagination: $pagination, filter: $filter) {
      items {
        _id
        name
        slug
        status
        images
        description {
          short
        }
        price {
          min_price
          max_price
        }
        variants {
          _id
        }
        shop_id {
          name
          logo
        }
        createdAt
      }
    }
  }
`;

const categoryColors = {
  "Thực phẩm": "bg-green-200 text-green-800",
  "Đồ uống": "bg-orange-200 text-orange-800",
};

export default function WarehouseManagement() {
  const { shopData } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  const { data } = useQuery(GET_PRODUCTS, {
    variables: {
      pagination: { limit: 20, offset: 0 },
      filter: { shopId: shopData?._id },
    },
  });

  useEffect(() => {
    if (data?.products?.items) {
      // Chuyển đổi _id thành id, thêm placeholder variants nếu muốn
      const mapped = data.products.items.map((p) => ({
        id: p._id,
        name: p.name,
        category: "Thực phẩm", // Hoặc map từ API nếu có category
        variants:
          p.variants?.map((v) => ({
            id: v._id,
            attributes: {}, // Hoặc lấy từ API
            price: p.price?.min_price || 0,
            stock: 0,
            lastUpdated: null,
            history: [],
          })) || [],
      }));
      setProducts(mapped);
    }
  }, [data]);

  const [editedStocks, setEditedStocks] = useState({});
  const [modalData, setModalData] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const handleSave = (productId, variantId) => {
    const key = `${productId}-${variantId}`;
    const changeData = editedStocks[key];
    if (!changeData) return;

    const now = new Date().toLocaleString("vi-VN");
    const quantity = Number(changeData.quantity);
    const priceIn = Number(changeData.priceIn);
    const priceOut = Number(changeData.priceOut);
    if (priceIn <= 0 || priceOut <= 0) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id !== variantId) return v;
            const newStock = v.stock + (quantity > 0 ? quantity : 0);
            return {
              ...v,
              stock: newStock,
              lastUpdated: now,
              history: [
                ...v.history,
                {
                  stock: newStock,
                  date: now,
                  type: quantity > 0 ? "Nhập" : "Cập nhật giá",
                  priceIn,
                  priceOut,
                },
              ],
            };
          }),
        };
      })
    );

    setEditedStocks((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    alert(
      `Đã lưu thay đổi sản phẩm ${productId}, biến thể ${variantId}${
        quantity > 0 ? " (Nhập)" : " (Cập nhật giá)"
      }`
    );
  };

  const openHistoryModal = (product, variant) =>
    setModalData({ product, variant });
  const closeModal = () => setModalData(null);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? p.category === filterCategory : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Quản lý kho hàng OCOP
      </h1>

      {/* Tìm kiếm & lọc */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Tất cả danh mục</option>
          {Object.keys(categoryColors).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-blue-100 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-200 px-4 py-2">Tên sản phẩm</th>
              <th className="border border-gray-200 px-4 py-2">Danh mục</th>
              <th className="border border-gray-200 px-4 py-2">Biến thể</th>
              <th className="border border-gray-200 px-4 py-2">Số lượng</th>
              <th className="border border-gray-200 px-4 py-2">
                Giá nhập (VNĐ)
              </th>
              <th className="border border-gray-200 px-4 py-2">
                Giá xuất (VNĐ)
              </th>
              <th className="border border-gray-200 px-4 py-2">
                Ngày cập nhật
              </th>
              <th className="border border-gray-200 px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) =>
              p.variants.map((v) => {
                const key = `${p.id}-${v.id}`;
                const currentChange = editedStocks[key] || {
                  quantity: "",
                  priceIn: v.price,
                  priceOut: v.price,
                };

                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      {p.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          categoryColors[p.category] ||
                          "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {Object.values(v.attributes).join(" / ")}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {v.stock}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        value={currentChange.priceIn}
                        className="w-24 border rounded px-2 py-1 text-right"
                        onChange={(e) =>
                          setEditedStocks((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              priceIn: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        value={currentChange.priceOut}
                        className="w-24 border rounded px-2 py-1 text-right"
                        onChange={(e) =>
                          setEditedStocks((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              priceOut: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {v.lastUpdated || "-"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center space-x-1">
                      <input
                        type="number"
                        min={0}
                        value={currentChange.quantity}
                        placeholder="Số lượng"
                        className="w-20 border rounded px-2 py-1 text-center"
                        onChange={(e) =>
                          setEditedStocks((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              quantity: Number(e.target.value),
                            },
                          }))
                        }
                      />
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        onClick={() => handleSave(p.id, v.id)}
                      >
                        Lưu
                      </button>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        onClick={() => openHistoryModal(p, v)}
                      >
                        👁
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal lịch sử */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Lịch sử: {modalData.product.name} (
              {Object.values(modalData.variant.attributes).join(" / ")})
            </h2>
            <ul className="text-sm space-y-1">
              {modalData.variant.history.length === 0 && (
                <li>Chưa có lịch sử</li>
              )}
              {modalData.variant.history.map((h, idx) => (
                <li key={idx}>
                  {h.date} - {h.type}: {h.stock} | Giá nhập:{" "}
                  {h.priceIn?.toLocaleString()} VNĐ | Giá xuất:{" "}
                  {h.priceOut?.toLocaleString()} VNĐ
                </li>
              ))}
            </ul>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={closeModal}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
