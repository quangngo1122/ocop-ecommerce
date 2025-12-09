import { useState, useEffect } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";

const ADD_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
    }
  }
`;

export default function AddProductPageTest() {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: {
      short: "",
      full: "",
    },
    images: [],
    price: {
      regular: 0,
    },
    specifications: [],
    inventory: {
      quantity: 0,
    },
    variantCombinations: [],
  });

  const [variantAttributes, setVariantAttributes] = useState([]);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [selectedAttributeIndex, setSelectedAttributeIndex] = useState(-1);
  const [hasVariants, setHasVariants] = useState(false);
  const [generatedCombinations, setGeneratedCombinations] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [notification, setNotification] = useState(null);

  // Mock categories
  const categories = [
    { id: "1", name: "Điện tử" },
    { id: "2", name: "Thời trang" },
    { id: "3", name: "Gia dụng" },
    { id: "4", name: "Sách" },
  ];

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Tạo cartesian product cho biến thể
  const cartesianProduct = (arr) => {
    return arr.reduce(
      (a, b) => a.flatMap((d) => b.map((e) => [...d, e])),
      [[]]
    );
  };

  // Sinh ra các tổ hợp biến thể
  const generateVariantCombinations = () => {
    if (variantAttributes.length === 0) {
      setGeneratedCombinations([]);
      return;
    }

    const attributeArrays = variantAttributes.map((attr) =>
      attr.values.map((value) => ({ name: attr.name, value }))
    );

    const combinations = cartesianProduct(attributeArrays);

    const newCombinations = combinations.map((attrs) => {
      const existing = generatedCombinations.find(
        (combo) =>
          JSON.stringify(combo.attributes.sort()) ===
          JSON.stringify(attrs.sort())
      );

      return (
        existing || {
          attributes: attrs,
          price: formData.price.regular,
          quantity: 0,
          image: "",
          sku: "",
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
        }
      );
    });

    setGeneratedCombinations(newCombinations);
    setFormData((prev) => ({
      ...prev,
      variantCombinations: newCombinations,
    }));
  };

  useEffect(() => {
    if (hasVariants) {
      generateVariantCombinations();
    } else {
      setGeneratedCombinations([]);
      setFormData((prev) => ({
        ...prev,
        variantCombinations: [],
      }));
    }
  }, [variantAttributes, hasVariants]);

  const addAttribute = () => {
    if (!newAttributeName.trim()) return;

    const existingIndex = variantAttributes.findIndex(
      (attr) => attr.name === newAttributeName
    );

    if (existingIndex >= 0) {
      setSelectedAttributeIndex(existingIndex);
    } else {
      setVariantAttributes((prev) => [
        ...prev,
        { name: newAttributeName, values: [] },
      ]);
      setSelectedAttributeIndex(variantAttributes.length);
    }

    setNewAttributeName("");
  };

  const addAttributeValue = () => {
    if (!newAttributeValue.trim() || selectedAttributeIndex < 0) return;

    setVariantAttributes((prev) => {
      const updated = [...prev];
      if (!updated[selectedAttributeIndex].values.includes(newAttributeValue)) {
        updated[selectedAttributeIndex].values.push(newAttributeValue);
      }
      return updated;
    });

    setNewAttributeValue("");
  };

  const removeAttribute = (index) => {
    setVariantAttributes((prev) => prev.filter((_, i) => i !== index));
    if (selectedAttributeIndex === index) {
      setSelectedAttributeIndex(-1);
    }
  };

  const removeAttributeValue = (attrIndex, valueIndex) => {
    setVariantAttributes((prev) => {
      const updated = [...prev];
      updated[attrIndex].values.splice(valueIndex, 1);
      return updated;
    });
  };

  const updateVariantCombination = (index, field, value) => {
    setGeneratedCombinations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    setFormData((prev) => ({
      ...prev,
      variantCombinations: generatedCombinations,
    }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { name: "", value: "" }],
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showNotification("Vui lòng nhập tên sản phẩm", "error");
      return;
    }

    if (!formData.categoryId) {
      showNotification("Vui lòng chọn danh mục", "error");
      return;
    }

    console.log("Product data:", formData);
    showNotification("Sản phẩm đã được tạo thành công!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="container mx-auto py-6 max-w-6xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Thêm sản phẩm mới
          </h1>
          <p className="text-gray-600 mt-2">
            Tạo sản phẩm mới với các biến thể đa chiều
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "basic", name: "Thông tin cơ bản", icon: "📦" },
                  { id: "variants", name: "Biến thể", icon: "⚙️" },
                  { id: "pricing", name: "Giá & Kho", icon: "💰" },
                  { id: "media", name: "Hình ảnh", icon: "🖼️" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Thông tin sản phẩm
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Nhập thông tin cơ bản về sản phẩm
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Tên sản phẩm *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Nhập tên sản phẩm"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Danh mục *
                        </label>
                        <select
                          id="category"
                          value={formData.categoryId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              categoryId: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label
                        htmlFor="short-desc"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Mô tả ngắn
                      </label>
                      <input
                        id="short-desc"
                        type="text"
                        value={formData.description.short}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              short: e.target.value,
                            },
                          }))
                        }
                        placeholder="Mô tả ngắn gọn về sản phẩm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mt-6">
                      <label
                        htmlFor="full-desc"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Mô tả chi tiết
                      </label>
                      <textarea
                        id="full-desc"
                        value={formData.description.full}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              full: e.target.value,
                            },
                          }))
                        }
                        placeholder="Mô tả chi tiết về sản phẩm"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Thông số kỹ thuật
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thêm các thông số kỹ thuật của sản phẩm
                    </p>

                    <div className="space-y-4">
                      {formData.specifications.map((spec, index) => (
                        <div key={index} className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Tên thông số"
                            value={spec.name}
                            onChange={(e) =>
                              updateSpecification(index, "name", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Giá trị"
                            value={spec.value}
                            onChange={(e) =>
                              updateSpecification(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-gray-400 hover:text-red-500 hover:border-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        <span>+</span>
                        Thêm thông số
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Variants Tab */}
              {activeTab === "variants" && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quản lý biến thể
                      </h3>
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="has-variants"
                          className="text-sm font-medium text-gray-700"
                        >
                          Có biến thể
                        </label>
                        <button
                          type="button"
                          onClick={() => setHasVariants(!hasVariants)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            hasVariants ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              hasVariants ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Tạo các biến thể sản phẩm với nhiều thuộc tính khác nhau
                    </p>

                    {hasVariants && (
                      <div className="space-y-6">
                        {/* Add Attributes */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-4">
                            Thuộc tính biến thể
                          </h4>
                          <div className="flex gap-3 mb-6">
                            <input
                              type="text"
                              placeholder="Tên thuộc tính (VD: Màu sắc, Kích thước)"
                              value={newAttributeName}
                              onChange={(e) =>
                                setNewAttributeName(e.target.value)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" && addAttribute()
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={addAttribute}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              +
                            </button>
                          </div>

                          {/* Display Attributes */}
                          <div className="space-y-4">
                            {variantAttributes.map((attr, attrIndex) => (
                              <div
                                key={attrIndex}
                                className="border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-gray-900">
                                    {attr.name}
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={() => removeAttribute(attrIndex)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Add Values */}
                                {selectedAttributeIndex === attrIndex && (
                                  <div className="flex gap-3 mb-3">
                                    <input
                                      type="text"
                                      placeholder="Giá trị (VD: Đỏ, Xanh, L, XL)"
                                      value={newAttributeValue}
                                      onChange={(e) =>
                                        setNewAttributeValue(e.target.value)
                                      }
                                      onKeyPress={(e) =>
                                        e.key === "Enter" && addAttributeValue()
                                      }
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={addAttributeValue}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}

                                {selectedAttributeIndex !== attrIndex && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedAttributeIndex(attrIndex)
                                    }
                                    className="mb-3 px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                  >
                                    Thêm giá trị
                                  </button>
                                )}

                                {/* Display Values */}
                                <div className="flex flex-wrap gap-2">
                                  {attr.values.map((value, valueIndex) => (
                                    <span
                                      key={valueIndex}
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                                    >
                                      {value}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeAttributeValue(
                                            attrIndex,
                                            valueIndex
                                          )
                                        }
                                        className="text-gray-400 hover:text-red-500 ml-1"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Generated Combinations */}
                        {generatedCombinations.length > 0 && (
                          <div>
                            <div className="border-t border-gray-200 pt-6">
                              <h4 className="font-medium text-gray-900 mb-4">
                                Các biến thể được tạo (
                                {generatedCombinations.length})
                              </h4>
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {generatedCombinations.map(
                                  (combination, index) => (
                                    <div
                                      key={index}
                                      className="border border-gray-200 rounded-lg p-4"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Biến thể
                                          </label>
                                          <div className="flex flex-wrap gap-1">
                                            {combination.attributes.map(
                                              (attr, i) => (
                                                <span
                                                  key={i}
                                                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                                >
                                                  {attr.name}: {attr.value}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Giá bán
                                          </label>
                                          <input
                                            type="number"
                                            value={combination.price || 0}
                                            onChange={(e) =>
                                              updateVariantCombination(
                                                index,
                                                "price",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số lượng
                                          </label>
                                          <input
                                            type="number"
                                            value={combination.quantity || 0}
                                            onChange={(e) =>
                                              updateVariantCombination(
                                                index,
                                                "quantity",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SKU
                                          </label>
                                          <input
                                            type="text"
                                            value={combination.sku || ""}
                                            onChange={(e) =>
                                              updateVariantCombination(
                                                index,
                                                "sku",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Mã SKU"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trọng lượng (g)
                                          </label>
                                          <input
                                            type="number"
                                            value={combination.weight || 0}
                                            onChange={(e) =>
                                              updateVariantCombination(
                                                index,
                                                "weight",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dài (cm)
                                          </label>
                                          <input
                                            type="number"
                                            value={combination.length || 0}
                                            onChange={(e) =>
                                              updateVariantCombination(
                                                index,
                                                "length",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rộng (cm)
                                          </label>
                                          <input
                                            type="number"
                                            value={combination.width || 0}
                                            onChange={(e) =>
                                              updateVariantCombination(
                                                index,
                                                "width",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cao (cm)
                                          </label>
                                          <input
                                            type="number"
                                            value={combination.height || 0}
                                            onChange={(e) =>
                                              updateVariantCombination(
                                                index,
                                                "height",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Giá cả & Kho hàng
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thiết lập giá bán và quản lý kho
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="regular-price"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Giá gốc *
                        </label>
                        <input
                          id="regular-price"
                          type="number"
                          value={formData.price.regular}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: {
                                ...prev.price,
                                regular: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="sale-price"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Giá khuyến mãi
                        </label>
                        <input
                          id="sale-price"
                          type="number"
                          value={formData.price.sale || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: {
                                ...prev.price,
                                sale: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="sale-start"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Ngày bắt đầu KM
                        </label>
                        <input
                          id="sale-start"
                          type="datetime-local"
                          value={formData.price.saleStartDate || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: {
                                ...prev.price,
                                saleStartDate: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="sale-end"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Ngày kết thúc KM
                        </label>
                        <input
                          id="sale-end"
                          type="datetime-local"
                          value={formData.price.saleEndDate || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: {
                                ...prev.price,
                                saleEndDate: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {!hasVariants && (
                      <div className="mt-6">
                        <label
                          htmlFor="stock"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Số lượng tồn kho
                        </label>
                        <input
                          id="stock"
                          type="number"
                          value={formData.inventory.quantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              inventory: { quantity: Number(e.target.value) },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Hình ảnh sản phẩm
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Tải lên hình ảnh cho sản phẩm
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                      <div className="text-6xl text-gray-400 mb-4">📁</div>
                      <div>
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Chọn hình ảnh
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                          Hoặc kéo thả hình ảnh vào đây
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Lưu nháp
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tạo sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
