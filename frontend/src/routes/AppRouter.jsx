import { createBrowserRouter, Outlet } from "react-router-dom";
// User Layout =======================================================================================================
import UserLayout from "../layouts/users/UserLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import ProfileLayout from "../layouts/users/ProfileLayout.jsx";
import CartLayout from "../layouts/users/CartLayout.jsx";
// Seller layout
import SellerLayout from "../layouts/seller/SellerLayout.jsx";
import ProductLayout from "../layouts/seller/ProductLayout.jsx";
import SettingLayout from "../layouts/seller/SettingLayout.jsx";
import CheckoutLayout from "../layouts/users/CheckoutLayout.jsx";
// role
import ProtectedRoute from "../layouts/role/ProtectedRoute.jsx";
// Admin layout
import AdminLayout from "../layouts/admin/AdminLayout.jsx";
// authorization pages
import ProtectedAdminRoute from "../pages/admin/ProtectedAdminRoute.jsx";
import ProtectedSellerRoute from "../pages/seller/ProtectedSellerRoute.jsx";
// User Pages
import LoginPage from "../pages/users/LoginPage.jsx";
import RegisterPage from "../pages/users/RegisterPage.jsx";
import RegisterSellerPage from "../pages/users/RegisterSellerPage.jsx";
import HomePage from "../pages/users/HomePage.jsx";
import ProductSearchPage from "../pages/users/ProductSearchPage.jsx";
import CategoryProductsPage from "../pages/users/CategoryProductsPage.jsx";
import ForgotPasswordPage from "../pages/users/ForgotPasswordPage.jsx";
import ProductListPage from "../pages/users/products/ProductListPage.jsx";
import RegionProductsPage from "../pages/users/RegionProductsPage.jsx";
// Proudct
import ProductDetailPage from "../pages/users/products/ProductDetailPage.jsx";
// Profile
import ProfileUserPage from "../pages/users/me/ProfilePage.jsx";
import ProfileAddressPage from "../pages/users/me/ProfileAddressPage.jsx";
import ProfileOrderPage from "../pages/users/me/OrderHistoryPage.jsx";
import ProfileOrderDetailPage from "../pages/users/me/OrderDetailHistoryPage.jsx";
import DeleteAccountPage from "../pages/users/me/DeleteAccount.jsx";
import OrderDetailHistoryPage from "../pages/users/me/OrderDetailHistoryPage.jsx";

// Shop
import ShopPage from "../pages/users/shop/ShopPage.jsx";
// Cart
import CartPage from "../pages/users/cart/CartPage.jsx";
// checkout
import CheckoutPage from "../pages/users/checkout/CheckoutPage.jsx";
import PaymentPage from "../pages/users/checkout/PaymentPage.jsx";
// seller pages --------------
import DashboardPage from "../pages/seller/DashboardPage.jsx";
import ProfilePage from "../pages/seller/ProfilePage.jsx";
import OrdersPage from "../pages/seller/OrdersPage.jsx";
import ProductsManagementPage from "../pages/seller/product/ProductManagementPage.jsx";
import AddProductPage from "../pages/seller/product/AddProductPage.jsx";
import UpdateProductPage from "../pages/seller/product/UpdateProductPage.jsx";
import SettingPage from "../pages/seller/setting/SettingPage.jsx";
import AdditionalSettingsPage from "../pages/seller/setting/AdditionalSettingsPage.jsx";
import OrderDetailsPage from "../pages/seller/OrderDetailsPage.jsx";
import VoucherList from "../pages/seller/VoucherPage.jsx";
import ReviewManager from "../pages/seller/ReviewManagerPage.jsx";
import ProductVariantsPage from "../pages/seller/product/ProductVariantsPage.jsx";
import StatisticalPage from "../pages/seller/statistical/StatisticalPage.jsx";
// kho
import WarehouseManagement from "../pages/seller/warehouse/WarehouseManagementPage.jsx";
// admin pages --------------
import CategoriesPage from "../pages/admin/CategoriesPage.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminSellerPage from "../pages/admin/seller/AdminSellerPage.jsx";
import LoginAdminPage from "../pages/admin/LoginAdminPage.jsx";
import AdminBannerPage from "../pages/admin/AdminBannerPage.jsx";
import ChangePasswordPage from "../pages/admin/ChangePasswordPage.jsx";
import ProfileAdminPage from "../pages/admin/ProfileAdminPage.jsx";
import AdminProductPage from "../pages/admin/products/AdminProductPage.jsx";
import AdminProductDetailPage from "../pages/admin/products/AdminProductDetailPage.jsx";
import AdminUserPage from "../pages/admin/user/AdminUserPage.jsx";
import AdminDetailUserPage from "../pages/admin/user/AdminDetailUserPage.jsx";
import AdminShopPage from "../pages/admin/shops/AdminShopPage.jsx";
import AdminShopDetailPage from "../pages/admin/shops/AdminShopDetailPage.jsx";

import AdminOrderPage from "../pages/admin/orders/AdminOrderPage.jsx";
import AdminReviewPage from "../pages/admin/review/AdminReviewPage.jsx";
// import AdminAuditLogPage from "../pages/admin/auditlogs/AdminAuditLogPage.jsx";

import AddProductPageTest from "../pages/seller/product/AddProductPageTest.jsx";
// import AdminAuditLogDetailPage from "../pages/admin/auditlogs/AdminAuditLogDetailPage.jsx";
import AdminOrderDetailPage from "../pages/admin/orders/AdminOrderDetailPage.jsx";
import AdminSellerDetailPage from "../pages/admin/seller/AdminSellerDetailPage.jsx";

