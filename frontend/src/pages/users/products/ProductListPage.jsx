// ProductListPage.jsx
import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import ProductsCard from "../../../components/products/ProductsCard";
import CategorySidebar from "../../../components/sidebars/CategorySidebar";

// -----------------------GRAPHQL------------------------
const GET_PRODUCTS = gql`
  query Products($filter: ProductFilter, $pagination: PaginationInput) {
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

const GET_CATEGORIES = gql`
  query Query {
    parentCategories {
      items {
        _id
        name
        children {
          _id
          name
        }
      }
    }
  }
`;

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [limit] = useState(20); // mỗi trang 20 sản phẩm
  const [page, setPage] = useState(1); // số trang hiện tại
  const [totalPages, setTotalPages] = useState(1);

  const [sort, setSort] = useState("product");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  const getSortByPrice = () => {
    if (sort === "price-asc") return "ascending";
    if (sort === "price-desc") return "descending";
    return null;
  };

  const { data, loading, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      filter: {
        categoryId: selectedCategory,
        sortByPrice: getSortByPrice(),
        status: "active",
      },
      pagination: { limit, offset: (page - 1) * limit },
    },
    notifyOnNetworkStatusChange: true,
  });
  // Cập nhật danh sách sản phẩm
  useEffect(() => {
    if (data?.products?.items) {
      setProducts(data.products.items);
      if (data.products.total) {
        setTotalPages(Math.ceil(data.products.total / limit));
      }
    }
  }, [data, limit]);

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    refetch({
      filter: { categoryId: selectedCategory, sortByPrice: getSortByPrice() },
      pagination: { limit, offset: 0 },
    });
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
    refetch({
      filter: { categoryId: catId, sortByPrice: getSortByPrice() },
      pagination: { limit, offset: 0 },
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    refetch({
      filter: { categoryId: selectedCategory, sortByPrice: getSortByPrice() },
      pagination: { limit, offset: (newPage - 1) * limit },
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="mt-4 px-4 max-w-[1200px] mx-auto flex gap-6">
      {/* Sidebar danh mục */}
      <CategorySidebar
        categories={categoriesData?.parentCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryClick}
      />

      {/* Main content */}
      <div className="flex-1">
        <h2 className="text-2xl italic mb-4">Tất cả sản phẩm</h2>

        {/* Sorting */}
        <div className="mb-5 flex items-center gap-3">
          <span className="font-medium">Sắp xếp theo:</span>
          <button
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

        {/* Products Grid */}
        {loading && page === 1 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-12 h-12 border-4 border-gray-200 border-l-green-500 rounded-full animate-spin"></div>
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  className="px-3 py-1 cursor-pointer border rounded disabled:opacity-50"
                >
                  ← Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 cursor-pointer border rounded ${
                        page === p
                          ? "bg-[#5aa32a] text-white border-[#5aa32a]"
                          : "bg-white text-[#5aa32a] border-[#5aa32a]"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 cursor-pointer py-1 border rounded disabled:opacity-50"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-10 text-lg">
            Không có sản phẩm nào
          </div>
        )}
      </div>
    </div>
  );
}
