import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../../contexts/ToastProvider";

// GraphQL -----------------------------------
const GET_PRODUCT = gql`
  # query Product($id: ID!) {
  #   product(_id: $id) {
  query Product($filter: filterProduct!) {
    product(filter: $filter) {
      _id
      name
      category_id {
        _id
        name
        status
        parent {
          _id
        }

        # vì ko lấy đc name parent nên xóa thử --------

        # parent {
        #   name
        # }

        # -------------------
      }
      description {
        short
        full
      }

      # xóa price, stock

      # price {
      #   min_price
      # }
      # stock

      # -----------------

      status
      specifications {
        name
        value
      }
      images
    }
  }
`;

// *Note(1): vì backend query_prouduct chưa lấy đc category_id.id nên phải dùng hàm query_products để lấy rồi so sánh lọc ra

const PRODUCTS_QUERY = gql`
  query Products {
    products {
      items {
        _id
        category_id {
          _id
          name
          status
        }
      }
    }
  }
`;

//----------------------------

// Mutation cập nhật sản phẩm
const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: ID!, $input: UpdateProductInput!) {
    updateProduct(productId: $productId, input: $input) {
      name
    }
  }
`;

// Mutation cập nhật trạng thái sản phẩm
const UPDATE_PRODUCT_STATUS = gql`
  mutation UpdateProductStatus($productId: ID!, $status: ProductStatus!) {
    updateProductStatus(productId: $productId, status: $status) {
      status
    }
  }
