import React, { useEffect, useState, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SellerSidebar from "../../components/seller/SellerSidebar";
// import ResizeSellerSidebar from "../../components/seller/ResizeSellerSidebar";
import { AuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../contexts/ToastProvider";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";

// import { useQuery, gql } from "@apollo/client";

// const MY_SHOP_QUERY = gql`
//   query MyShop {
//     myShop {
//       _id
//       status
//     }
//   }
// `;

export default function SellerLayout() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const { showToast } = useToast();
  const roleUser = userData?.role;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const screenIsLarge = window.innerWidth >= 1024;
      setIsLargeScreen(screenIsLarge);
      setUseLargeSidebar(screenIsLarge);
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

  useEffect(() => {
    const screenIsLarge = window.innerWidth >= 1024;
    setIsLargeScreen(screenIsLarge);
    setUseLargeSidebar(screenIsLarge);
    setIsReady(true);
  }, []);

  if (!isReady || typeof roleUser === "undefined") {
    return (
      // <div className="flex items-center justify-center h-screen bg-gray-100">
      //   <div className="text-gray-500 text-lg">Đang tải giao diện...</div>
      // </div>
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

  if (roleUser == "seller") {
    return (
      <div className="flex h-screen bg-gray-100">
        <SellerSidebar
          collapsed={!useLargeSidebar}
          toggleSidebar={toggleSidebar}
        />

        {/* {useLargeSidebar ? (
          <SellerSidebar toggleSidebar={toggleSidebar} />
        ) : (
          <ResizeSellerSidebar />
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
}
