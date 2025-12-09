// code silderbar 2 file Sidebar và resizeSidebar, sử dụng nếu muốn 2 file thay j gộp 1 file

import React, { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { useQuery, gql } from "@apollo/client";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import DiscountIcon from "@mui/icons-material/Discount";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { AuthContext } from "../../contexts/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase.config";
import { useToast } from "../../contexts/ToastProvider";
import DonutSmallIcon from "@mui/icons-material/DonutSmall";
// -----------------------GRAPHQL-----------------------
const SHOPS_QUERY = gql`
  query Shops {
    shops {
      items {
        logo
        owner {
          _id
        }
      }
    }
  }
`;
// -----------------------GRAPHQL-----------------------
export default function ResizeSellerSidebar() {
  const navigate = useNavigate();
  // const { userData, shopData } = useContext(AuthContext);
  const { userData } = useContext(AuthContext);

  const userId = userData?._id;

  const location = useLocation();
  const { data: shopsData, loading: shopsLoading } = useQuery(SHOPS_QUERY);

  const myShop = shopsData?.shops?.items?.find(
    (shop) => shop.owner?._id === userId
  );

  const { showToast } = useToast();
  const isActive = (path) => {
    if (path === "/seller" || path === "/seller/") {
      return (
        location.pathname === "/seller" || location.pathname === "/seller/"
      );
    }
    if (path === "/seller/setting") {
      return location.pathname.startsWith("/seller/setting");
    }
    if (path === "/seller/products") {
      return location.pathname.startsWith("/seller/products");
    }
    if (path === "/seller/warehouse") {
      return location.pathname.startsWith("/seller/warehouse");
    }
    if (path === "/seller/orders") {
      return location.pathname.startsWith("/seller/orders");
    }
    return location.pathname === path;
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Đăng xuất thành công!", "success");
    } catch (e) {}
    localStorage.removeItem("accessToken");
    // navigate("/");
    window.location.href = "/";
  };

  return (
    <div>
      <div className="w-16 bg-[#2A303C] text-white fixed h-full overflow-auto">
        <div className="p-0">
          <Link to="/seller/setting">
            <div
              title="Logo"
              className="flex justify-center items-center gap-3 mb-4 mt-4"
            >
              <img
                src={myShop?.logo}
                // src={shopData?.logo}
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          </Link>

          <Link to="/seller/profile">
            <div
              title="Avatar"
              className="flex items-center gap-3 justify-center mb-6 bg-[#1F242D] rounded-lg"
            >
              <img
                src={userData?.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            </div>
          </Link>

          <nav className="space-y-1">
            <div className="mb-3 border-b border-gray-600">
              <div className="mb-3">
                <Link
                  to="/seller"
                  title="Thống kê"
                  className={`flex mb-2 justify-center items-center gap-2 p-2 rounded transition-colors ${
                    isActive("/seller")
                      ? "bg-[#5aa32a] text-white"
                      : "hover:bg-[#1F242D]"
                  }`}
                >
                  <span className="w-6 h-6 mb-2">
                    <LeaderboardIcon className="text-blue-400 mb-2" />
                  </span>
                </Link>
                <Link
                  to="/seller/statistical"
                  className={`flex mb-2 justify-center items-center gap-2 p-2 rounded transition-colors ${
                    isActive("/seller/statistical")
                      ? "bg-[#5aa32a] text-white"
                      : "hover:bg-[#1F242D]"
                  }`}
                >
                  <span className="w-6 h-6 mb-2">
                    <DonutSmallIcon className="text-orange-400 mb-2" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="mb-3 border-b border-gray-600">
              <div className="mb-3 space-y-1">
                {[
                  {
                    path: "/seller/setting",
                    icon: <SettingsSuggestIcon className="text-gray-400" />,
                    label: "Thông tin",
                  },

                  {
                    path: "/seller/products",
                    icon: <ShoppingCartIcon className="text-green-400" />,
                    label: "Sản Phẩm",
                  },
                  {
                    path: "/seller/orders",
                    icon: <ShoppingBagIcon className="text-red-400" />,
                    label: "Đơn Hàng",
                  },
                  {
                    path: "/seller/voucher",
                    icon: <DiscountIcon className="text-blue-400" />,
                    label: "Voucher",
                  },
                  // {
                  //   path: "/seller/warehouse",
                  //   icon: <ShoppingBagIcon className="text-red-400" />,
                  //   label: "Kho Hàng",
                  // },
                  {
                    path: "/seller/reviews",
                    icon: <RateReviewIcon className="text-violet-400" />,
                    label: "Đánh Giá",
                  },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={`flex justify-center items-center gap-2 p-2 rounded transition-colors ${
                      isActive(item.path)
                        ? "bg-[#5aa32a] text-white"
                        : "hover:bg-[#1F242D]"
                    }`}
                  >
                    <span className="w-6 h-6 mb-2">{item.icon}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="space-y-1">
                {[
                  {
                    path: "/seller/profile",
                    icon: (
                      <PermContactCalendarIcon className="text-yellow-400" />
                    ),
                    label: "Hồ Sơ",
                    show: true,
                  },
                  // {
                  //   path: "/seller/change-password",
                  //   icon: <LockOpenIcon className="text-purple-400" />,
                  //   label: "Mật Khẩu",
                  //   show: userData?.provider === "email",
                  // },
                ]
                  .filter((item) => item.show)
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={`flex justify-center items-center gap-2 p-2 rounded transition-colors ${
                        isActive(item.path)
                          ? "bg-[#5aa32a] text-white"
                          : "hover:bg-[#1F242D]"
                      }`}
                    >
                      <span className="w-6 h-6 mb-2">{item.icon}</span>
                    </Link>
                  ))}
                <button
                  title="Đăng xuất"
                  onClick={handleLogout}
                  className="cursor-pointer flex justify-center items-center gap-2 p-2 w-full text-left rounded hover:bg-[#1F242D] transition-colors"
                >
                  <span className="w-6 h-6 mb-2">
                    <LogoutIcon className="text-red-400 ml-1" />
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
