import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { AuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../contexts/ToastProvider";

import NoShopPage from "../../components/seller/maintenance/NoShopPage.jsx";
import PendingApprovalPage from "../../components/seller/maintenance/PendingApprovalPage.jsx";
import SuspendedShopPage from "../../components/seller/maintenance/SuspendedShopPage.jsx";

// ----------------------- GraphQL ------------------------

const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      _id
      name
      owner {
        _id
      }
      status
    }
  }
`;

//---------------------------------------------------------

export default function ProtectedSellerRoute({ children }) {
  const { userData } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const roleUser = userData?.role;
  const isActive = userData?.isActive;
  const accessToken = localStorage.getItem("accessToken");
  const userId = userData?._id;

  const handled = useRef(false);

  const { data: myShop, loading: myShopLoading } = useQuery(MY_SHOP_QUERY);
  const shopId = myShop?.myShop?._id;

  if (!accessToken) {
    showToast("Vui lòng đăng nhập để tiếp tục", "warning");
    navigate("/login", { replace: true });
    return null;
  }
  if (
    !accessToken ||
    typeof roleUser === "undefined" ||
    typeof isActive === "undefined" ||
    myShopLoading
  ) {
    return (
      <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
            <div className="absolute inset-1 rounded-full bg-white"></div>
          </div>
          <div className="text-lg font-semibold text-blue-600 animate-pulse">
            Đang xác thực người dùng...
          </div>
        </div>
      </div>
    );
  }
  if (roleUser !== "seller" && !myShop) {
    showToast("Bạn không có quyền truy cập trang seller", "error");
    navigate("/", { replace: true });
    return null;
  }
  if (!isActive) {
    showToast(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.",
      "error"
    );
    navigate("/", { replace: true });
    return null;
  }
  if (myShop && myShop?.myShop.status === "closed") {
    showToast(
      "Shop của bạn đã đóng. Vui lòng liên hệ admin để được hỗ trợ.",
      "error"
    );
    navigate("/", { replace: true });
    return null;
  }

  if (myShop && myShop?.myShop.status === "locked") {
    showToast(
      "Shop của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.",
      "error"
    );
    navigate("/", { replace: true });
    return null;
  }
  if (myShop && myShop?.myShop.status === "suspended") {
    if (location.pathname !== "/seller/suspended-shop") {
      showToast(
        "Shop của bạn đã bị cấm. Vui lòng liên hệ admin để được hỗ trợ.",
        "error"
      );
      navigate("/seller/suspended-shop", { replace: true });
    }
    return <SuspendedShopPage />;
  }

  if (myShop && roleUser === "user" && myShop?.myShop.status === "pending") {
    if (location.pathname !== "/seller/pending-approval") {
      showToast(
        "Shop của bạn đang chờ duyệt. Vui lòng chờ admin phê duyệt.",
        "warning"
      );
      navigate("/seller/pending-approval", { replace: true });
    }
    return <PendingApprovalPage />;
  }

  if (myShop && myShop?.myShop.status === "pending") {
    if (location.pathname !== "/seller/pending-approval") {
      showToast(
        "Shop của bạn đang chờ duyệt. Vui lòng chờ admin phê duyệt.",
        "warning"
      );
      navigate("/seller/pending-approval", { replace: true });
    }
    return <PendingApprovalPage />;
  }
  if (!myShop) {
    if (location.pathname !== "/seller/no-shop") {
      showToast(
        "Bạn chưa có shop. Vui lòng tạo shop để bắt đầu bán hàng.",
        "warning"
      );
      navigate("/seller/no-shop", { replace: true });
    }
    return <NoShopPage />;
  }
  return children;
}
