import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
// import ResizeAdminSidebar from "../../components/admin/ResizeAdminSidebar";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";

export default function AdminLayout() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  const [useLargeSidebar, setUseLargeSidebar] = useState(
    window.innerWidth >= 1024
  );

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          );
        });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };
  useEffect(() => {
    const handleResize = () => {
      const screenIsLarge = window.innerWidth >= 1024;
      setIsLargeScreen(screenIsLarge);
      setUseLargeSidebar(screenIsLarge); // reset khi thay đổi màn hình
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setUseLargeSidebar((prev) => !prev);
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        collapsed={!useLargeSidebar}
        toggleSidebar={toggleSidebar}
      />

      {/* {useLargeSidebar ? (
         <AdminSidebar toggleSidebar={toggleSidebar} />
       ) : (
         <ResizeAdminSidebar />
       )} */}

      <div
        className={`flex-1 transition-all duration-300 ease-in-out overflow-auto
          ${useLargeSidebar ? "ml-64" : "ml-16"}`}
      >
        {!useLargeSidebar ? (
          <div className="p-2 flex bg-gray-200">
            <button
              className="cursor-pointer px-1 pb-1 rounded-[50%] hover:bg-gray-400"
              onClick={toggleSidebar}
            >
              <MenuIcon />
            </button>
            <button
              className="cursor-pointer px-2 py-1 rounded-full hover:bg-gray-400 ml-1"
              onClick={() => navigate("/")}
              title="Trang chủ"
            >
              <HomeIcon style={{ color: "#1976d2" }} />
            </button>
            <button
              className="cursor-pointer px-2 py-1 rounded-full hover:bg-gray-400 ml-auto"
              onClick={toggleFullScreen}
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </button>
          </div>
        ) : (
          <div className="p-2 text-end bg-gray-200">
            <button
              className="cursor-pointer px-2 py-1 rounded-full hover:bg-gray-400 mr-1"
              onClick={() => navigate("/")}
              title="Trang chủ"
            >
              <HomeIcon style={{ color: "#1976d2" }} />
            </button>
            <button
              className="cursor-pointer px-2 py-1 rounded-full hover:bg-gray-400 ml-auto"
              onClick={toggleFullScreen}
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </button>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
