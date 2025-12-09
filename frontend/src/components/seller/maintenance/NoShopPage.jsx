import React, { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function NoShopPage() {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  const handleCreateShop = () => {
    navigate("/register-seller");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowBackIcon />
            Quay lại trang chủ
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chưa Có Shop
          </h1>
          <p className="text-gray-600">
            Bạn cần tạo shop để có thể bắt đầu bán hàng
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Status Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <StorefrontIcon className="text-blue-600 text-2xl" />
              <h2 className="text-xl font-semibold text-blue-800">
                Chưa có shop
              </h2>
            </div>
            <p className="text-blue-700">
              Để bắt đầu bán hàng, bạn cần tạo một shop. Shop sẽ giúp bạn quản
              lý sản phẩm và đơn hàng một cách hiệu quả.
            </p>
          </div>

          {/* User Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* User Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <InfoIcon className="text-green-600" />
                Thông tin của bạn
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={userData?.avatar}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {userData?.fullName}
                    </h4>
                    <p className="text-gray-600 text-sm">{userData?.email}</p>
                    <p className="text-gray-600 text-sm">Vai trò: Seller</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái tài khoản:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Hoạt động
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số shop:</span>
                    <span className="text-gray-800">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <AddIcon className="text-purple-600" />
                Lợi ích khi có shop
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Quản lý sản phẩm
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Thêm, sửa, xóa sản phẩm</li>
                    <li>• Quản lý kho hàng</li>
                    <li>• Tạo biến thể sản phẩm</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Quản lý đơn hàng
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Xem danh sách đơn hàng</li>
                    <li>• Cập nhật trạng thái</li>
                    <li>• Thống kê doanh thu</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Marketing & Khuyến mãi
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Tạo voucher giảm giá</li>
                    <li>• Thống kê hiệu quả bán hàng</li>
                    <li>• Quản lý đánh giá</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How to Create Shop */}
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <InfoIcon className="text-green-600 mt-1" />
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">Cách tạo shop</h4>
                <ol className="text-sm text-green-700 space-y-2">
                  <li>1. Chuẩn bị thông tin shop (tên, mô tả, logo)</li>
                  <li>2. Điền đầy đủ thông tin trong form đăng ký seller</li>
                  <li>3. Chờ admin phê duyệt (1-3 ngày)</li>
                  <li>4. Bắt đầu bán hàng sau khi được duyệt</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <button
              onClick={handleCreateShop}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              <AddIcon />
              Tạo Shop Ngay
            </button>
            <p className="text-sm text-gray-600 mt-4">
              Quá trình tạo shop hoàn toàn miễn phí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
