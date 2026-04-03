import React, { useContext } from "react";
import { useQuery, gql } from "@apollo/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import DiscountIcon from "@mui/icons-material/Discount";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DonutSmallIcon from "@mui/icons-material/DonutSmall";
import { AuthContext } from "../../contexts/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase.config";
import { useToast } from "../../contexts/ToastProvider";
import { LockOpenIcon } from "lucide-react";

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

/**
 * @param {Object} props
 * @param {boolean} props.collapsed - true: show mini sidebar, false: show full sidebar
 * @param {function} props.toggleSidebar - function to toggle sidebar size
 */
export default function SellerSidebar({ collapsed = false, toggleSidebar }) {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const userId = userData?._id;
  const location = useLocation();
  const { data: shopsData } = useQuery(SHOPS_QUERY);
  const myShop = shopsData?.shops?.items?.find(
    (shop) => shop.owner?._id === userId,
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
    window.location.href = "/";
  };

  // Sidebar menu config
  const menuItems = [
    {
      section: "Tổng Quan",
      items: [
        {
          path: "/seller",
          icon: <LeaderboardIcon className="text-blue-400 mb-1" />,
          label: "Bảng Điều Khiển",
        },
        {
          path: "/seller/statistical",
          icon: <DonutSmallIcon className="text-orange-400" />,
          label: "Thống kê",
        },
      ],
    },
    {
      section: "Quản Lý Website",
      items: [
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
      ],
    },
    {
      section: "Quản Lý Cá Nhân",
      items: [
        {
          path: "/seller/profile",
          icon: <PermContactCalendarIcon className="text-yellow-400" />,
          label: "Hồ Sơ",
          show: true,
        },
        {
          path: "/seller/change-password",
          icon: <LockOpenIcon className="text-purple-400" />,
          label: "Mật Khẩu",
          show: userData?.provider === "email",
        },
      ].filter((item) => item.show !== false),
    },
  ];

  // Large sidebar
  if (!collapsed) {
    return (
      <div className="z-100">
        <div className="w-64 bg-[#2A303C] text-white fixed h-full overflow-y-auto">
          <div className="flex justify-end">
            <button
              onClick={toggleSidebar}
              className="cursor-pointer px-2 rounded-full hover:bg-[#1F242D] transition-colors text-white"
              title="Thu gọn sidebar"
            >
              <KeyboardDoubleArrowLeftIcon />
            </button>
          </div>
          <div className="p-4 pt-0">
            <Link to="/seller/setting">
              <div className="flex items-center gap-3 mb-8">
                <img
                  src={myShop?.logo}
                  alt="Logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h1 className="text-xl text-center font-semibold">
                  Trang Quản Lý Cơ Sở
                </h1>
              </div>
            </Link>
            <Link to="/seller/profile">
              <div className="flex items-center gap-3 p-3 mb-6 bg-[#1F242D] rounded-lg">
                <img
                  src={userData?.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <p className="font-medium">{userData?.fullName}</p>
                  <p className="text-sm text-gray-400">Nhân viên bán hàng</p>
                </div>
              </div>
            </Link>
            <nav className="space-y-1">
              {menuItems.map((section, idx) => (
                <div className="mb-4" key={section.section}>
                  <p className="text-gray-400 text-sm mb-2">
                    {section.section}
                  </p>
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={`flex items-center gap-2 p-2 rounded transition-colors ${
                        isActive(item.path)
                          ? "bg-[#5aa32a] text-white"
                          : "hover:bg-[#1F242D]"
                      }`}
                    >
                      <span className="w-6 h-5 mb-1">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  {section.section === "Quản Lý Cá Nhân" && (
                    <button
                      onClick={handleLogout}
                      title={"Đăng xuất"}
                      className="flex cursor-pointer items-center gap-2 p-2 w-full text-left rounded hover:bg-[#1F242D] transition-colors"
                    >
                      <span className="w-5 h-5 mb-2">
                        <LogoutIcon className="text-red-400 ml-1" />
                      </span>
                      Đăng Xuất
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    );
  }

  // Mini sidebar
  return (
    <div>
      <div className="w-16 bg-[#2A303C] text-white fixed h-full overflow-auto">
        {/* <div className="flex justify-center items-center mt-2 mb-4">
          <button
            onClick={toggleSidebar}
            className="cursor-pointer px-2 rounded-full hover:bg-[#1F242D] transition-colors text-white"
            title="Mở rộng sidebar"
          >
            <KeyboardDoubleArrowLeftIcon
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
        </div> */}
        <div className="p-0">
          <Link to="/seller/setting">
            <div
              title="Logo"
              className="flex justify-center items-center gap-3 mb-4 mt-4"
            >
              <img
                src={myShop?.logo}
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
            {menuItems.map((section) => (
              <div
                className="mb-3 border-b border-gray-600"
                key={section.section}
              >
                <div className="mb-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={`flex mb-2 justify-center items-center gap-2 p-2 rounded transition-colors ${
                        isActive(item.path)
                          ? "bg-[#5aa32a] text-white"
                          : "hover:bg-[#1F242D]"
                      }`}
                    >
                      <span className="w-6 h-6 mb-2">{item.icon}</span>
                    </Link>
                  ))}
                  {section.section === "Quản Lý Cá Nhân" && (
                    <button
                      title="Đăng xuất"
                      onClick={handleLogout}
                      className="cursor-pointer flex justify-center items-center gap-2 p-2 w-full text-left rounded hover:bg-[#1F242D] transition-colors"
                    >
                      <span className="w-6 h-6 mb-2">
                        <LogoutIcon className="text-red-400 ml-1" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
