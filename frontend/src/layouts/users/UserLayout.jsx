import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/HeaderUser";
import Footer from "../../components/Footer";
export default function UserLayout() {
  return (
    <>
      <div className=" bg-[#EEEEEE]">
        <Header />
        <Outlet />
        <div className="mt-10">
          <Footer />
        </div>
      </div>
    </>
  );
}
