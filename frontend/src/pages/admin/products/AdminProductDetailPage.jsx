import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useToast } from "../../../contexts/ToastProvider";

// -----------------------GRAPQL-----------------------
const GET_PRODUCT = gql`
  # query Product($id: ID!) {
  #   product(_id: $id) {
  query Product($filter: filterProduct!) {
    product(filter: $filter) {
      _id
      name
      # images {
      #   link
      #   alt
      # }
      # images {
      #   image
      # }
      images
      description {
        short
        full
      }
      category_id {
        name
      }
      price {
        sale
        min_price
        max_price
      }
      rating {
        average
        count
      }
      stock
      status
      shop_id {
        name
      }
      specifications {
        name
        value
      }
      createdAt
      updatedAt
      variants {
        attributes {
          name
          value
        }
        _id
        image
        selling_price
        product_id {
          _id
        }
        sku
        stock_quantity
        height
        weight
        width
        length
      }
    }
  }
`;

// const UPDATE_PRODUCT_STATUS = gql`
//   mutation UpdateProductStatus($id: ID!, $status: ProductStatus!) {
//     updateProductStatus(id: $id, status: $status) {
//       id
//       status
//     }
//   }
// `;
const UPDATE_PRODUCT_STATUS = gql`
  mutation updateProductStatusOKQ($productId: ID!, $status: ProductStatus!) {
    updateProductStatus(productId: $productId, status: $status) {
      _id
      status
    }
  }
`;

// -----------------------GRAPHQL-----------------------

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
}

