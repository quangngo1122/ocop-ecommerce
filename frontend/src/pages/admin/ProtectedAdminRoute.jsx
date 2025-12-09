import { Navigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

// -----------------------GRAPQL-----------------------

const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      _id
      role
    }
  }
`;

// ----------------------------------------------------

export default function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const { data, loading } = useQuery(GET_CURRENT_USER, {
    skip: !token,
    fetchPolicy: "no-cache",
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (!token) return <Navigate to="/login-admin" replace />;
  if (loading) return null;

  if (data?.getCurrentUser?.role !== "ADMIN") {
    localStorage.removeItem("accessToken");
    return <Navigate to="/login-admin" replace />;
  }

  return children;
}
