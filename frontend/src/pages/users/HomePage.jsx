import { useState, useEffect, useRef } from "react";
import ProductsCard from "../../components/products/ProductsCard";
import { BannerSlider } from "../../components/banners/BannerSlider";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { encodeId } from "../../utils/encode";

// ------------------ GQL ------------------
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

        variants {
          _id
        }
        shop_id {
          name
          logo
        }
        createdAt
        rating {
          average
        }
        price {
          min_price
          max_price
        }
        sold
      }
    }
  }
`;
const GET_BANNERS = gql`
  query Query {
    banners {
      items {
        image
        createdAt
        status
        title
        _id
      }
    }
  }
`;
// lấy shop
const GET_SHOPS = gql`
  query Shops($filter: ShopsFilter) {
    shops(filter: $filter) {
      items {
        logo
        name
        coverImage
        description
        slug
        _id
      }
    }
  }
`;
export default function HomePage() {
  const navigator = useNavigate();
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { data: shopsData } = useQuery(GET_SHOPS, {
    variables: { filter: { status: "active" } },
  });
  const { data: bannerData } = useQuery(GET_BANNERS);
  const [filterType, setFilterType] = useState("all"); // <- thêm filter
  const limit = 10;
  const productSectionRef = useRef(null);
  const { data, loading, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: {
      pagination: { limit, offset: 0 },
      filter: { status: "active" }, // <-- thêm filter theo status
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (data?.products?.items) {
      setProducts(data.products.items);
      if (data.products.items.length < limit) {
        setHasMore(false);
      }
    }
  }, [data]);

  const handleLoadMore = async () => {
    const nextOffset = offset + limit;
    const res = await fetchMore({
      variables: { pagination: { limit, offset: nextOffset } },
    });
    const newItems = res?.data?.products?.items || [];
    if (newItems.length < limit) {
      setHasMore(false);
    }
    setProducts((prev) => [...prev, ...newItems]);
    setOffset(nextOffset);
  };

  // Lọc + sắp xếp sản phẩm
  const displayedProducts = (() => {
    if (filterType === "newest") {
      return [...products].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    if (filterType === "rating") {
      return [...products].sort(
        (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0)
      );
    }
    if (filterType === "sold") {
      return [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
    }
    // filterType === "all"
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  })();

  // Hàm cuộn xuống khu vực sản phẩm
  const scrollToProducts = () => {
    if (productSectionRef.current) {
      const targetPosition =
        productSectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        200;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 400;
      let start = null;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percent = Math.min(progress / duration, 1);
        window.scrollTo(0, startPosition + distance * percent);
        if (progress < duration) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  };
  const slugify = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  if (loading && products.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-green-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 text-lg">Đang tải sản phẩm...</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4">
      {/* Banner có nút Mua ngay */}
      <BannerSlider scrollToProducts={scrollToProducts} />

      {/* Header + menu filter */}
      <div
        ref={productSectionRef}
        className="mt-5 flex flex-col md:flex-row justify-between items-center text-[#5aa32a] py-3 gap-2 md:gap-0"
      >
        <div className="text-2xl md:text-3xl font-extrabold text-[#5aa32a] text-center md:text-left">
          Sản phẩm
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {["all", "newest", "rating", "sold"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className="font-bold hover:underline cursor-pointer"
            >
              {type === "all"
                ? "Tất cả"
                : type === "newest"
                ? "Mới nhất"
                : type === "rating"
                ? "Đánh giá cao nhất"
                : "Bán chạy nhất"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10">
        {displayedProducts.map((product) => (
          <ProductsCard
            key={product._id}
            productId={product._id}
            product={product}
          />
        ))}
      </div>

      {/* Nút xem thêm */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-[#5aa32a] text-white rounded-lg font-semibold hover:bg-[#478a22] transition"
          >
            Xem thêm
          </button>
        </div>
      )}

      {/* Banner full-width */}
      {bannerData?.banners?.items?.[0]?.image && (
        <div className="relative w-full h-[60vh] overflow-hidden mt-10">
          <img
            src={bannerData.banners.items[0].image}
            alt={bannerData.banners.items[0].title || "Banner OCOP"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Sản phẩm mới nhất */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#5aa32a] mt-10 mb-6">
        Sản phẩm mới nhất
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...products]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
          .map((product) => (
            <ProductsCard
              key={product._id}
              productId={product._id}
              product={product}
            />
          ))}
      </div>

      {/* Danh sách Shop */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#5aa32a] mt-10 mb-6">
        Cơ sở sản xuất, kinh doanh
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
        {shopsData?.shops?.items?.slice(0, 5).map((shop, idx) => (
          <div
            key={idx}
            className="border rounded-lg bg-white shadow hover:shadow-md transition p-4 flex flex-col cursor-pointer"
            onClick={() => {
              const slugName = slugify(shop.name);
              navigator(`/shop/${slugName}-${encodeId(shop?._id)}`);
            }}
          >
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-20 h-20 object-cover rounded mb-3 mx-auto"
              />
            ) : (
              <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs">
                No image
              </div>
            )}
            <h3 className="font-semibold text-gray-800 text-center">
              {shop.name}
            </h3>
            {shop.description && (
              <p className="text-gray-500 text-sm text-center mt-1 line-clamp-2">
                {shop.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