export default function AdminProductDetailPage() {
  const { id } = useParams();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantPopup, setShowVariantPopup] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();

  const { showToast } = useToast();

  const { data, loading, error, refetch } = useQuery(GET_PRODUCT, {
    variables: { filter: { _id: id } },
    fetchPolicy: "network-only",
  });
  const [updateStatus, { loading: updating }] = useMutation(
    UPDATE_PRODUCT_STATUS
  );
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const openVariantPopup = (variant) => {
    setSelectedVariant(variant);
    setShowVariantPopup(true);
  };

  const closeVariantPopup = () => {
    setShowVariantPopup(false);
    setSelectedVariant(null);
  };

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const openImagePreview = (image) => {
    setPreviewImage(image);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImage(null);
  };

  // const [lensVisible, setLensVisible] = useState(false);
  // const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  // const [lensBackground, setLensBackground] = useState({ x: 50, y: 50 });
  // const zoomRef = React.useRef(null);

  // const handleMouseMove = (e) => {
  //   const rect = zoomRef.current.getBoundingClientRect();
  //   const x = e.clientX - rect.left;
  //   const y = e.clientY - rect.top;

  //   const percentX = (x / rect.width) * 100;
  //   const percentY = (y / rect.height) * 100;

  //   setLensPosition({ x, y });
  //   setLensBackground({ x: percentX, y: percentY });
  //   setLensVisible(true);
  // };

  React.useEffect(() => {
    if (data?.product?.status) setStatus(data.product.status);
  }, [data]);

  if (loading)
    return (
      // // <div className="flex justify-center items-center h-screen">
      // //   Đang tải dữ liệu...
      // // </div>
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
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Lỗi: {error.message}
      </div>
    );
  if (!data?.product)
    return (
      <div className="flex justify-center items-center h-screen">
        Không tìm thấy sản phẩm.
      </div>
    );

  const p = data.product;
  const filteredStatusOptions =
    p.status === "pending"
      ? [
          { value: "active", label: "Đang bán" },
          { value: "suspended", label: "Tạm ngưng" },
          { value: "pending", label: "Chờ duyệt" },
        ]
      : [
          { value: "active", label: "Đang bán" },
          { value: "suspended", label: "Tạm ngưng" },
        ];
  const handleUpdateStatus = async () => {
    try {
      await updateStatus({ variables: { productId: p._id, status } });
      setMessage("Cập nhật trạng thái thành công!");
      showToast("Cập nhật trạng thái thành công!", "success");
      refetch();
    } catch (err) {
      setMessage("Cập nhật trạng thái thất bại: " + err.message);
      showToast("Cập nhật trạng thái thất bại: " + err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* <style>
        {`
          .zoom-container {
            position: relative;
            overflow: hidden;
            cursor: zoom-in;
          }

          .zoom-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .zoom-lens {
            position: absolute;
            pointer-events: none;
            border: 2px solid #000;
            border-radius: 50%;
            width: 150px;
            height: 150px;
            background-repeat: no-repeat;
            background-position: center;
            background-size: 200%;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            transform: translate(-50%, -50%);
            z-index: 10;
          }
          `}
      </style> */}

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Chi tiết sản phẩm
          </h1>
          <button
            onClick={() => navigate(-1)}
            className=" cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Product Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* <div className="md:col-span-1">
            {p.images && p.images.length > 0 ? (
              <img
                // src={p.images[0].link}
                // alt={p.images[0].alt || p.name}
                // src={p.images[0].image}
                // alt={p.name}
                src={p.images[0]}
                alt={p.name}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                Không có ảnh
              </div>
            )}
          </div> */}

          <div className="md:col-span-1">
            {p.images && p.images.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-64 rounded-lg shadow-md relative">
                  <img
                    src={selectedImage || p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover rounded-lg cursor-pointer"
                    onClick={() =>
                      openImagePreview(selectedImage || p.images[0])
                    }
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {p.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`cursor-pointer p-1 rounded-lg border ${
                        selectedImage === image
                          ? "border-blue-500 ring-2 ring-blue-500"
                          : "border-gray-200"
                      } hover:border-blue-400 transition-colors`}
                    >
                      <img
                        src={image}
                        alt={`${p.name} ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                Không có ảnh
              </div>
            )}
          </div>
          {/* <div className="md:col-span-1">
            {p.images && p.images.length > 0 ? (
              <div className="space-y-4">
                <div
                  className="zoom-container w-full h-64 rounded-lg shadow-md relative"
                  onMouseMove={(e) => handleMouseMove(e)}
                  onMouseLeave={() => setLensVisible(false)}
                  ref={zoomRef}
                >
                  <img
                    src={selectedImage || p.images[0]}
                    alt={p.name}
                    className="zoom-image w-full h-full object-cover rounded-lg"
                  />
                  {lensVisible && (
                    <div
                      className="zoom-lens"
                      style={{
                        top: lensPosition.y,
                        left: lensPosition.x,
                        backgroundImage: `url(${selectedImage || p.images[0]})`,
                        backgroundPosition: `${lensBackground.x}% ${lensBackground.y}%`,
                      }}
                    />
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {p.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`cursor-pointer p-1 rounded-lg border ${
                        selectedImage === image
                          ? "border-blue-500 ring-2 ring-blue-500"
                          : "border-gray-200"
                      } hover:border-blue-400 transition-colors`}
                    >
                      <img
                        src={image}
                        alt={`${p.name} ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                Không có ảnh
              </div>
            )}
          </div> */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">
                  Tên sản phẩm:
                </span>{" "}
                {p.name}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Shop:</span>{" "}
                {p.shop_id?.name || "N/A"}
              </div>

              <div>
                <span className="font-semibold text-gray-700">
                  Giá cao nhất:
                </span>{" "}
                {(p.price?.max_price || 0).toLocaleString("vi-VN")} VNĐ
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  Giá thấp nhất:
                </span>{" "}
                {(p.price?.sale || p.price?.min_price || 0).toLocaleString(
                  "vi-VN"
                )}{" "}
                VNĐ
              </div>
              <div>
                <span className="font-semibold text-gray-700">Danh mục:</span>{" "}
                {p.category_id?.name || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Tồn kho:</span>{" "}
                {p.stock}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Trạng thái:</span>{" "}
                <span className="font-semibold text-blue-600">
                  {/* {statusOptions.find((opt) => opt.value === p.status)?.label ||
                    p.status} */}
                  {filteredStatusOptions.find((opt) => opt.value === p.status)
                    ?.label || p.status}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Đánh giá:</span>{" "}
                ⭐ {p.rating?.average?.toFixed(1) || 0} ({p.rating?.count || 0}{" "}
                đánh giá)
              </div>
              <div>
                <span className="font-semibold text-gray-700">Ngày tạo:</span>{" "}
                {formatDate(p.createdAt)}
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  Ngày cập nhật:
                </span>{" "}
                {formatDate(p.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Description Sections */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Mô tả ngắn</h2>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              {p.description?.short || (
                <span className="italic text-gray-400">(Không có)</span>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Mô tả chi tiết
            </h2>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-line">
              {p.description?.full || (
                <span className="italic text-gray-400">(Không có)</span>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Thông số kỹ thuật
            </h2>
            <div className="mt-2 p-2 pl-4 bg-gray-50">
              {p.specifications && p.specifications.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.specifications.map((spec, idx) => (
                    // <li key={idx} className="flex gap-2">
                    //   <span className="font-semibold text-gray-700">
                    //     {spec.name}:
                    //   </span>{" "}
                    //   {spec.value}
                    // </li>
                    <li key={idx} className="flex gap-2 flex-wrap">
                      <span className="font-semibold text-gray-700 whitespace-nowrap">
                        {spec.name}:
                      </span>
                      <span className="break-words">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="italic text-gray-400">(Không có)</span>
              )}
            </div>
          </div>
        </div>
        {p.variants && p.variants.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Danh sách biến thể sản phẩm
            </h2>

            {/* ----------------------------- */}
            {/* <div className="overflow-x-auto"> */}
            {/* ----------------------------- */}

            <div className="hidden md:table min-w-full overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border border-gray-300">
                      ID biến thể
                    </th>
                    <th className="px-4 py-2 border border-gray-300">Ảnh</th>
                    <th className="px-4 py-2 border border-gray-300">
                      Thuộc tính
                    </th>
                    <th className="px-4 py-2 border border-gray-300">SKU</th>
                    <th className="px-4 py-2 border border-gray-300">
                      Tồn kho
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map((v, idx) => (
                    <tr key={v._id || idx}>
                      <td className="px-4 py-2 text-center border border-gray-300 text-xs text-gray-500">
                        {/* {v._id || v.id} */}
                        <button
                          onClick={() => openVariantPopup(v)}
                          title="Xem chi tiết biến thể"
                          className="cursor-pointer break-all w-[90px] text-blue-600 font-bold hover:underline"
                        >
                          {v._id || v.id}
                        </button>
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-center">
                        {v.image ? (
                          <img
                            src={v.image}
                            alt="variant"
                            className="w-14 h-14 object-cover rounded mx-auto"
                          />
                        ) : (
                          <span className="text-gray-400 italic">
                            Không có ảnh
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm">
                        {v.attributes && v.attributes.length > 0 ? (
                          v.attributes.map((a, i) => (
                            <div key={i}>
                              <span className="font-medium">{a.name}:</span>{" "}
                              {a.value}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">Không có</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-center whitespace-nowrap">
                        {v.sku || (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      {/* <td className="px-4 py-2 border border-gray-300 text-center">
                        {v.sku ? (
                          <button
                            onClick={() => openVariantPopup(v)}
                            className="cursor-pointer  text-blue-600 font-bold hover:underline"
                          >
                            {v.sku}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td> */}
                      <td className="px-4 py-2 border border-gray-300 text-center">
                        {v.stock_quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showVariantPopup && selectedVariant && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                    <button
                      onClick={closeVariantPopup}
                      className="absolute cursor-pointer top-2 right-2 text-gray-500 hover:text-black"
                    >
                      ✕
                    </button>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      Chi tiết biến thể
                    </h3>
                    {selectedVariant.image && (
                      <img
                        src={selectedVariant.image}
                        alt="Variant"
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <div>
                          <strong>ID:</strong> {selectedVariant._id}
                        </div>
                        <div className="flex">
                          {/* <strong>Giá:</strong>{" "} */}
                          <p className="text-[red] font-bold">
                            {selectedVariant.selling_price.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </p>
                        </div>
                      </div>
                      <div>
                        <strong>SKU:</strong> {selectedVariant.sku}
                      </div>
                      <div>
                        <strong>Tồn kho:</strong>{" "}
                        {selectedVariant.stock_quantity}
                      </div>

                      <div>
                        <strong>Kích thước (D x R x C):</strong>{" "}
                        {selectedVariant.length} x {selectedVariant.width} x{" "}
                        {selectedVariant.height}
                      </div>
                      <div>
                        <strong>Khối lượng:</strong> {selectedVariant.weight}{" "}
                        gram
                      </div>
                      <div>
                        <strong>Thuộc tính:</strong>
                        <ul className="ml-4 list-disc">
                          {selectedVariant.attributes.map((a, idx) => (
                            <li key={idx}>
                              <strong>{a.name}:</strong> {a.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* note: dạng thẻ khi nửa màn hinh, trên nữa thì ẩn, hiện dạng bảng----------------------------- */}

            <div className="md:hidden ">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {p.variants.map((v, idx) => (
                  <div
                    key={v._id || idx}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {v.image ? (
                        <div className="relative group">
                          <img
                            src={v.image}
                            alt="Variant"
                            className="w-20 h-20 object-cover rounded border border-gray-200 group-hover:scale-105 transition-transform duration-200"
                          />
                          {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              Phóng to
                            </div>
                          </div> */}
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded border border-gray-200 text-gray-500 text-xs">
                          Không có ảnh
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          SKU:{" "}
                          {v.sku || <span className="text-gray-400">-</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tồn kho: {v.stock_quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {v._id || v.id}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">
                        Thuộc tính:
                      </p>
                      {v.attributes && v.attributes.length > 0 ? (
                        <ul className="mt-1 space-y-1 text-sm text-gray-600">
                          {v.attributes.map((a, i) => (
                            <li key={i}>
                              <span className="font-medium">{a.name}:</span>{" "}
                              {a.value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Không có</p>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">
                        Kích thước (D x R x C):
                      </p>
                      <p className="text-sm text-gray-600">
                        {v.length} x {v.width} x {v.height} cm
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        Khối lượng:
                      </p>
                      <p className="text-sm text-gray-600">{v.weight} gram</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ----------------------------- */}
          </div>
        )}

        {/* Status Update Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700">
            Cập nhật trạng thái sản phẩm
          </h2>
          <div className="flex items-center gap-4 mt-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className=" hover:border-blue-400  cursor-pointer px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              disabled={updating}
            >
              {/* {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))} */}
              {filteredStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ${
                updating || status === p.status
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={updating || status === p.status}
            >
              {updating ? "Đang cập nhật..." : "Lưu"}
            </button>
            {message && <span className="text-green-600">{message}</span>}
          </div>
        </div>
      </div>

      {showImagePreview && previewImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full p-4">
            <button
              onClick={closeImagePreview}
              className="absolute top-2 right-2 text-gray-500 hover:text-black cursor-pointer"
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
