import { Navigate, Outlet } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthProvider";

export default function ProtectedRoute({ allowedRoles }) {
  const { userData, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return <div>Loading...</div>; // chờ load xong

  if (!userData?.fullName) return <Navigate to="/login" replace />;

  const role = userData?.role?.toLowerCase();
  if (allowedRoles?.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    if (!normalizedAllowed.includes(role)) return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
