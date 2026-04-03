import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../../contexts/ToastProvider";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const GET_PRODUCT = gql`
  # query Product($id: ID!) {
  #   product(_id: $id) {
  query Product($filter: filterProduct!) {
    product(filter: $filter) {
      _id
      name
      variants {
        _id
        attributes {
          name
          value
          _id
        }
        height
        image
        length
        product_id {
          _id
        }
        sku
        slug
        stock_quantity
        weight
        width
        selling_price
      }
    }
  }
`;

const UPDATE_VARIANT = gql`
  mutation UpdateVariant($variantId: ID!, $input: UpdateVariantInput!) {
    updateVariant(variantId: $variantId, input: $input) {
      name
    }
  }
`;

function preventNegativeInput(e) {
  if (
    e.key === "-" ||
    e.key === "e" ||
    e.key === "E" ||
    e.key === "+" ||
    e.key === "." // Nếu không muốn nhập số thập phân
  ) {
    e.preventDefault();
  }
}
function preventNegativePaste(e) {
  const pasted = e.clipboardData.getData("text");
  if (
    pasted.includes("-") ||
    pasted.includes("e") ||
    pasted.includes("E") ||
    pasted.includes("+") ||
    pasted.includes(".") || // Nếu không muốn nhập số thập phân
    isNaN(Number(pasted))
  ) {
    e.preventDefault();
  }
}

export default function ProductVariantsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { showToast } = useToast();

  const [variants, setVariants] = useState([]);
  const [savingIdx, setSavingIdx] = useState(null);
  const [showDimensions, setShowDimensions] = useState({});

  const { data, loading } = useQuery(GET_PRODUCT, {
    variables: { filter: { _id: productId } },
    // fetchPolicy: "network-only",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const [updateVariant, { loadingVariant }] = useMutation(UPDATE_VARIANT);

  useEffect(() => {
    if (data && data.product && data.product.variants) {
      setVariants(
        data.product.variants.map((v) => ({
          ...v,
          id: v._id,
          price: v.selling_price ?? "",
          quantity: v.stock_quantity ?? "",
          imageFile: null,
          imagePreview: v.image,
        })),
      );
      setShowDimensions(
        data.product.variants.reduce((acc, v) => {
          acc[v._id] = false;
          return acc;
        }, {}),
      );
    }
  }, [data]);

  const handleChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    );
  };

  const handleImageChange = (idx, files) => {
    const file = files[0];
    if (!file) return;
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx
          ? {
              ...v,
              imageFile: file,
              imagePreview: URL.createObjectURL(file),
            }
          : v,
      ),
    );
  };

  const handleToggleDimensions = (variantId) => {
    setShowDimensions((prev) => ({
      ...prev,
      [variantId]: !prev[variantId],
    }));
  };

  const handleSave = async (idx) => {
    const v = variants[idx];

    for (let attr of v.attributes) {
      if (!attr.name.trim() || !attr.value.trim()) {
        showToast("Thuộc tính và giá trị không được để trống!", "warning");
        return;
      }
    }
    if (!v.price) {
      showToast("Giá bán không được để trống!", "warning");
      return;
    }
    if (!v.quantity) {
      showToast("Số lượng không hợp lệ!", "warning");
      return;
    }
    if (!v.sku.trim()) {
      showToast("SKU không được để trống!", "warning");
      return;
    }
    if (!v.weight) {
      showToast("Cân nặng không được để trống!", "warning");
      return;
    }
    if (!v.length) {
      showToast("Chiều dài không được để trống!", "warning");
      return;
    }
    if (!v.width) {
      showToast("Chiều rộng không được để trống!", "warning");
      return;
    }
    if (!v.height) {
      showToast("Chiều cao không được để trống!", "warning");
      return;
    }

    setSavingIdx(idx);
    try {
      const input = {
        selling_price: Number(v.price),
        stock_quantity: Number(v.quantity),
        sku: v.sku,
        weight: Number(v.weight),
        length: Number(v.length),
        width: Number(v.width),
        height: Number(v.height),
      };

      // Chỉ truyền ảnh nếu có file mới
      if (v.imageFile) {
        input.image = v.imageFile;
      }

      // So sánh attributes với giá trị ban đầu, chỉ truyền nếu có thay đổi
      const original = data.product.variants.find((va) => va._id === v.id);
      const isAttrChanged =
        JSON.stringify(v.attributes) !== JSON.stringify(original.attributes);

      if (isAttrChanged) {
        input.attributes = v.attributes
          .filter((a) => a.name !== "" && a.value !== "")
          .map((a) => ({
            _id: a._id,
            name: a.name,
            value: a.value,
          }));
      }

      await updateVariant({
        variables: {
          variantId: v.id,
          input,
        },
      });
      showToast("Cập nhật biến thể thành công!", "success");
    } catch (err) {
      showToast("Lỗi khi cập nhật biến thể: " + err.message, "error");
    }
    setSavingIdx(null);
  };

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
        <h2 className="text-2xl font-bold mb-6">Cập nhật biến thể sản phẩm</h2>
        {/* <div className="overflow-x-auto p-6 bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white rounded shadow border">
            <thead> */}
        <div className="p-6 overflow-x-auto bg-white rounded-lg border border-gray-300 overflow-hidden shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-2 border-gray-300">STT</th>
                <th className="border px-2 py-2 border-gray-300">Thuộc tính</th>
                <th className="border px-2 py-2 border-gray-300">Ảnh</th>
                <th className="border px-2 py-2 border-gray-300">Giá bán</th>
                <th className="border px-2 py-2 border-gray-300">Kho hàng</th>
                <th className="border px-2 py-2 border-gray-300">SKU</th>
                <th className="border px-2 py-2 border-gray-300">Thêm</th>
                <th className="border px-2 py-2 border-gray-300">Lưu</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => (
                <React.Fragment key={v.id}>
                  <tr className="group" style={{ verticalAlign: "top" }}>
                    <td
                      className="text-center border px-2 py-2 border-gray-300"
                      rowSpan={showDimensions[v.id] ? 2 : 1}
                      style={{ verticalAlign: "middle" }}
                    >
                      {idx + 1}
                    </td>
                    {/* <td className="border px-2 py-2 border-gray-300">
                      {v.attributes.map((a) => (
                        <span key={a.name} className="block">
                          <span className="font-bold">{a.name}</span>: {a.value}
                        </span>
                      ))}
                    </td> */}
                    <td className="border px-2 py-2 border-gray-300">
                      {v.attributes.map((a, attrIdx) => (
                        <div
                          key={a._id || a.name}
                          className="mb-1 flex items-center gap-2"
                        >
                          <input
                            type="text"
                            className="border-gray-400 border rounded px-2 py-1 w-24 font-bold"
                            value={a.name}
                            onChange={(e) => {
                              setVariants((prev) =>
                                prev.map((v2, i) =>
                                  i === idx
                                    ? {
                                        ...v2,
                                        attributes: v2.attributes.map(
                                          (attr, j) =>
                                            j === attrIdx
                                              ? {
                                                  ...attr,
                                                  name: e.target.value,
                                                }
                                              : attr,
                                        ),
                                      }
                                    : v2,
                                ),
                              );
                            }}
                            placeholder="Tên thuộc tính"
                          />
                          <span>:</span>
                          <input
                            type="text"
                            className="border-gray-400 border rounded px-2 py-1 w-24"
                            value={a.value}
                            onChange={(e) => {
                              setVariants((prev) =>
                                prev.map((v2, i) =>
                                  i === idx
                                    ? {
                                        ...v2,
                                        attributes: v2.attributes.map(
                                          (attr, j) =>
                                            j === attrIdx
                                              ? {
                                                  ...attr,
                                                  value: e.target.value,
                                                }
                                              : attr,
                                        ),
                                      }
                                    : v2,
                                ),
                              );
                            }}
                            placeholder="Giá trị"
                          />
                        </div>
                      ))}
                    </td>
                    <td className="border px-2 py-2 border-gray-300 ">
                      <label className="cursor-pointer whitespace-nowrap inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Đổi ảnh
                        <input
                          type="file"
                          accept="imaborder-gray-400 ge/*"
                          onChange={(e) =>
                            handleImageChange(idx, e.target.files)
                          }
                          className="hidden"
                        />
                      </label>
                      {v.imagePreview && (
                        <img
                          src={v.imagePreview}
                          alt=""
                          className="w-12 h-12 object-cover mt-1"
                        />
                      )}
                    </td>
                    <td className="border px-2 py-2 border-gray-300">
                      <input
                        type="number"
                        className="border-gray-400 rounded border px-2 py-1 w-full"
                        value={v.price}
                        onChange={(e) =>
                          handleChange(idx, "price", e.target.value)
                        }
                        min={0}
                        onKeyDown={preventNegativeInput}
                        onPaste={preventNegativePaste}
                        required
                      />
                    </td>
                    <td className="border px-2 py-2 border-gray-300">
                      <input
                        type="number"
                        className="border-gray-400 rounded border px-2 py-1 w-full"
                        value={v.quantity}
                        onChange={(e) =>
                          handleChange(idx, "quantity", e.target.value)
                        }
                        min={0}
                        onKeyDown={preventNegativeInput}
                        onPaste={preventNegativePaste}
                        required
                      />
                    </td>
                    <td className="border px-2 py-2 border-gray-300">
                      <input
                        type="text"
                        className="border-gray-400 rounded border px-2 py-1 w-full"
                        value={v.sku}
                        onChange={(e) =>
                          handleChange(idx, "sku", e.target.value)
                        }
                      />
                    </td>
                    <td className="border px-2 py-2 border-gray-300 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleDimensions(v.id)}
                        className=" cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showDimensions[v.id] ? <RemoveIcon /> : <AddIcon />}
                      </button>
                    </td>
                    <td
                      className="border px-2 py-2 border-gray-300"
                      rowSpan={showDimensions[v.id] ? 2 : 1}
                      style={{ verticalAlign: "middle" }}
                    >
                      <button
                        type="button"
                        className="cursor-pointer bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => handleSave(idx)}
                        disabled={savingIdx === idx}
                      >
                        {savingIdx === idx ? "Đang lưu..." : "Lưu"}
                      </button>
                    </td>
                  </tr>
                  {savingIdx === idx && (
                    // <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm p-6 flex justify-center items-center h-screen z-50">
                      <div className="flex flex-col items-center">
                        {/* <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div> */}
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-white text-lg">
                          Đang lưu sản phẩm...
                        </p>
                      </div>
                    </div>
                  )}
                  {showDimensions[v.id] && (
                    <tr>
                      <td
                        colSpan="6"
                        className="border px-2 py-2 border-gray-300"
                      >
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Cân nặng (g)
                            </label>
                            <input
                              type="number"
                              className="border-gray-400 rounded border px-2 py-1 w-full"
                              value={v.weight}
                              onChange={(e) =>
                                handleChange(idx, "weight", e.target.value)
                              }
                              min={0}
                              onKeyDown={preventNegativeInput}
                              onPaste={preventNegativePaste}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Dài (cm)
                            </label>
                            <input
                              type="number"
                              className="border-gray-400 rounded border px-2 py-1 w-full"
                              value={v.length}
                              onChange={(e) =>
                                handleChange(idx, "length", e.target.value)
                              }
                              min={0}
                              onKeyDown={preventNegativeInput}
                              onPaste={preventNegativePaste}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Rộng (cm)
                            </label>
                            <input
                              type="number"
                              className="border-gray-400 rounded border px-2 py-1 w-full"
                              value={v.width}
                              onChange={(e) =>
                                handleChange(idx, "width", e.target.value)
                              }
                              min={0}
                              onKeyDown={preventNegativeInput}
                              onPaste={preventNegativePaste}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Cao (cm)
                            </label>
                            <input
                              type="number"
                              className="border-gray-400 rounded border px-2 py-1 w-full"
                              value={v.height}
                              onChange={(e) =>
                                handleChange(idx, "height", e.target.value)
                              }
                              min={0}
                              onKeyDown={preventNegativeInput}
                              onPaste={preventNegativePaste}
                              required
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="cursor-pointer mt-6 px-2 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => navigate(`/seller/products/edit/${productId}`)}
        >
          Quay lại sản phẩm
        </button>
      </div>
    </div>
  );
}
