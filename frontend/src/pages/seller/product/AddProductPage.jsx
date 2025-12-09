import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, gql } from "@apollo/client";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
// GraphQL -----------------------------------

// // Lấy danh sách shop để xác định shopId của user hiện tại
// const SHOPS_QUERY = gql`
//   query Shops {
//     shops {
//       items {
//         id
//         name
//         owner {
//           id
//         }
//       }
//     }
//   }
// `;

const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      _id
      name
      owner {
        _id
      }
    }
  }
`;

// Lấy danh sách category từ database
const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      items {
        _id
        name
        status
        parent {
          _id
          name
          status
        }
      }
    }
  }
`;

// Mutation tạo sản phẩm mới
const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      _id
      name
      status
      # stock
      createdAt
    }
  }
`;
// end GraphQL -----------------------------------

export default function AddProductPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { userData } = useContext(AuthContext);
  const userId = userData?._id;
  const { showToast } = useToast();

  // // Lấy shopId của user hiện tại
  // const { data: shopsData, loading: shopsLoading } = useQuery(SHOPS_QUERY);
  // const shopId = shopsData?.shops?.items?.find(
  //   (shop) => shop.owner?.id === userId
  // )?.id;

  const { data: myShopData, loading: myShopLoading } = useQuery(MY_SHOP_QUERY);
  const shopId = myShopData?.myShop?._id;

  // Lấy danh sách category từ database
  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(CATEGORIES_QUERY);
  const categories = categoriesData?.categories?.items || [];

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    shortDescription: "",
    fullDescription: "",

    // xóa price ---------------

    // price: "",

    // --------------------

    // stock: "",
    // status: "active",
    specifications: [{ name: "", value: "" }],
  });
  const [images, setImages] = useState([]);
  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT);

  // --- Biến thể ---
  const [variantGroups, setVariantGroups] = useState([]); // [{name, options: [value, ...]}]
  const [variantCombinations, setVariantCombinations] = useState([]); // [{attributes, price, quantity, sku, image, ...}]

  // ---------------------------
  const [dragId, setDragId] = useState(null);
  // ---------------------------

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý ảnh
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };
  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---------------------------

  const handleDragStart = (e, idx) => {
    setDragId(idx);
    e.dataTransfer.setData("text/plain", idx);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (draggedIdx === 0 || isNaN(draggedIdx)) return;

    setImages((prev) => {
      const newImages = [...prev];
      const [draggedImage] = newImages.splice(draggedIdx, 1);
      newImages.unshift(draggedImage);
      return newImages;
    });
  };

  // ---------------------------

  // Thông số kỹ thuật động
  const handleSpecChange = (idx, field, value) => {
    setFormData((prev) => {
      const specs = [...prev.specifications];
      specs[idx][field] = value;
      return { ...prev, specifications: specs };
    });
  };
  const handleAddSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { name: "", value: "" }],
    }));
  };
  const handleRemoveSpec = (idx) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== idx),
    }));
  };

  // --- Biến thể: Nhóm phân loại ---
  const handleAddGroup = () => {
    if (variantGroups.length >= 2) return;
    setVariantGroups([...variantGroups, { name: "", options: [""] }]);
  };
  const handleRemoveLastGroup = () => {
    setVariantGroups((groups) => groups.slice(0, -1));
  };
  const handleGroupNameChange = (idx, value) => {
    setVariantGroups((groups) => {
      const copy = [...groups];
      copy[idx].name = value;
      return copy;
    });
  };
  const handleAddOption = (groupIdx) => {
    const copy = [...variantGroups];
    copy[groupIdx].options.push("");
    setVariantGroups(copy);
  };
  const handleOptionChange = (groupIdx, optIdx, value) => {
    setVariantGroups((groups) => {
      const copy = [...groups];
      copy[groupIdx].options[optIdx] = value;
      return copy;
    });
  };
  const handleRemoveOption = (groupIdx, optIdx) => {
    const copy = [...variantGroups];
    copy[groupIdx].options.splice(optIdx, 1);
    setVariantGroups(copy);
  };
  const handleRemoveAllGroups = () => {
    setVariantGroups([]);
  };

  // Sinh tổ hợp biến thể từ các nhóm
  function generateCombinations(groups) {
    if (groups.length === 0) return [];
    if (groups.length === 1) {
      return groups[0].options
        .filter(Boolean)
        .map((opt) => [{ name: groups[0].name, value: opt }]);
    }
    // 2 nhóm: cartesian product
    const [g1, g2] = groups;
    return g1.options.filter(Boolean).flatMap((opt1) =>
      g2.options.filter(Boolean).map((opt2) => [
        { name: g1.name, value: opt1 },
        { name: g2.name, value: opt2 },
      ])
    );
  }

  // xóa cmt nếu muốn ktra trùng lập tên option trong cùng nhóm

  //   const hasDuplicateOptionsInGroups = () => {
  //   return variantGroups.some((group) => {
  //     const seen = new Set();
  //     for (const opt of group.options) {
  //       const trimmed = opt.trim().toLowerCase();
  //       if (seen.has(trimmed)) return true;
  //       seen.add(trimmed);
  //     }
  //     return false;
  //   });
  // };

  // Khi variantGroups thay đổi, sinh lại bảng tổ hợp
  React.useEffect(() => {
    if (variantGroups.length === 0) {
      setVariantCombinations([]);
      return;
    }
    const combinations = generateCombinations(variantGroups);
    setVariantCombinations((prev) => {
      // Giữ lại giá/kho/sku/image đã nhập nếu có
      const prevMap = {};
      prev.forEach((c) => {
        prevMap[JSON.stringify(c.attributes)] = c;
      });
      return combinations.map((attrs) => {
        const key = JSON.stringify(attrs);
        return (
          prevMap[key] || {
            attributes: attrs,
            price: "",
            quantity: "",
            sku: "",
            image: null,
            imagePreview: "",
          }
        );
      });
    });
  }, [variantGroups]);

  // Cập nhật giá/kho/sku cho từng tổ hợp
  const handleCombinationChange = (idx, field, value) => {
    setVariantCombinations((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };
  // Cập nhật ảnh biến thể
  const handleVariantImageChange = (idx, files) => {
    const file = files[0];
    if (!file) return;
    setVariantCombinations((prev) =>
      prev.map((c, i) =>
        i === idx
          ? {
              ...c,
              image: file,
              imagePreview: URL.createObjectURL(file),
            }
          : c
      )
    );
  };

  // Ngăn người dùng nhập ký tự không hợp lệ (như '-')
  const preventNegativeInput = (e) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const preventNegativePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes("-") || isNaN(Number(pasted))) {
      e.preventDefault();
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopId) {
      showToast("Không tìm thấy cửa hàng của bạn!", "error");
      return;
    }
    if (!formData.category_id) {
      showToast("Vui lòng chọn danh mục!", "warning");
      return;
    }
    if (images.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 ảnh sản phẩm!", "warning");
      return;
    }

    // xóa price ---------------
    if (variantCombinations.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 biến thể!", "warning");
      return;
    }
    // --------------------

    // xóa price ---------------

    // // Kiểm tra giá bán âm
    // if (Number(formData.price) < 0) {
    //   showToast("Giá sản phẩm không được nhỏ hơn 0!", "warning");
    //   return;
    // }

    // --------------------

    // Kiểm tra các biến thể nếu có
    if (variantCombinations.length > 0) {
      for (let i = 0; i < variantCombinations.length; i++) {
        const v = variantCombinations[i];
        if (Number(v.price) < 0 || Number(v.quantity) < 0) {
          showToast("Giá và kho của biến thể không được âm!", "warning");
          return;
        }
      }
    }

    // xóa cmt nếu muốn ktra trùng lập tên option trong cùng nhóm

    // if (hasDuplicateOptionsInGroups()) {
    //   showToast(
    //     "Tùy chọn trong cùng một nhóm phân loại không được trùng tên!",
    //     "warning"
    //   );
    //   return;
    // }

    // Validate biến thể nếu có
    if (
      variantCombinations.length > 0 &&
      variantCombinations.some(
        (v) =>
          !v.attributes ||
          v.attributes.length === 0 ||
          !v.price ||
          !v.quantity ||
          !v.image
      )
    ) {
      showToast(
        "Vui lòng nhập đầy đủ thông tin cho tất cả biến thể!",
        "warning"
      );
      return;
    }
    try {
      const input = {
        name: formData.name,
        // shopId: shopId,
        categoryId: formData.category_id,
        description: {
          short: formData.shortDescription,
          full: formData.fullDescription,
        },
        images: images, // mảng File object

        // xóa price ---------------

        // price: {
        //   regular: Number(formData.price),
        // },

        // --------------------

        // inventory: {
        //   quantity: Number(formData.stock),
        // },
        specifications: formData.specifications.filter(
          (s) => s.name && s.value
        ),
        // Thêm biến thể nếu có
        ...(variantCombinations.length > 0 && {
          variantCombinations: variantCombinations.map((v) => ({
            attributes: v.attributes,
            price: Number(v.price),
            stock_quantity: Number(v.quantity),
            sku: v.sku,
            image: v.image, // File object
            // weight, length, width, height nếu muốn
          })),
        }),
      };
      await createProduct({ variables: { input } });
      showToast("Thêm sản phẩm thành công!", "success");
      navigate("/seller/products");
    } catch (err) {
      showToast("Lỗi khi thêm sản phẩm: " + err.message, "error");
    }
  };

  const handleCancel = () => {
    navigate("/seller/products");
  };

  // lấy danh mục có status active
  const renderCategoryOptions = () => {
    const activeCategories = categories.filter(
      (cat) => cat.status === "active"
    );

    const parentCategories = activeCategories.filter((cat) => !cat.parent);
    const childCategories = activeCategories.filter((cat) => cat.parent);

    return parentCategories.flatMap((parent) => {
      const children = childCategories.filter(
        (child) => child.parent?._id === parent._id
      );
      return [
        //  <option key={parent._id} value={parent._id}>
        //   {parent.name}
        // </option>,
        <option
          key={parent._id}
          value={parent._id}
          disabled
          className="font-bold"
        >
          {parent.name}
        </option>,
        ...children.map((child) => (
          <option
            key={child._id}
            value={child._id}
            className="font-medium text-blue-800"
          >
            {"\u00A0\u00A0\u00A0↳ " + child.name}
          </option>
        )),
      ];
    });
  };

  if (myShopLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-500 text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-normal mb-6">Thêm Mới Sản Phẩm</h1>
      <form
        className="bg-white rounded-lg shadow max-w-4xl mx-auto"
        onSubmit={handleSubmit}
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh Mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className=" hover:border-blue-400  cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {renderCategoryOptions()}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ngắn
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập mô tả ngắn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập mô tả chi tiết"
            />
          </div>

          {/* // xóa price --------------- */}

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onKeyDown={preventNegativeInput}
              onPaste={preventNegativePaste}
              required
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập giá bán"
            />
          </div> */}

          {/* // -------------------- */}

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng tồn kho <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập số lượng"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div
              className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 mb-2"
              onClick={handleImageClick}
            >
              <span className="text-gray-400 text-sm">
                Click để chọn nhiều ảnh
              </span>
            </div>
            {/* <div className="flex flex-wrap gap-3">
              {images.map((file, idx) => {
                const url =
                  file instanceof File ? URL.createObjectURL(file) : file;
                return (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full px-2 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div> */}

            {/* ----------------------------- */}

            <div className="flex flex-wrap gap-3">
              {images.map((file, idx) => {
                const url =
                  file instanceof File ? URL.createObjectURL(file) : file;
                return (
                  <div
                    key={idx}
                    className="relative group"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={idx === 0 ? handleDragOver : undefined}
                    onDrop={idx === 0 ? handleDrop : undefined}
                  >
                    <img
                      src={url}
                      alt={`Ảnh ${idx + 1}`}
                      className={`w-24 h-24 object-cover rounded ${
                        idx === 0 ? "border-4 border-blue-500" : ""
                      }`}
                      title={
                        idx === 0
                          ? "Ảnh chính"
                          : "Kéo vào ảnh chính để thay đổi"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className=" cursor-pointer absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full px-2 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-tr">
                        Ảnh chính
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ----------------------------- */}
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className=" cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="active">Đang bán</option>
              <option value="draft">Nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="suspended">Tạm ngưng</option>
            </select>
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thông số kỹ thuật
            </label>
            {formData.specifications.map((spec, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Tên thông số"
                  value={spec.name}
                  onChange={(e) =>
                    handleSpecChange(idx, "name", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Giá trị"
                  value={spec.value}
                  onChange={(e) =>
                    handleSpecChange(idx, "value", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className=" cursor-pointer px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={formData.specifications.length === 1}
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSpec}
              className=" cursor-pointer mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Thêm thông số
            </button>
          </div>

          {/* --- Biến thể sản phẩm --- */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-bold mb-2">
              {/* Phân loại/biến thể sản phẩm (không bắt buộc) */}
              Phân loại/biến thể sản phẩm (ít nhất một biến thể)
            </h3>
            {/* Nhóm phân loại */}
            {variantGroups.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className="bg-[#f6f6f6] mb-4 border p-3 rounded"
              >
                <span className="block text-md font-semibold mb-2">
                  Nhóm phân loại {groupIdx + 1}:
                </span>
                <input
                  className="rounded border px-2 py-1 mr-8 mb-2"
                  placeholder={`Tên nhóm (VD: Màu sắc, Kích thước)`}
                  value={group.name}
                  onChange={(e) =>
                    handleGroupNameChange(groupIdx, e.target.value)
                  }
                  required
                />
                {group.options.map((opt, optIdx) => (
                  <span key={optIdx} className="inline-flex items-center mr-2">
                    <input
                      className="rounded border border-blue-500 px-2 py-1"
                      placeholder="Tùy chọn"
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(groupIdx, optIdx, e.target.value)
                      }
                      required
                    />
                    <button
                      className="cursor-pointer"
                      type="button"
                      onClick={() => handleRemoveOption(groupIdx, optIdx)}
                    >
                      <HighlightOffIcon style={{ color: "red" }} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddOption(groupIdx)}
                  className="cursor-pointer ml-2 text-blue-600"
                >
                  + Thêm tùy chọn
                </button>
              </div>
            ))}
            <div className="flex gap-2 mb-4">
              {variantGroups.length < 2 && (
                <button
                  type="button"
                  className="cursor-pointer px-3 py-1 border rounded text-blue-600"
                  onClick={handleAddGroup}
                  title="Thêm nhóm phân loại 2"
                >
                  + Thêm nhóm phân loại
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                {variantGroups.length > 0 && (
                  <button
                    type="button"
                    className="cursor-pointer px-3 py-1 border rounded text-red-600 hover:text-red-500"
                    onClick={handleRemoveLastGroup}
                    title={
                      variantGroups.length === 2
                        ? "Nhấn để xóa nhóm phân loại 2"
                        : "Nhấn để xóa nhóm phân loại 1"
                    }
                  >
                    Xóa nhóm phân loại {variantGroups.length}
                  </button>
                )}
                {variantGroups.length > 0 && (
                  <button
                    type="button"
                    className="cursor-pointer px-3 py-1 border rounded text-red-600 hover:text-red-500"
                    onClick={handleRemoveAllGroups}
                    title="Xóa toàn bộ phân loại"
                  >
                    Xóa toàn bộ phân loại
                  </button>
                )}
              </div>
            </div>

            {/* Bảng tổ hợp biến thể */}
            {variantGroups.length > 0 && (
              <>
                <h3 className="text-base font-bold mb-2 mt-4">
                  Bảng tổ hợp biến thể:
                </h3>
                <div className="overflow-x-auto flex gap-3 mb-4">
                  <input
                    type="number"
                    onKeyDown={preventNegativeInput}
                    onPaste={preventNegativePaste}
                    min={0}
                    className="border px-2 py-1 rounded w-37"
                    placeholder="Nhập nhanh giá"
                    id="applyAllPrice"
                  />
                  <input
                    type="number"
                    onKeyDown={preventNegativeInput}
                    onPaste={preventNegativePaste}
                    min={0}
                    className="border px-2 py-1 rounded w-37"
                    placeholder="Nhập nhanh kho"
                    id="applyAllquantity"
                  />
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-37"
                    placeholder="Nhập nhanh SKU"
                    id="applyAllSku"
                  />
                  <button
                    type="button"
                    className=" whitespace-nowrap cursor-pointer px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                      const price =
                        document.getElementById("applyAllPrice").value;
                      const quantity =
                        document.getElementById("applyAllquantity").value;
                      const sku = document.getElementById("applyAllSku").value;
                      setVariantCombinations((vs) =>
                        vs.map((v, i) => ({
                          ...v,
                          price: price !== "" ? price : v.price,
                          quantity: quantity !== "" ? quantity : v.quantity,
                          sku: sku !== "" ? `${sku}-${i + 1}` : v.sku,
                          // sku: sku !== "" ? sku : v.sku,
                        }))
                      );
                    }}
                  >
                    Nhập nhanh
                  </button>
                </div>
                <table className="min-w-full bg-white rounded shadow border">
                  <thead>
                    <tr>
                      {variantGroups.map((g, i) => (
                        <th key={i} className="border px-3 py-2">
                          {g.name || `Phân loại ${i + 1}`}
                        </th>
                      ))}
                      <th className="border px-3 py-2">Ảnh</th>
                      <th className="border px-3 py-2">Giá</th>
                      <th className="border px-3 py-2">Kho hàng</th>
                      <th className="border px-3 py-2">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantCombinations.map((c, idx) => (
                      <tr key={idx}>
                        {c.attributes.map((attr, i) => (
                          <td key={i} className="text-center border px-3 py-2">
                            {attr.value}
                          </td>
                        ))}
                        <td className="border px-2 py-2">
                          <label className=" whitespace-nowrap cursor-pointer inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Chọn ảnh
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleVariantImageChange(idx, e.target.files)
                              }
                              className="hidden"
                            />
                          </label>
                          {c.imagePreview && (
                            <img
                              src={c.imagePreview}
                              alt=""
                              className="w-12 h-12 object-cover mt-2"
                            />
                          )}
                        </td>
                        <td className="border px-3 py-2">
                          <input
                            type="number"
                            className="rounded border px-2 py-1 w-full"
                            value={c.price}
                            min={0}
                            onChange={(e) =>
                              handleCombinationChange(
                                idx,
                                "price",
                                e.target.value
                              )
                            }
                            onKeyDown={preventNegativeInput}
                            onPaste={preventNegativePaste}
                            required
                          />
                        </td>
                        <td className="border px-3 py-2">
                          <input
                            type="number"
                            className="rounded border px-2 py-1 w-full"
                            value={c.quantity}
                            min={0}
                            onChange={(e) =>
                              handleCombinationChange(
                                idx,
                                "quantity",
                                e.target.value
                              )
                            }
                            onKeyDown={preventNegativeInput}
                            onPaste={preventNegativePaste}
                            required
                          />
                        </td>
                        <td className="border px-3 py-2">
                          <input
                            type="text"
                            className="rounded border px-2 py-1 w-full"
                            value={c.sku}
                            required
                            onChange={(e) =>
                              handleCombinationChange(
                                idx,
                                "sku",
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 p-6 flex justify-center space-x-4">
          {/* <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Thêm mới"}
          </button> */}
          <button
            type="submit"
            className=" cursor-pointer px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="ml-2">Đang lưu...</span>
              </div>
            ) : (
              "Thêm mới"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className=" cursor-pointer px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Hủy
          </button>
        </div>
      </form>
      {loading && (
        // <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm p-6 flex justify-center items-center h-screen z-50">
          <div className="flex flex-col items-center">
            {/* <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div> */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang lưu sản phẩm...</p>
          </div>
        </div>
      )}
    </div>
  );
}
