import React, { useEffect, useState, useContext } from "react";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate, useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { useToast } from "../../../contexts/ToastProvider";
import { CartContext } from "../../../contexts/CartProvider";
import CircularProgress from "@mui/material/CircularProgress";
import { decodeId, encodeId } from "../../../utils/encode";

// ----------------graphql------------------------
const QUERY_PRODUCTS = gql`
  query User($filter: filterProduct!) {
    product(filter: $filter) {
      name
      images
      stock
      slug
      description {
        short
        full
      }
      _id
      price {
        sale
        min_price
        max_price
      }
      shop_id {
        _id
        name
        description
        logo
        coverImage
      }
      variants {
        _id
        selling_price
        attributes {
          name
          value
        }
        stock_quantity
      }
      specifications {
        value
        name
      }
      rating {
        count
        average
      }
      sold
    }
  }
`;
// lấy đánh giá
const QUERY_REVIEWS = gql`
  query ProductReviews($productId: ID!, $filter: ReviewFilter) {
    productReviews(productId: $productId, filter: $filter) {
      items {
        content
        rating
        user_id {
          avatar
          fullName
        }
        status
        reply {
          content
        }
      }
    }
  }
`;
export default function ProductDetailPage() {
  const { showToast } = useToast();
  const { encodedId } = useParams();
  const productId = decodeId(encodedId);
  const [maxQuantity, setMaxQuantity] = useState(1); // số lượng tối đa của variant

  // loading
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isVisitingShop, setIsVisitingShop] = useState(false);
  // hàm điều hướng
  const navigate = useNavigate();
  const { handleAddToCart } = useContext(CartContext);
  const [detailProduct, setDetailProduct] = useState({});
  const [reviews, setReviews] = useState([]);

  const [shop, setShop] = useState({});
  const [priceVariant, setPriceVariant] = useState({});
  const {
    data,
    loading: loadingProduct,
    error: errorProduct,
  } = useQuery(QUERY_PRODUCTS, {
    skip: !productId,
    variables: { filter: { _id: productId } },
  });
  const { data: dataReviews, loading: loadingReviews } = useQuery(
    QUERY_REVIEWS,
    {
      variables: {
        productId: productId,
        filter: { status: "approved" },
      },
    }
  );
  useEffect(() => {
    if (dataReviews?.productReviews?.items) {
      setReviews(dataReviews.productReviews.items);
    }
  }, [dataReviews]);
  const product = data?.product;

  useEffect(() => {
    if (data) {
      setDetailProduct(data?.product);
    }
  }, [data, productId]);
  useEffect(() => {
    if (detailProduct?.images?.length > 0) {
      setSelectedImage(detailProduct.images[0]);
    }
  }, [detailProduct]);
  // Thêm state management
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [quantity, setQuantity] = useState(1);
  const handleSelect = (name, value) => {
    setSelectedSpecs((prev) => {
      if (prev[name] === value) {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      } else {
        return { ...prev, [name]: value };
      }
    });
  };
  const handleAddProductToCartWithLoading = async (
    product,
    selectedSpecs,
    quantity,
    e
  ) => {
    setIsAddingToCart(true);
    try {
      const success = await handleAddProductToCart(
        product,
        selectedSpecs,
        quantity,
        e
      );
      return success;
    } finally {
      setIsAddingToCart(false);
    }
  };
  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddProductToCart = async (
    product,
    selectedSpecs,
    quantity,
    e
  ) => {
    const allSpecsSelected = Object.keys(groupedAttributes).every(
      (name) => selectedSpecs[name]
    );

    if (!allSpecsSelected) {
      showToast("Vui lòng chọn đầy đủ thuộc tính sản phẩm");
      return false;
    }

    const matchedVariant = product?.variants?.find((variant) =>
      variant.attributes.every(
        (attr) => selectedSpecs[attr.name] === attr.value
      )
    );

    if (!matchedVariant) {
      showToast("Không tìm thấy phiên bản sản phẩm phù hợp");
      return false;
    }

    await handleAddToCart(
      {
        ...product,
        variantId: matchedVariant._id,
        quantity,
      },
      e
    );
    return true; // thành công
  };

  const formatPrice = (price) => {
    if (!price) return "";
    return price.toLocaleString("vi-VN") + " ₫";
  };
  useEffect(() => {
    if (data) {
      setDetailProduct(data?.product);
      setSelectedImage(data.product.images[0]);
    }
  }, [data, productId]);
  useEffect(() => {
    if (detailProduct?.shop_id) {
      setShop(detailProduct?.shop_id);
    }
  }, [detailProduct]);
  useEffect(() => {
    if (detailProduct?.variants?.length > 0) {
      // Tìm variant khớp với toàn bộ thuộc tính đã chọn
      const matchedVariant = detailProduct.variants.find((variant) =>
        variant.attributes.every(
          (attr) => selectedSpecs[attr.name] === attr.value
        )
      );

      if (matchedVariant) {
        setPriceVariant(matchedVariant); // set đúng biến thể
      } else {
        setPriceVariant(null); // reset khi chưa chọn đủ
      }
    }
  }, [detailProduct, selectedSpecs]);

  const slugify = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  const groupedAttributes = {};

  detailProduct?.variants?.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      if (!groupedAttributes[attr.name]) {
        groupedAttributes[attr.name] = new Set();
      }
      groupedAttributes[attr.name].add(attr.value);
    });
  });
  // Cập nhật maxQuantity khi chọn variant
  useEffect(() => {
    if (priceVariant) {
      setQuantity(1); // reset số lượng khi chọn variant mới
      setMaxQuantity(priceVariant.stock_quantity || 0);
    } else {
      setMaxQuantity(detailProduct.stock || 0); // chưa chọn đủ thuộc tính → dùng stock chung
    }
  }, [priceVariant, detailProduct]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (loadingProduct || loadingReviews) return;
    if (data) {
      setDetailProduct(data.product);
      setSelectedImage(data.product.images?.[0] || null);
    }
    if (dataReviews?.productReviews?.items) {
      setReviews(dataReviews.productReviews.items);
    }
    if (data?.product?.shop_id) {
      setShop(data.product.shop_id);
    }
  }, [data, dataReviews, loadingProduct, loadingReviews]);

  // Nếu đang load dữ liệu → hiện spinner
  if (loadingProduct || loadingReviews || !detailProduct) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <CircularProgress size={50} color="inherit" />
      </div>
    );
  }

  if (errorProduct) {
    return (
      <p className="text-red-500">
        Lỗi khi tải sản phẩm: {errorProduct.message}
      </p>
    );
  }

  return (
    <>
      <div className="pt-10 flex items-center bg-gray-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-100">
              <div className="relative">
                <img
                  src={
                    selectedImage ||
                    detailProduct?.images?.[0] ||
                    "/fallback.jpg"
                  }
                  alt={detailProduct?.name || "Product image"}
                  className="w-full h-[350px] rounded-lg shadow-lg object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {detailProduct?.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`p-2 rounded-lg ${
                      selectedImage === image ? "ring-2 ring-[#5aa32a]" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${detailProduct?.name} ${index + 1}`}
                      className="w-full rounded-lg object-cover cursor-pointer h-20"
                    />
                  </button>
                ))}
              </div>
            </div>
            {/* Phần thông tin sản phẩm */}
            <div className="lg:w-1/2">
              <h1 className="text-2xl font-bold w-100 text-gray-900">
                {detailProduct?.name}
              </h1>
              <div className="mt-4 flex items-center">
                <div className="flex items-center mt-3">
                  <div className="flex space-x-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const rating = detailProduct.rating?.average || 0;
                      const filled = idx < Math.floor(rating);
                      const half =
                        idx === Math.floor(rating) && rating % 1 >= 0.5;
                      return (
                        <svg
                          key={idx}
                          viewBox="0 0 24 24"
                          fill={filled ? "gold" : half ? "url(#half)" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="w-5 h-5 text-yellow-500"
                        >
                          {half && (
                            <defs>
                              <linearGradient id="half">
                                <stop offset="50%" stopColor="gold" />
                                <stop offset="50%" stopColor="transparent" />
                              </linearGradient>
                            </defs>
                          )}
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      );
                    })}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">
                    {detailProduct.rating?.average?.toFixed(1) || "0.0"} (
                    {detailProduct.rating?.count || 0} đánh giá)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <span className="text-[20px] font-bold text-red-600">
                  {priceVariant
                    ? formatPrice(priceVariant.selling_price) // có biến thể -> hiện selling_price
                    : formatPrice(detailProduct?.price?.min_price)}{" "}
                  {/* chưa chọn -> hiện min_price */}
                </span>
              </div>
              {detailProduct.specifications?.length > 0 && (
                <div className="mt-6 w-full max-w-sm break-words">
                  <h3 className="text-lg font-semibold mb-2 break-words">
                    Thông số sản phẩm
                  </h3>
                  <ul className="list-disc list-inside w-full break-words">
                    {detailProduct.specifications.map((spec) => (
                      <li
                        key={spec.name}
                        className="text-gray-700 mb-1 break-words"
                      >
                        {spec.name}: {spec.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="text-lg mt-5 font-semibold">
                Thuộc tính sản phẩm
              </h3>
              {Object.entries(groupedAttributes).map(([name, values]) => (
                <div className="mt-2" key={name}>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[...values].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleSelect(name, value)}
                        className={`px-3 py-1 text-sm cursor-pointer rounded-md transition
            ${
              selectedSpecs[name] === value
                ? "bg-[#5aa32a] text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Số lượng</h3>
                <div className="flex items-center mt-2">
                  {/* Nút trừ */}
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 cursor-pointer border border-gray-300 rounded-l-md hover:bg-gray-100"
                  >
                    -
                  </button>

                  {/* Input số */}
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val > maxQuantity) setQuantity(maxQuantity);
                      else if (val < 1) setQuantity(1);
                      else setQuantity(val);
                    }}
                    className="w-20 px-3 py-1 text-center border-t border-b border-gray-300
  appearance-none
  [&::-webkit-inner-spin-button]:appearance-none
  [&::-webkit-outer-spin-button]:appearance-none
  [moz-appearance:textfield]"
                  />

                  {/* Nút cộng */}
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 cursor-pointer border border-gray-300 rounded-r-md hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-3 text-gray-700">
                <span className="font-medium">Tồn kho: </span>
                {maxQuantity > 0 ? (
                  <span>{maxQuantity} sản phẩm</span>
                ) : (
                  <span className="text-red-500">Hết hàng</span>
                )}
              </div>

              <div className="flex mt-8 gap-3">
                {/* Thêm vào giỏ hàng */}
                <button
                  className="text-sm px-6 py-3 rounded-lg font-semibold
      bg-green-500 text-white shadow-md
      hover:bg-green-600
      focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1
      transition-all duration-200 ease-in-out
      flex items-center justify-center cursor-pointer min-w-[150px]"
                  onClick={(e) =>
                    handleAddProductToCartWithLoading(
                      product,
                      selectedSpecs,
                      quantity,
                      e
                    )
                  }
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    "Thêm vào giỏ hàng"
                  )}
                </button>

                {/* Mua ngay - nổi bật hơn */}
                <button
                  className="text-sm px-6 cursor-pointer py-3 rounded-lg font-bold
      bg-gradient-to-r from-yellow-400 to-yellow-500
      text-white shadow-lg
      hover:from-yellow-500 hover:to-yellow-600
      focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1
      transition-all duration-200 ease-in-out
      flex items-center justify-center min-w-[150px]"
                  onClick={async (e) => {
                    const success = await handleAddProductToCartWithLoading(
                      product,
                      selectedSpecs,
                      quantity,
                      e
                    );
                    if (success) {
                      const selectedVariantId = detailProduct.variants.find(
                        (variant) =>
                          variant.attributes.every(
                            (attr) => selectedSpecs[attr.name] === attr.value
                          )
                      )?._id;

                      if (selectedVariantId) {
                        navigate("/cart", {
                          state: { newItems: [selectedVariantId] },
                        });
                      } else {
                        showToast(
                          "Không tìm thấy biến thể sản phẩm để chuyển sang giỏ hàng"
                        );
                      }
                    }
                  }}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    "Mua ngay"
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Shop info */}
          <div className="flex items-center gap-5 mt-10 mb-10">
            <img
              src={detailProduct?.shop_id?.logo}
              alt="Shop Avatar"
              className="w-16 h-16 rounded-full border object-cover"
            />
            <div className="text-gray-600 flex flex-col">
              <p className="mb-2 font-medium">{detailProduct?.shop_id?.name}</p>
              <button
                onClick={() => {
                  setIsVisitingShop(true);
                  const slug = slugify(shop.name);
                  setTimeout(() => {
                    navigate(`/shop/${slug}-${encodeId(shop._id)}`);
                  }, 100);
                }}
                className="flex items-center cursor-pointer justify-center gap-1 bg-[#5aa32a] text-white px-3 py-1 rounded text-sm hover:bg-[#5aa32a] transition w-fit min-w-[120px]"
                disabled={isVisitingShop}
              >
                {isVisitingShop ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <>
                    <StorefrontIcon fontSize="small" />
                    Thăm gian hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
          Đánh giá sản phẩm
        </h2>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg shadow flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rev.user_id.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="font-semibold text-green-500">
                    {rev.user_id.fullName || "Người dùng"}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">{rev.content}</p>
                {rev.reply?.content && (
                  <div className="mt-2 p-2 bg-gray-100 rounded border-l-4 border-green-500">
                    <p className="font-medium text-gray-800">
                      Phản hồi từ Shop
                    </p>
                    <p className="text-gray-700 text-sm">{rev.reply.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        )}
      </div>

      <div className="h-full w-full mt-5 py-10">
        <div className="flex">
          <div className="left-0 px-30">
            <h1 className="text-2xl text-red-600  font-bold">GIỚI THIỆU</h1>

            <div className="text-justify leading-relaxed text-gray-800">
              <p className="mt-4">{detailProduct?.description?.full}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
