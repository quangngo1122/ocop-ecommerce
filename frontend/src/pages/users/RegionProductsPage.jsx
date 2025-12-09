import React, { useState, useEffect } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ProductsCard from "../../components/products/ProductsCard";
import { decodeId } from "../../utils/encode";

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN;

// -----------------------graphql------------------------
const GET_PRODUCTS_BY_REGION = gql`
  query ProductsByRegion($filter: ProductFilter, $pagination: PaginationInput) {
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
// ------------------------END------------------------

export default function RegionProductsPage() {
  const { encodedId } = useParams();
  const districtIdInt = parseInt(decodeId(encodedId), 10);

  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [activeSort, setActiveSort] = useState("all"); // all | asc | desc
  const [page, setPage] = useState(1);
  const limit = 15;

  // ✅ Lấy danh sách quận/huyện (province_id = 220)
  useEffect(() => {
    fetch(`${GHN_API_BASE_URL}district`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
      body: JSON.stringify({ province_id: 220 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) setDistricts(data.data);
      })
      .catch((err) => console.error("Lỗi lấy quận/huyện:", err.message))
      .finally(() => setLoadingDistricts(false));
  }, []);

  // ✅ Lấy sản phẩm theo quận/huyện
  const {
    data: productData,
    loading: loadingProducts,
    refetch,
  } = useQuery(GET_PRODUCTS_BY_REGION, {
    variables: {
      filter: { districtId: districtIdInt, status: "active" },
      pagination: { limit, offset: (page - 1) * limit },
    },
    skip: !districtIdInt,
    notifyOnNetworkStatusChange: true,
  });

  const products = productData?.products?.items || [];
  const total = productData?.products?.total || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const regionName =
    districts.find((d) => d.DistrictID === districtIdInt)?.DistrictName || "";

  // ✅ Sắp xếp
  const handleSort = (type) => {
    setActiveSort(type);
    setPage(1);
    let filter = { districtId: districtIdInt, status: "active" };
    if (type === "asc") filter.sortByPrice = "ascending";
    if (type === "desc") filter.sortByPrice = "descending";
    refetch({ filter, pagination: { limit, offset: 0 } });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);

    let filter = { districtId: districtIdInt, status: "active" };
    if (activeSort === "asc") filter.sortByPrice = "ascending";
    if (activeSort === "desc") filter.sortByPrice = "descending";

    refetch({
      filter,
      pagination: { limit, offset: (newPage - 1) * limit },
    });
  };

  if (loadingDistricts || loadingProducts) {
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
          Sản phẩm khu vực {regionName}
        </span>
      </nav>

      {/* Sorting */}
      <div className="mb-3 flex items-center gap-3 mt-5">
        <span className="font-medium">Sắp xếp theo:</span>

        <button
          className={`px-4 cursor-pointer py-1 rounded-full border ${
            activeSort === "all"
              ? "bg-[#5aa32a] text-white border-[#5aa32a]"
              : "bg-white text-[#5aa32a] border-[#5aa32a]"
          }`}
          onClick={() => handleSort("all")}
        >
          TẤT CẢ
        </button>

        <button
          className={`px-4 py-1 cursor-pointer rounded-full border ${
            activeSort === "asc"
              ? "bg-[#5aa32a] text-white border-[#5aa32a]"
              : "bg-white text-[#5aa32a] border-[#5aa32a]"
          }`}
          onClick={() => handleSort("asc")}
        >
          GIÁ THẤP ĐẾN CAO
        </button>

        <button
          className={`px-4 py-1 cursor-pointer rounded-full border ${
            activeSort === "desc"
              ? "bg-[#5aa32a] text-white border-[#5aa32a]"
              : "bg-white text-[#5aa32a] border-[#5aa32a]"
          }`}
          onClick={() => handleSort("desc")}
        >
          GIÁ CAO ĐẾN THẤP
        </button>
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
          Không có sản phẩm trong khu vực {regionName}
        </div>
      )}
    </div>
  );
}
