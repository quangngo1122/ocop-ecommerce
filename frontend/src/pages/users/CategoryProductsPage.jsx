import React, { useState, useEffect } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ProductsCard from "../../components/products/ProductsCard";
import { decodeId } from "../../utils/encode";

// -----------------------graphql------------------------
const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory(
    $filter: ProductFilter
    $pagination: PaginationInput
  ) {
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
        shop_id {
          logo
          name
        }
      }
      total
    }
  }
`;

const GET_CATEGORY = gql`
  query Category($id: ID!) {
    category(_id: $id) {
      _id
      name
    }
  }
`;
// ------------------------END------------------------

export default function CategoryProductsPage() {
  const { slug } = useParams();
  let categoryId = null;
  let categorySlugName = null;
  try {
    if (slug.includes(".")) {
      const parts = slug.split(".");
      categorySlugName = parts[0];
      const encodedId = parts.pop();
      categoryId = decodeId(encodedId);
    } else {
      categoryId = decodeId(slug);
    }
  } catch (err) {
    console.error("Invalid category slug:", slug);
  }

  const [sort, setSort] = useState("product");
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data: categoryData, loading: loadingCategory } = useQuery(
    GET_CATEGORY,
    {
      variables: { id: categoryId },
      skip: !categoryId,
    }
  );

  const {
    data: productData,
    loading: loadingProducts,
    refetch,
  } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: {
      filter: { categoryId, status: "active" },
      pagination: { limit, offset: (page - 1) * limit },
    },
    skip: !categoryId,
    notifyOnNetworkStatusChange: true,
  });

  const category = categoryData?.category || null;
  const products = productData?.products?.items || [];
  const total = productData?.products?.total || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    refetch({
      filter: {
        categoryId,
        status: "active",
        sortByPrice:
          newSort === "price-asc"
            ? "ascending"
            : newSort === "price-desc"
            ? "descending"
            : null,
      },
      pagination: { limit, offset: 0 },
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    refetch({
      filter: {
        categoryId,
        status: "active",
        sortByPrice:
          sort === "price-asc"
            ? "ascending"
            : sort === "price-desc"
            ? "descending"
            : null,
      },
      pagination: { limit, offset: (newPage - 1) * limit },
    });
  };

  if (loadingCategory || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 px-4 max-w-[1200px] mx-auto">
      <nav className="mb-2 text-sm text-gray-500">
        <RouterLink to="/" className="hover:underline">
          Trang chủ
        </RouterLink>
        <span className="mx-2">/</span>
        <span className="font-semibold italic text-gray-700">
          {category?.name || "Danh mục"}
        </span>
      </nav>

      <h2 className="text-2xl italic mb-2">Danh mục: "{categorySlugName}"</h2>

      {/* Sorting */}
      <div className="mb-3 flex items-center gap-2 mt-5">
        <span className="font-medium">Sắp xếp theo:</span>
        <div className="flex gap-3">
          {["product", "price-asc", "price-desc"].map((s) => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`px-4 py-1 rounded-full border font-semibold ${
                sort === s
                  ? "bg-[#5aa32a] text-white border-[#5aa32a]"
                  : "bg-white text-[#5aa32a] border-[#5aa32a]"
              }`}
            >
              {s === "product"
                ? "Sản phẩm"
                : s === "price-asc"
                ? "GIÁ THẤP ĐẾN CAO"
                : "GIÁ CAO ĐẾN THẤP"}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xl my-8 text-[#5aa32a] font-semibold">Sản phẩm</div>

      {products.length > 0 ? (
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
          Không có sản phẩm trong danh mục "{category?.name}"
        </div>
      )}
    </div>
  );
}