`;

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

// end GraphQL -----------------------------------

const statusOptions = [
  { value: "active", label: "Đang bán" },
  { value: "draft", label: "Nháp" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "suspended", label: "Tạm ngưng" },
  // { value: "deleted", label: "Đã xóa" },
];

export default function UpdateProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    shortDescription: "",
    fullDescription: "",

    // xóa price, stock-------------------

    // price: "",
    // stock: "",

    //--------------------

    status: "active",
    specifications: [{ name: "", value: "" }],
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  //-------------------------------
  const [originalImages, setOriginalImages] = useState([]);
  const [dragId, setDragId] = useState(null);
  //-------------------------------

  // Query sản phẩm
  const { data, loading: loadingProduct } = useQuery(GET_PRODUCT, {
    variables: { filter: { _id: productId } },
    fetchPolicy: "network-only",
  });

  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(CATEGORIES_QUERY);
  const categories = categoriesData?.categories?.items || [];

  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);

  const [updateProductStatus, { loading: updatingStatus }] = useMutation(
    UPDATE_PRODUCT_STATUS
  );

  // *Note(1) --------------------------
  const { data: productsData, loading: productsLoading } = useQuery(
    PRODUCTS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );
  //--------------------------

  // Khi có data, set form
  useEffect(() => {
    // if (data && data.product) {

    // *Note(1) --------------------------
    if (data && data.product && productsData && productsData.products) {
      //--------------------------
      const p = data.product;

      // *Note(1) --------------------------
      const matchedProduct = productsData.products.items.find(
        (item) => item._id === productId
      );
      setOriginalImages(p.images || []);
      //--------------------------
      setFormData({
        name: p.name || "",
        // category_id: p.category_id?._id || "",

        // *Note(1) --------------------------
        category_id:
          matchedProduct?.category_id?._id || p.category_id?._id || "",
        shortDescription: p.description?.short || "",
        fullDescription: p.description?.full || "",

        // xóa price, stock-------------------

        // price: p.price?.min_price ?? "", // Hiển thị min_price
        // stock: p.stock || "",

        //--------------------

        status: p.status || "active",
        specifications:
          p.specifications && p.specifications.length > 0
            ? p.specifications
            : [{ name: "", value: "" }],
      });
      setImages(p.images || []);
      setLoading(false);
    }
    // }, [data]);

    // *Note(1) --------------------------
  }, [data, productsData, productId]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Ảnh
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

  //-------------------------------

  // Xử lý kéo thả ảnh
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

  //-------------------------------

  // Thông số kỹ thuật động
  const handleSpecChange = (idx, field, value) => {
    setFormData((prev) => {
      // const specs = [...prev.specifications];
      // specs[idx][field] = value;
      // return { ...prev, specifications: specs };
      if (!prev.specifications || idx >= prev.specifications.length) {
        return prev;
      }
      const newSpecs = (prev.specifications || []).map((spec, index) => {
        if (index === idx) {
          return {
            name: spec?.name || "",
            value: spec?.value || "",
            [field]: value,
          };
        }
        return { name: spec?.name || "", value: spec?.value || "" };
      });
      return { ...prev, specifications: newSpecs };
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

  // code gửi ảnh mới, và cả ảnh cũ --------------

  const urlToFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Không thể tải ảnh từ ${url}`);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error(`Lỗi khi tải ảnh ${url}:`, error);
      return null;
    }
  };

  //-----------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id) {
      showToast("Vui lòng chọn danh mục!", "warning");
      return;
    }
    if (images.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 ảnh sản phẩm!", "warning");
      return;
    }

    try {
      // Chỉ gửi ảnh mới (File object)
      const newImages = images.filter((img) => img instanceof File);

      // code gửi ảnh mới, và cả ảnh cũ --------------

      // Lưu ảnh cũ (URL string) để gửi cùng với ảnh mới nếu có thay đổi
      const existingImages = images.filter((img) => typeof img === "string");

      // Chuyển các ảnh cũ từ URL thành File
      const existingImageFiles = await Promise.all(
        existingImages.map(async (url, index) => {
          const filename = `existing_image_${index}.${
            url.split(".").pop() || "jpg"
          }`;
          const file = await urlToFile(url, filename);
          return file;
        })
      );

      // Lọc bỏ các file null (nếu có lỗi khi tải)
      const validExistingImageFiles = existingImageFiles.filter(
        (file) => file !== null
      );

      // Gộp tất cả ảnh (cũ + mới) dưới dạng File
      const allImages = [...validExistingImageFiles, ...newImages];

      //--------------------------

      // So sánh specifications với dữ liệu gốc
      const originalSpecs = data.product.specifications || [];
      const currentSpecs = formData.specifications.filter(
        (s) => s.name && s.value
      );
      const specsChanged =
        JSON.stringify(currentSpecs) !== JSON.stringify(originalSpecs);

      // Kiểm tra nếu specifications rỗng và có specifications cũ
      if (
        specsChanged &&
        currentSpecs.length === 0 &&
        originalSpecs.length > 0
      ) {
        showToast(
          "Vui lòng nhập ít nhất một thông số kỹ thuật hợp lệ!",
          "warning"
        );
        return;
      }

      const input = {
        name: formData.name,
        categoryId: formData.category_id,
        description: {
          short: formData.shortDescription,
          full: formData.fullDescription,
        },
        //---------------
        // images: allImages,

        // ...(newImages.length > 0 && { images: allImages }),

        ...((newImages.length > 0 ||
          images.length !== originalImages.length) && { images: allImages }),
        //----------------

        // images: newImages,
        // images: [...existingImages, ...newImages],
      };

      // Chỉ gửi specifications nếu có thay đổi
      if (specsChanged) {
        input.specifications = currentSpecs;
      }

      // Cập nhật sản phẩm
      await updateProduct({ variables: { productId, input } });

      // Cập nhật trạng thái riêng (nếu thay đổi)
      if (formData.status !== data.product.status) {
        await updateProductStatus({
          variables: { productId, status: formData.status },
        });
      }

      showToast("Cập nhật sản phẩm thành công!", "success");
      navigate("/seller/products");
    } catch (err) {
      showToast("Lỗi khi cập nhật sản phẩm: " + err.message, "error");
    }
  };

  const handleCancel = () => {
    navigate("/seller/products");
  };

  const renderCategoryOptions = () => {
    // const parentCategories = categories.filter((cat) => !cat?.parent);
    // const childCategories = categories.filter((cat) => cat?.parent);

    // Lọc các danh mục cha có trạng thái active ----------------------
    const parentCategories = categories.filter(
      (cat) => !cat?.parent && cat?.status === "active"
    );
    // Lọc các danh mục con có trạng thái active ----------------------
    const childCategories = categories.filter(
      (cat) => cat?.parent && cat?.status === "active"
    );

    return parentCategories.flatMap((parent) => {
      const children = childCategories.filter(
        (child) => child?.parent?._id === parent?._id
      );
      return [
        // <option key={parent?._id} value={parent?._id}>
        //   {parent?.name || ""}
        // </option>,
        <option
          key={parent?._id}
          value={parent?._id}
          disabled
          className="font-bold"
        >
          {parent?.name || ""}
        </option>,
        ...children.map((child) => (
          <option
            key={child?._id}
            value={child?._id}
            className="font-medium text-blue-800"
          >
            {"\u00A0\u00A0\u00A0↳ " + (child?.name || "")}
          </option>
        )),
      ];
    });
  };

  return (
    <div className="relative ">
      {(loading || loadingProduct || categoriesLoading || productsLoading) && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6">
        <h1 className="text-2xl font-normal mb-6">Cập Nhật Sản Phẩm</h1>
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => navigate(`/seller/products/variants/${productId}`)}
            className=" cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Cập nhật biến thể
          </button>
        </div>
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

                      {/* ----------------------- */}

                      {file instanceof File && (
                        <span className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-br">
                          Ảnh mới
                        </span>
                      )}

                      {/* ----------------------- */}
                    </div>
                  );
                })}
              </div>

              {/* ----------------------------- */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className=" hover:border-blue-400 cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="border-t border-gray-200 p-6 flex justify-center space-x-4">
            {/* <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={updating}
          >
            {updating ? "Đang lưu..." : "Cập nhật"}
          </button> */}
            <button
              type="submit"
              className=" cursor-pointer px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              // disabled={updating}
              disabled={updating || updatingStatus}
            >
              {/* {updating ? ( */}
              {updating || updatingStatus ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="ml-2">Đang lưu...</span>
                </div>
              ) : (
                "Cập nhật"
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
        {/* {updating && ( */}
        {(updating || updatingStatus) && (
          // <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          //   <div className="flex flex-col items-center">
          //     <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          //     <p className="mt-4 text-white text-lg">Đang lưu sản phẩm...</p>
          //   </div>
          // </div>
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm p-6 flex justify-center items-center h-screen z-50">
            <div className="flex flex-col items-center">
              {/* <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div> */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-white text-lg">Đang lưu sản phẩm...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
