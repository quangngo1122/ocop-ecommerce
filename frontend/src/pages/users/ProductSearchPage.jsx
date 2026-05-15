import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ProductsCard from "../../components/products/ProductsCard";

// -----------------------graphql------------------------
const GET_PRODUCTS_BY_SEARCH = gql`
  query User($filter: ProductFilter, $pagination: PaginationInput) {
    products(filter: $filter, pagination: $pagination) {
      items {
        name
        _id
        description {
          short
        }
        slug
        status
        price {
          max_price
          min_price
        }
        images
        variants {
          _id
        }
        rating {
          average
        }
        shop_id {
          name
          logo
        }
      }
      total
    }
  }
`;

export default function ProductSearchPage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("q");
  const [text, setText] = useState(query || "");
  const [products, setProducts] = useState([]);
  const [limit] = useState(10); // ✅ mỗi trang 15 sp
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("product");

  const getSortByPrice = () => {
    if (sort === "price-asc") return "ascending";
    if (sort === "price-desc") return "descending";
    return null;
  };

  const { data, loading, refetch } = useQuery(GET_PRODUCTS_BY_SEARCH, {
    variables: {
      filter: { name: text, sortByPrice: getSortByPrice(), status: "active" },
      pagination: { limit, offset: (page - 1) * limit },
    },
    notifyOnNetworkStatusChange: true,
  });

  // cập nhật sản phẩm + totalPages
  useEffect(() => {
    if (data?.products?.items) {
      setProducts(data.products.items);
      if (data.products.total) {
        setTotalPages(Math.ceil(data.products.total / limit));
      }
    }
  }, [data, limit]);

  // khi đổi query URL → reset page về 1
  useEffect(() => {
    window.scrollTo(0, 0);
    if (query) {
      setText(query);
      setPage(1);
      refetch({
        filter: {
          name: query,
          sortByPrice: getSortByPrice(),
          status: "active",
        },
        pagination: { limit, offset: 0 },
      });
    }
  }, [query]);

  // khi đổi sort → reset về page 1
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    refetch({
      filter: {
        name: text,
        sortByPrice:
          newSort === "price-asc"
            ? "ascending"
            : newSort === "price-desc"
              ? "descending"
              : null,
        status: "active",
      },
      pagination: { limit, offset: 0 },
    });
  };

  // khi đổi trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    refetch({
      filter: { name: text, sortByPrice: getSortByPrice(), status: "active" },
      pagination: { limit, offset: (newPage - 1) * limit },
    });
    window.scrollTo(0, 0);
  };

  return (
    <div className="mt-4 px-4 max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-2 text-sm text-gray-500">
        <RouterLink to="/" className="hover:underline">
          Trang chủ
        </RouterLink>
        <span className="mx-2">/</span>
        <RouterLink to="/search" className="hover:underline">
          Tìm kiếm
        </RouterLink>
        <span className="mx-2">/</span>
        <span className="font-semibold italic text-gray-700">{text}</span>
      </nav>

      {/* Title */}
      <h2 className="text-2xl italic mb-2">Kết quả tìm kiếm: "{text}"</h2>

      {/* Sorting */}
      <div className="mb-3 flex items-center gap-2 mt-5">
        <span className="font-medium">Sắp xếp theo:</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSortChange("product")}
            className={`px-4 py-1 rounded-full border font-semibold ${
              sort === "product"
                ? "bg-[#5aa32a] text-white border-[#5aa32a]"
                : "bg-white text-[#5aa32a] border-[#5aa32a]"
            }`}
          >
            Sản phẩm
          </button>
          <button
            type="button"
            onClick={() => handleSortChange("price-asc")}
            className={`px-4 py-1 rounded-full border font-semibold ${
              sort === "price-asc"
                ? "bg-[#5aa32a] text-white border-[#5aa32a]"
                : "bg-white text-[#5aa32a] border-[#5aa32a]"
            }`}
          >
            GIÁ THẤP ĐẾN CAO
          </button>
          <button
            type="button"
            onClick={() => handleSortChange("price-desc")}
            className={`px-4 py-1 rounded-full border font-semibold ${
              sort === "price-desc"
                ? "bg-[#5aa32a] text-white border-[#5aa32a]"
                : "bg-white text-[#5aa32a] border-[#5aa32a]"
            }`}
          >
            GIÁ CAO ĐẾN THẤP
          </button>
        </div>
      </div>

      <div className="text-xl my-8 text-[#5aa32a] font-semibold">Sản phẩm</div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-lg">
          Đang tải sản phẩm...
        </div>
      ) : products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductsCard
                key={product._id}
                productId={product._id}
                product={product}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 border rounded ${
                    page === p
                      ? "bg-[#5aa32a] text-white border-[#5aa32a]"
                      : "bg-white text-[#5aa32a] border-[#5aa32a]"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-10 text-lg">
          Không có sản phẩm "{text}"
        </div>
      )}
    </div>
  );
}
