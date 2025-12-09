import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/HeaderUser";
import SideBarProfile from "../../components/sidebars/ProfileSideBar";

export default function ProfileLayout() {
  return (
    <div className="min-h-screen bg-[#EEEEEE]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex ">
          {/* Sidebar */}
          <div className="w-1/4">
            <SideBarProfile />
          </div>

          {/* Main Content */}
          <div className="w-3/ ml-5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
