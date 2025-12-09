import React, { useContext } from "react";
import { useQuery, gql } from "@apollo/client";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import PendingIcon from "@mui/icons-material/Pending";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoIcon from "@mui/icons-material/Info";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
export default function PendingApprovalPage() {
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
  //   // Có thể mở email hoặc chat support
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
            Chờ Duyệt Shop
          </h1>
          <p className="text-gray-600">
            Shop của bạn đang được quản trị viên xem xét và phê duyệt
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Status Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <PendingIcon className="text-yellow-600 text-2xl" />
              <h2 className="text-xl font-semibold text-yellow-800">
                Đang chờ phê duyệt
              </h2>
            </div>
            <p className="text-yellow-700">
              Shop của bạn đã được gửi để xem xét. Quá trình này thường mất 1-3
              ngày làm việc. Bạn sẽ nhận được thông báo khi có kết quả.
            </p>
          </div>

          {/* Shop Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Shop Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <StorefrontIcon className="text-blue-600" />
                Thông tin Shop đăng ký
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={myShop?.myShop?.logo || "/lua.jpg"}
                    alt="Shop Logo"
                    className="w-16 h-16 rounded-lg object-cover "
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
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Chờ duyệt
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
            </div>

            {/* Timeline & Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 lg:ml-8 md:ml-8">
                <AccessTimeIcon className="text-green-600" />
                Quy trình duyệt
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3 lg:ml-8 md:ml-8">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Đăng ký shop</h4>
                    <p className="text-sm text-gray-600">Hoàn thành ✓</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:ml-8 md:ml-8">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Admin xem xét</h4>
                    <p className="text-sm text-gray-600">Đang thực hiện...</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:ml-8 md:ml-8">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-400">Phê duyệt</h4>
                    <p className="text-sm text-gray-400">Chờ kết quả</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:ml-8 md:ml-8">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-400">
                      Bắt đầu bán hàng
                    </h4>
                    <p className="text-sm text-gray-400">Chờ kết quả</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <InfoIcon className="text-blue-600 mt-1" />
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">
                  Thông tin bổ sung
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Quá trình duyệt thường mất 1-3 ngày làm việc</li>
                  <li>• Admin sẽ kiểm tra thông tin shop và chủ shop</li>
                  <li>• Bạn sẽ được bắt đầu bán hàng nếu được duyệt</li>
                  <li>
                    • Nếu bị từ chối, bạn có thể liên hệ admin hoặc đăng ký lại
                    với thông tin đúng hơn
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <button
              onClick={handleContactSupport}
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ContactSupportIcon />
              Liên hệ hỗ trợ
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Có câu hỏi? Hãy liên hệ với chúng tôi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
