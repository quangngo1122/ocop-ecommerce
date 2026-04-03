import React, { useContext, useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase.config";
import { useToast } from "../contexts/ToastProvider";
import { gql, useQuery } from "@apollo/client";
import { encodeId } from "../utils/encode";
import { CartContext } from "../contexts/CartProvider";
const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN;

// -----------------------------GQL-----------------------------
// lấy danh mục
const GET_CATEGORY = gql`
  query Query {
    parentCategories {
      items {
        name
        children {
          name
          _id
        }
        _id
      }
    }
  }
`;

// kiểm tra shop có đang chờ duyệt
const MY_SHOP_QUERY = gql`
  query Query($filter: ShopFilter!) {
    shop(filter: $filter) {
      _id
      status
    }
  }
`;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, refetch } = useContext(CartContext);

  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const { data: getCategories } = useQuery(GET_CATEGORY);
  const { showToast } = useToast();
  const [categories, setCategory] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [statusShop, setStatusShop] = useState("");
  const { userData } = useContext(AuthContext);
  const [searchText, setSearchText] = useState("");

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      showToast("Đăng xuất thành công", "success");
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (err) {
      showToast("Lỗi khi đăng xuất", "error");
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleSearch = () => {
    if (searchText === "") return;
    setLoadingSearch(true);
    navigate(`/search?q=${encodeURIComponent(searchText)}`);
  };

  const { data: getShopStatus } = useQuery(MY_SHOP_QUERY, {
    variables: { filter: { owner: userData?._id } },
  });

  useEffect(() => {
    if (getShopStatus?.shop) setStatusShop(getShopStatus.shop.status);
  }, [getShopStatus]);

  useEffect(() => {
    if (location.pathname === "/") setSearchText("");
  }, [location.pathname]);

  useEffect(() => {
    if (getCategories) {
      setCategory(getCategories.parentCategories.items);
      setLoadingCategories(false);
    }
  }, [getCategories]);

  useEffect(() => {
    // Lấy danh sách quận/huyện của Cần Thơ (province_id = 92)
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
        if (data.code === 200) setProvinces(data.data); // bây giờ data.data là quận/huyện
      })
      .catch((err) => console.error("Lỗi lấy quận/huyện:", err.message))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    setLoadingSearch(false);
    setCategoryMenuOpen(false);
    setRegionMenuOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return (
    <div className="w-full pt-5 h-auto sticky top-0 z-50 bg-white shadow-md">
      <div className="w-full">
        {/* Header trên cùng */}
        <div className="flex md:w-full flex-col md:flex-row justify-between items-center gap-2">
          <h1 className="text-[#5aa32a] md:ml-20 font-bold text-sm md:text-base text-center md:text-left">
            SÀN THƯƠNG MẠI ĐIỆN TỬ CẦN THƠ
          </h1>
          <div className="flex flex-wrap md:mr-20 justify-center md:justify-end items-center gap-3">
            <div className="flex gap-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-[#5aa32a]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>

              {userData?.fullName ? (
                statusShop !== undefined ? ( // kiểm tra statusShop đã có dữ liệu chưa
                  <button
                    onClick={() =>
                      navigate(statusShop ? "/seller" : "/register-seller")
                    }
                    className="text-sm text-[#5aa32a] font-bold cursor-pointer"
                  >
                    Shop của tôi
                  </button>
                ) : (
                  <span className="text-sm text-[#5aa32a] font-semibold animate-pulse">
                    Đang tải...
                  </span>
                )
              ) : (
                <span className="text-sm text-[#5aa32a] cursor-default">
                  Xin chào
                </span>
              )}
            </div>

            {userData?.fullName ? (
              <>
                <div className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-[#5aa32a]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  <Link
                    to="/me/profile"
                    className="text-sm text-[#5aa32a] font-bold"
                  >
                    {userData.fullName}
                  </Link>
                </div>
                <div
                  className="flex gap-1 items-center cursor-pointer"
                  onClick={handleLogout}
                >
                  {loadingLogout ? (
                    <span className="text-sm text-[#5aa32a] font-bold">
                      Đang đăng xuất...
                    </span>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-[#5aa32a]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                        />
                      </svg>
                      <span className="text-sm text-[#5aa32a] font-bold">
                        Đăng xuất
                      </span>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-[#5aa32a]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  <Link
                    to="/login"
                    className="text-sm text-[#5aa32a] font-bold"
                  >
                    Đăng nhập
                  </Link>
                </div>
                <div className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-[#5aa32a]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                    />
                  </svg>
                  <Link
                    to="/register"
                    className="text-sm text-[#5aa32a] font-bold"
                  >
                    Đăng ký
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Logo + Search + Cart */}
        <div className="flex flex-row w-full items-center justify-evenly py-2 gap-4">
          <div
            onClick={() => navigate("/")}
            className="w-24 md:w-32 md:ml-40 cursor-pointer"
          >
            <img src="/logo.jpg" alt="Logo" className="w-full h-auto" />
          </div>
          <div className="flex items-center md:w-full md:max-w-[600px] border border-[#5aa32a] px-3 py-2 rounded-full shadow-sm bg-white">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-grow bg-transparent text-sm outline-none"
            />
            <button
              disabled={searchText === "" || loadingSearch}
              onClick={handleSearch}
              type="submit"
              className="ml-2 px-4 py-1 cursor-pointer bg-[#5aa32a] text-white rounded-full text-sm font-semibold flex items-center justify-center disabled:opacity-50"
            >
              {loadingSearch ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                "Tìm kiếm"
              )}
            </button>
          </div>

          <Link to="/cart" className="relative flex md:mr-50 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 text-[#5aa32a]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="bg-[#5aa32a] flex w-full py-2">
          <div className="max-w-7xl mx-auto flex items-start justify-between px-4">
            {/* Nút menu mobile */}
            <button
              onClick={() =>
                document
                  .getElementById("mobile-menu")
                  .classList.toggle("hidden")
              }
              className="text-white md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            {/* Menu desktop */}
            <div
              id="mobile-menu"
              className="hidden md:flex items-center gap-8 text-white text-sm font-bold"
            >
              <p onClick={() => navigate("/")} className="cursor-pointer">
                TRANG CHỦ
              </p>

              {/* DANH MỤC SẢN PHẨM */}
              <div className="relative select-none">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  <p>DANH MỤC SẢN PHẨM</p>
                </div>

                {categoryMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white text-black rounded shadow-lg z-20 max-h-[400px] overflow-y-auto">
                    <ul>
                      {loadingCategories ? (
                        <li className="px-4 py-2 text-gray-500">Đang tải...</li>
                      ) : (
                        categories.map((category) => {
                          const isOpen = openCategories[category._id] || false;
                          return (
                            <li key={category._id}>
                              <div
                                onClick={() =>
                                  setOpenCategories((prev) => ({
                                    ...prev,
                                    [category._id]: !prev[category._id],
                                  }))
                                }
                                className="px-4 py-2 font-bold hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                              >
                                <span>{category.name}</span>
                                {category.children?.length > 0 && (
                                  <svg
                                    className={`w-4 h-4 transform transition-transform ${
                                      isOpen ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                )}
                              </div>

                              {isOpen && category.children?.length > 0 && (
                                <ul className="ml-4 border-l border-gray-200">
                                  {category.children.map((child) => (
                                    <li
                                      key={child._id}
                                      onClick={() => {
                                        setCategoryMenuOpen(false);
                                        navigate(
                                          `/product/category/${child.name
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")}.${encodeId(
                                            child._id,
                                          )}`,
                                        );
                                      }}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                      {child.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <p
                onClick={() => navigate("/products")}
                className="cursor-pointer"
              >
                SẢN PHẨM
              </p>

              {/* KHU VỰC */}
              <div className="relative">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  <p>KHU VỰC</p>
                </div>

                {regionMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-20 max-h-[300px] overflow-y-auto">
                    <ul>
                      {loadingProvinces ? (
                        <li className="px-4 py-2 text-gray-500">Đang tải...</li>
                      ) : (
                        provinces.map((district) => (
                          <li
                            key={district.DistrictID}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setRegionMenuOpen(false);
                              navigate(
                                `/district/${encodeId(district.DistrictID)}`,
                              );
                            }}
                          >
                            {district.DistrictName}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
