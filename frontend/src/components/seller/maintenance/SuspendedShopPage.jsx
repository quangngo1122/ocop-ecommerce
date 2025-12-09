import React, { useContext } from "react";
import { useQuery, gql } from "@apollo/client";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import CancelIcon from "@mui/icons-material/Cancel";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InfoIcon from "@mui/icons-material/Info";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// -----------------------GRAPHQL-----------------------
const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      _id
      name
      description
      logo
      status
      createdAt
      owner {
        _id
        fullName
        email
      }
    }
  }
`;

const USERS_QUERY = gql`
  query Users {
    users {
      role
      email
    }
  }
`;
// -----------------------GRAPHQL-----------------------
export default function SuspendedShopPage() {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const userId = userData?._id;

  const { data: myShop, loading: myShopLoading } = useQuery(MY_SHOP_QUERY);
  const shopId = myShop?.myShop?._id;

  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY);

  const adminEmails =
    usersData?.users?.filter((u) => u.role === "admin").map((u) => u.email) ||
    [];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleGoBack = () => {
    navigate("/");
  };

  // const handleContactSupport = () => {
  //   alert("Liên hệ hỗ trợ qua email:...");
  // };

  const handleContactSupport = () => {
    if (adminEmails.length > 0) {
      const formattedEmails = adminEmails
        .map((email) => `   • ${email}`)
        .join("\n");
      alert(`Liên hệ hỗ trợ qua email: \n${formattedEmails}\n`);
    } else {
      alert("Không tìm thấy email admin.");
    }
  };

  const handleReapply = () => {
    // Có thể redirect đến trang đăng ký shop mới
    navigate("/register-seller");
  };

  if (myShopLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-500 text-lg">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!myShop) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">
            Không tìm thấy thông tin shop
          </div>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

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
            Shop Bị Từ Chối
          </h1>
          <p className="text-gray-600">
            Đơn đăng ký shop của bạn đã bị từ chối. Vui lòng xem thông tin chi
            tiết bên dưới.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Status Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CancelIcon className="text-red-600 text-2xl" />
              <h2 className="text-xl font-semibold text-red-800">
                Đơn đăng ký bị từ chối
              </h2>
            </div>
            <p className="text-red-700">
              Shop của bạn không đáp ứng các tiêu chí của chúng tôi. Vui lòng
              xem thông tin chi tiết và liên hệ hỗ trợ nếu cần thiết.
            </p>
          </div>

          {/* Shop Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Shop Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <StorefrontIcon className="text-blue-600" />
                Thông tin Shop
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={myShop?.myShop?.logo}
                    alt="Shop Logo"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {myShop?.myShop?.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {myShop?.myShop?.description || "Chưa có mô tả"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      Bị từ chối
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày đăng ký:</span>
                    <span className="text-gray-800">
                      {formatDate(myShop?.myShop?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ shop:</span>
                    <span className="text-gray-800">
                      {myShop?.myShop?.owner?.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-800">
                      {myShop?.myShop?.owner?.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <AccessTimeIcon className="text-green-600" />
                  Quy trình duyệt
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start lg:ml-24  gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Đăng ký shop
                      </h4>
                      <p className="text-sm text-gray-600">Hoàn thành ✓</p>
                    </div>
                  </div>

                  <div className="flex items-start lg:ml-24  gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Admin xem xét
                      </h4>
                      <p className="text-sm text-gray-600">Hoàn thành ✓</p>
                    </div>
                  </div>

                  <div className="flex items-start lg:ml-24  gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Phê duyệt</h4>
                      <p className="text-sm text-gray-600">Bị từ chối</p>
                    </div>
                  </div>

                  <div className="flex items-start lg:ml-24  gap-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-400">
                        Bắt đầu bán hàng
                      </h4>
                      <p className="text-sm text-gray-400">Đã bị từ chối</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Possible Reasons */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <InfoIcon className="text-orange-600" />
                Lý do có thể bị từ chối
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Thông tin không đầy đủ
                  </h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Thiếu thông tin liên hệ</li>
                    <li>• Mô tả shop không rõ ràng</li>
                    <li>• Logo không phù hợp</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Vi phạm chính sách
                  </h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Tên shop không phù hợp</li>
                    <li>• Nội dung vi phạm quy định</li>
                    <li>• Thông tin giả mạo</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Lý do khác
                  </h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Hệ thống đang bảo trì</li>
                    <li>• Quá tải đăng ký</li>
                    <li>• Lỗi kỹ thuật</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <InfoIcon className="text-blue-600 mt-1" />
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">Bước tiếp theo</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Liên hệ hỗ trợ để biết lý do cụ thể</li>
                  <li>• Cập nhật thông tin shop theo hướng dẫn</li>
                  <li>• Có thể đăng ký lại và chờ duyệt một lần nữa</li>
                  <li>• Đảm bảo tuân thủ các quy định của website</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactSupport}
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ContactSupportIcon />
              Liên hệ hỗ trợ
            </button>
            <button
              onClick={handleReapply}
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshIcon />
              Đăng ký lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
