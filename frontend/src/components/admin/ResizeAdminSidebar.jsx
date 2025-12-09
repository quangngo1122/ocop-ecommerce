// backup code khi đã gộp sidebar 2 dạng lại

import React, { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import FolderIcon from "@mui/icons-material/Folder";
import ImageIcon from "@mui/icons-material/Image";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase.config";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../contexts/ToastProvider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import BadgeIcon from "@mui/icons-material/Badge";

export default function ResizeAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { userData } = useContext(AuthContext);
  const isActive = (path) => {
    if (path === "/admin/user") {
      return location.pathname.startsWith("/admin/user");
    }
    if (path === "/admin/seller") {
      return location.pathname.startsWith("/admin/seller");
    }
    if (path === "/admin/shop") {
      return location.pathname.startsWith("/admin/shop");
    }
    if (path === "/admin/product") {
      return location.pathname.startsWith("/admin/product");
    }
    if (path === "/admin/order") {
      return location.pathname.startsWith("/admin/order");
    }
    if (path === "/admin/audit-log") {
      return location.pathname.startsWith("/admin/audit-log");
    }
    return location.pathname === path;
  };
  const handleLogout = async () => {
    await signOut(auth);
    showToast("Đăng xuất thành công!", "success");
    localStorage.removeItem("accessToken");
    // navigate("/login-admin");
    window.location.href = "/login-admin";
  };

  return (
    <div>
      {/* Sidebar - Fixed */}
      <div className="w-16 bg-[#2A303C] text-white fixed h-full overflow-auto">
        <div className="p-0">
          <div
            title="Logo"
            className="flex justify-center items-center gap-3 mb-4 mt-4"
          >
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <Link to="/admin/profile">
            <div
              title="Avatar"
              className="flex items-center gap-3 justify-center mb-3 bg-[#1F242D] rounded-lg"
            >
              <img
                src={userData?.avatar || "/lua.jpg"}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            </div>
          </Link>

          <nav className="space-y-1">
            <div className="mb-3 border-b border-gray-600">
              <div className="mb-3">
                <Link
                  to=""
                  title="Thống kê"
                  className={`flex justify-center items-center gap-2 p-2 rounded transition-colors ${
                    isActive("/admin")
                      ? "bg-[#5aa32a] text-white"
                      : "hover:bg-[#1F242D]"
                  }`}
                >
                  <span className="w-6 h-5 mb-2">
                    <LeaderboardIcon className="text-blue-400 " />
                  </span>
                </Link>
              </div>
            </div>

            <div className="mb-3 border-b border-gray-600">
              <div className="mb-3 space-y-1">
                {[
                  {
                    path: "/admin/banner",
                    icon: <ImageIcon className="text-violet-400" />,
                    label: "Banner",
                  },
                  {
                    path: "/admin/categories",
                    icon: <FolderIcon className="text-yellow-400" />,
                    label: "Danh Mục",
                  },
                  {
                    path: "/admin/user",
                    icon: <GroupIcon className="text-green-400" />,
                    label: "User",
                  },
                  {
                    path: "/admin/product",
                    icon: <ShoppingCartIcon className="text-teal-400" />,
                    label: "Product",
                  },
                  {
                    path: "/admin/order",
                    icon: <ShoppingBagIcon className="text-orange-400" />,
                    label: "Order",
                  },
                  {
                    path: "/admin/seller",
                    icon: <BadgeIcon className="text-blue-700" />,
                    label: "Seller",
                  },
                  {
                    path: "/admin/shop",
                    icon: <StorefrontIcon className="text-red-400" />,
                    label: "Shop",
                  },
                  {
                    path: "/admin/review",
                    icon: <StarBorderIcon className="text-yellow-400" />,
                    label: "Review",
                  },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={`flex justify-center items-center gap-2 p-2 rounded transition-colors  ${
                      isActive(item.path)
                        ? "bg-[#5aa32a] text-white"
                        : "hover:bg-[#1F242D]"
                    }`}
                  >
                    <span className="w-6 h-5 mb-2">{item.icon}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="space-y-1">
                {[
                  // {
                  //   path: "/admin/audit-log",
                  //   icon: <FactCheckIcon className="text-blue-400" />,
                  //   label: "Nhật ký cập nhật",
                  //   show: true,
                  // },
                  {
                    path: "/admin/profile",
                    icon: (
                      <PermContactCalendarIcon className="text-yellow-400" />
                    ),
                    label: "Hồ Sơ",
                    show: true,
                  },
                  {
                    path: "/admin/change-password",
                    icon: <LockOpenIcon className="text-purple-400" />,
                    label: "Mật Khẩu",
                    show: userData?.provider === "email",
                  },
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
