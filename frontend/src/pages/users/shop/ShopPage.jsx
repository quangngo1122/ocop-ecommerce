import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ShopHeader from "../../../components/user/shop/ShopHeader";
import ProductsCard from "../../../components/products/ProductsCard";
import CircularProgress from "@mui/material/CircularProgress";
import { decodeId, encodeId } from "../../../utils/encode";

// --------------------- GraphQL ------------------------
const GET_PRODUCTS_BY_SHOP = gql`
  query Product($shopId: ID!) {
    shopProducts(shopId: $shopId) {
      items {
        _id
        name
        slug
        images
        price {
          min_price
          max_price
        }
        shop_id {
          name
          logo
        }
      }
    }
  }
`;

const GET_SHOP_BY_ID = gql`
  query Query($filter: ShopFilter!) {
    shop(filter: $filter) {
      logo
      name
      coverImage
      businessLicense {
        name
        images
        description
        code
        _id
      }
      description
    }
  }
`;

export default function ShopPage() {
  const { slug } = useParams();
  const [tab, setTab] = useState("products");
  const [shop, setShop] = useState({});
  const [products, setProducts] = useState([]);
  const encodedId = slug.split("-").pop(); // lấy phần id encode trong URL
  const shopId = decodeId(encodedId);
  // modal ảnh giấy phép
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [currentLicenseImg, setCurrentLicenseImg] = useState("");

  // Query shop
  const { data: shopData } = useQuery(GET_SHOP_BY_ID, {
    variables: { filter: { _id: shopId } },
    skip: !shopId,
  });

  // Query sản phẩm
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_SHOP, {
    variables: { shopId },
    skip: !shopId,
  });

  // set shop vào state
  useEffect(() => {
    if (shopData?.shop) {
      setShop(shopData.shop);
    }
  }, [shopData]);

  // set products vào state
  useEffect(() => {
    if (data?.shopProducts?.items) {
      setProducts(data.shopProducts.items);
    }
  }, [data]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress size={40} />
      </div>
    );
  if (error)
    return <p className="text-red-500">Lỗi khi tải dữ liệu: {error.message}</p>;
  return (
    <div className="max-w-6xl mx-auto p-4">
      <ShopHeader shop={shop} />
      <div className="flex gap-6 mt-6 border-b">
        <button
          onClick={() => setTab("products")}
          className={`pb-2 ${
            tab === "products"
              ? "border-b-2 cursor-pointer border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => setTab("about")}
          className={`pb-2 cursor-pointer ${
            tab === "about"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          Giới thiệu
        </button>
      </div>
      <div className="mt-10 px-4 max-w-[1200px] mx-auto">
        {tab === "products" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products?.map((product) => (
              <ProductsCard
                key={product._id}
                productId={product._id}
                product={product}
              />
            ))}
          </div>
        )}

        {/* Tab Giới thiệu */}
        {tab === "about" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold border-b pb-2 mb-4">
              Giới thiệu shop
            </h2>

            {/* Mô tả shop */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Mô tả</h3>
              <p className="text-gray-700 leading-relaxed">
                {shop?.description || "Chưa có mô tả."}
              </p>
            </div>

            {/* Giấy phép kinh doanh */}
            {shop?.businessLicense?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shop.businessLicense.map((license) => (
                  <div
                    key={license._id}
                    className="bg-white shadow-lg rounded-lg p-5 hover:shadow-xl transition-shadow duration-300"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {license.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{license.description}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      Mã: {license.code}
                    </p>
                    {/* Ảnh giấy phép */}
                    <div className="flex flex-wrap gap-2">
                      {license.images?.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={license.name}
                          className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                          onClick={() => {
                            setCurrentLicenseImg(img);
                            setLicenseModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Chưa có giấy phép kinh doanh.
              </p>
            )}
          </div>
        )}
      </div>
      {/* Modal xem ảnh giấy phép */}
      {licenseModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setLicenseModalOpen(false)}
        >
          <img
            src={currentLicenseImg}
            alt="Giấy phép"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
