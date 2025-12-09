import "./config/firebase.config";
import React from "react";
import router from "./routes/AppRouter";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { client } from "../src/apollo-client/apollo-client";
import { ApolloProvider } from "@apollo/client";
import { ToastProvider } from "./contexts/ToastProvider";
import { CartProvider } from "./contexts/CartProvider";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ApolloProvider>
  </React.StrictMode>
);
