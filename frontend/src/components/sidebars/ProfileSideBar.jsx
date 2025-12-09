import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthProvider";

export default function SideBarProfile() {
  const { userData } = useContext(AuthContext);
  const location = useLocation(); // Lấy path hiện tại

  // Hàm kiểm tra link có đang active không
  const isActive = (path) => location.pathname === path;

  return (
    <div className="container h-100 w-50 py-5 ml-20">
      <div className="flex items-center gap-4 mb-6 border-b pb-4 mt-4">
        <div className="w-12 h-12 rounded-full bg-gray-200">
          <img
            src={userData?.avatar || "https://via.placeholder.com/150"}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <Link to={"/me/profile"} className="text-lg text-[14px] font-medium">
          {userData?.fullName || "Tên người dùng"}
        </Link>
      </div>

      <nav className="flex flex-col gap-4">
        <Link
          to={"/me/address"}
          className={`flex items-center gap-2 transition-colors ${
            isActive("/me/address")
              ? "text-[#5aa32a] font-bold"
              : "hover:text-[#5aa32a]"
          }`}
        >
          <i className="fas fa-map-marker-alt"></i>
          Địa chỉ
        </Link>

        <Link
          to={"/me/orders-history"}
          className={`flex items-center gap-2 transition-colors ${
            isActive("/me/orders-history")
              ? "text-[#5aa32a] font-bold"
              : "hover:text-[#5aa32a]"
          }`}
        >
          <i className="fas fa-shopping-bag"></i>
          Đơn mua
        </Link>

        {/* <Link
          to={"/me/delete-account"} // đổi từ "/delete-account" thành "/me/delete-account"
          className={`flex items-center gap-2 transition-colors ${
            isActive("/me/delete-account")
              ? "text-[#5aa32a] font-bold"
              : "hover:text-[#5aa32a]"
          }`}
        >
          <i className="fas fa-user"></i>
          Quản lý tài khoản
        </Link> */}

        <Link
          to={userData?.role === "seller" ? "/seller/" : "/register-seller"}
          className={`flex items-center gap-2 font-bold transition-colors ${
            isActive("/seller/") || isActive("/register-seller")
              ? "text-[#5aa32a]"
              : "hover:text-[#5aa32a]"
          }`}
        >
          <i className="fas fa-store"></i>
          {userData?.role === "seller"
            ? "Quản lý shop"
            : "Đăng ký làm người bán"}
        </Link>
      </nav>
    </div>
  );
}