//------------------------------
import NoShopPage from "../components/seller/maintenance/NoShopPage.jsx";
import PendingApprovalPage from "../components/seller/maintenance/PendingApprovalPage.jsx";
import SuspendedShopPage from "../components/seller/maintenance/SuspendedShopPage.jsx";
import { Import } from "lucide-react";

//------------------------------

// test--------------------------------
// import AdminBannerPage from "../pages/admin/AdminBannerPageTest.jsx";

export default createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "register-seller",
        element: <RegisterSellerPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/",
        element: <UserLayout />,
        children: [
          {
            path: "",
            element: <HomePage />,
          },
          {
            path: "shop/:slug",
            element: <ShopPage />,
          },
          {
            path: "products",
            element: <ProductListPage />,
          },
          {
            path: "search",
            element: <ProductSearchPage />,
          },
          {
            path: "district/:encodedId",
            element: <RegionProductsPage />,
          },

          {
            path: "/product",
            children: [
              {
                path: ":encodedId",
                element: <ProductDetailPage />,
              },
              {
                path: "category/:slug",
                element: <CategoryProductsPage />,
              },
            ],
          },
        ],
      },
      // phân quyền user
      {
        element: <ProtectedRoute allowedRoles={["user", "seller", "admin"]} />,
        children: [
          {
            path: "me",
            element: <ProfileLayout />,
            children: [
              {
                path: "profile",
                element: <ProfileUserPage />,
              },
              {
                path: "address",
                element: <ProfileAddressPage />,
              },
              {
                path: "orders-history",
                element: <ProfileOrderPage />,
              },
              {
                path: "orders-history/:id",
                element: <ProfileOrderDetailPage />,
              },
              {
                path: "order/:id",
                element: <OrderDetailHistoryPage />,
              },
              {
                path: "delete-account",
                element: <DeleteAccountPage />,
              },
            ],
          },
        ],
      },
      {
        path: "cart",
        element: <CartLayout />,
        children: [
          {
            path: "",
            element: <CartPage />,
          },
        ],
      },
      {
        path: "checkout",
        element: <CheckoutLayout />,
        children: [
          {
            path: "",
            element: <CheckoutPage />,
          },
          {
            path: "payment/:encodedParams",
            element: <PaymentPage />,
          },
        ],
      },
      //  phân quyên seller
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "seller",
            // element: <SellerLayout />,
            element: (
              <ProtectedSellerRoute>
                <SellerLayout />
              </ProtectedSellerRoute>
            ),
            children: [
              {
                path: "",
                element: <DashboardPage />,
              },
              {
                path: "warehouse",
                element: <WarehouseManagement />,
              },
              {
                path: "statistical",
                element: <StatisticalPage />,
              },
              {
                path: "voucher",
                element: <VoucherList />,
              },
              {
                path: "reviews",
                element: <ReviewManager />,
              },
              {
                path: "products",
                element: <ProductLayout />,
                children: [
                  {
                    path: "",
                    element: <ProductsManagementPage />,
                  },
                  {
                    path: "add",
                    element: <AddProductPage />,
                  },
                  {
                    path: "addtest",
                    element: <AddProductPageTest />,
                  },
                  {
                    path: "edit/:productId",
                    element: <UpdateProductPage />,
                  },
                  {
                    path: "variants/:productId",
                    element: <ProductVariantsPage />,
                  },
                ],
              },
              {
                path: "orders",
                element: <OrdersPage />,
              },
              {
                path: "orders/:id",
                element: <OrderDetailsPage />,
              },
              {
                path: "profile",
                element: <ProfilePage />,
              },

              {
                path: "setting",
                element: <SettingLayout />,
                children: [
                  {
                    path: "",
                    element: <SettingPage />,
                  },
                  {
                    path: "additional-settings",
                    element: <AdditionalSettingsPage />,
                  },
                ],
              },
              //---------------------------------
              {
                path: "pending-approval",
                element: <PendingApprovalPage />,
              },
              {
                path: "suspended-shop",
                element: <SuspendedShopPage />,
              },
              {
                path: "no-shop",
                element: <NoShopPage />,
              },
              //------------------------------
            ],
          },
        ],
      },
      {
        path: "login-admin",
        element: <LoginAdminPage />,
      },

      {
        path: "admin",
        element: (
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        ),
        children: [
          {
            path: "",
            element: <AdminDashboardPage />,
          },
          {
            path: "seller",
            element: <AdminSellerPage />,
          },
          {
            path: "seller/detail/:id",
            element: <AdminSellerDetailPage />,
          },
          {
            path: "categories",
            element: <CategoriesPage />,
          },
          {
            path: "banner",
            element: <AdminBannerPage />,
          },

          {
            path: "change-password",
            element: <ChangePasswordPage />,
          },
          {
            path: "profile",
            element: <ProfileAdminPage />,
          },
          {
            path: "product",
            element: <AdminProductPage />,
          },
          {
            path: "product/detail/:id",
            element: <AdminProductDetailPage />,
          },
          {
            path: "user",
            element: <AdminUserPage />,
          },
          {
            path: "user/detail/:id",
            element: <AdminDetailUserPage />,
          },
          {
            path: "shop",
            element: <AdminShopPage />,
          },
          {
            path: "shop/detail/:id",
            element: <AdminShopDetailPage />,
          },
          {
            path: "order",
            element: <AdminOrderPage />,
          },
          {
            path: "order/:id",
            element: <AdminOrderDetailPage />,
          },
          {
            path: "review",
            element: <AdminReviewPage />,
          },
          // {
          //   path: "audit-log",
          //   element: <AdminAuditLogPage />,
          // },
          // {
          //   path: "audit-log/:id",
          //   element: <AdminAuditLogDetailPage />,
          // },
        ],
      },
    ],
  },
]);
