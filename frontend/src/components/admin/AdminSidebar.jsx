import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import FolderIcon from "@mui/icons-material/Folder";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase.config";
import LogoutIcon from "@mui/icons-material/Logout";
import ImageIcon from "@mui/icons-material/Image";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { AuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../contexts/ToastProvider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GroupIcon from "@mui/icons-material/Group";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BadgeIcon from "@mui/icons-material/Badge";

export default function AdminSidebar({ collapsed = false, toggleSidebar }) {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const location = useLocation();
  const { showToast } = useToast();

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
    window.location.href = "/login-admin";
  };

  // Menu cấu hình
  const menuItems = [
    {
      section: "Tổng Quan",
      items: [
        {
          path: "/admin",
          icon: <LeaderboardIcon className="text-blue-400 mb-1" />,
          label: "Bảng Điều Khiển",
        },
      ],
    },
    {
      section: "Quản Lý Website",
      items: [
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
          label: "Khách hàng",
        },
        {
          path: "/admin/product",
          icon: <ShoppingCartIcon className="text-teal-400" />,
          label: "Sản Phẩm",
        },
        {
          path: "/admin/order",
          icon: <ShoppingBagIcon className="text-orange-400" />,
          label: "Đơn Hàng",
        },
        {
          path: "/admin/seller",
          icon: <BadgeIcon className="text-blue-700" />,
          label: "Người Bán",
        },
        {
          path: "/admin/shop",
          icon: <StorefrontIcon className="text-red-400" />,
          label: "Cửa hàng",
        },
        {
          path: "/admin/review",
          icon: <StarBorderIcon className="text-yellow-400" />,
          label: "Đánh Giá",
        },
      ],
    },
    {
      section: "Quản Lý Cá Nhân",
      items: [
        // {
        //   path: "/admin/profile",
        //   icon: <PermContactCalendarIcon className="text-yellow-400" />,
        //   label: "Hồ Sơ",
        //   show: true,
        // },
        {
          path: "/admin/change-password",
          icon: <LockOpenIcon className="text-purple-400" />,
          label: "Mật Khẩu",
          show: userData?.provider === "email",
        },
      ].filter((item) => item.show !== false),
    },
  ];

  // Sidebar lớn
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
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover"
              />
              <h1 className="text-xl text-center font-semibold">
                Trang Quản trị hệ thống
              </h1>
            </div>
            {/* <Link to="/admin/profile"> */}
            <Link to="">
              <div className="flex items-center gap-3 p-3 mb-6 bg-[#1F242D] rounded-lg">
                <img
                  src={userData?.avatar || "/lua.jpg"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <p className="font-medium">Admin</p>
                  <p className="text-sm text-gray-400">Quản trị viên</p>
                </div>
              </div>
            </Link>
            <nav className="space-y-1">
              {menuItems.map((section) => (
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

  // Sidebar mini
  return (
    <div>
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
          {/* <Link to="/admin/profile"> */}
          <Link to="">
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
                      className={`flex justify-center items-center gap-2 p-2 rounded transition-colors ${
                        isActive(item.path)
                          ? "bg-[#5aa32a] text-white"
                          : "hover:bg-[#1F242D]"
                      }`}
                    >
                      <span className="w-6 h-5 mb-2">{item.icon}</span>
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
