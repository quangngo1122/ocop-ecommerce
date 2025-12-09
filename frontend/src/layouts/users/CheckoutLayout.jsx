import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/HeaderUser";
export default function CheckoutLayout() {
  return (
    <>
      <div className=" bg-[#EEEEEE] min-h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
}
