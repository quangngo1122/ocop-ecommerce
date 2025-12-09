//mail:  admin1@gmail.com
//pass:  admin1

import React, { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useApolloClient, gql } from "@apollo/client";
import HomeIcon from "@mui/icons-material/Home";
import { useToast } from "../../contexts/ToastProvider";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// -----------------------GRAPQL-----------------------

const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      _id
      email
      role
    }
  }
`;

// ----------------------------------------------------

export default function LoginAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const client = useApolloClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("accessToken", token);

      const { data } = await client.query({
        query: GET_CURRENT_USER,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        fetchPolicy: "no-cache",
      });

      if (data?.getCurrentUser?.role === "ADMIN") {
        showToast("Đăng nhập admin thành công - Welcome Admin", "success");
        navigate("/admin");
      } else {
        setError("Bạn không phải admin!");
        localStorage.removeItem("accessToken");
        showToast("Bạn không phải admin!", "warning");
      }
    } catch (err) {
      setError("Đăng nhập thất bại hoặc bạn không phải admin!");
      showToast("Đăng nhập thất bại hoặc bạn không phải admin!", "warning");
    }
  };

  const handleLoginWithGoogle = async () => {
    setError("");
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      localStorage.setItem("accessToken", token);

      // Kiểm tra role
      const { data } = await client.query({
        query: GET_CURRENT_USER,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        fetchPolicy: "no-cache",
      });

      if (data?.getCurrentUser?.role === "ADMIN") {
        showToast("Đăng nhập admin thành công", "success");
        navigate("/admin");
      } else {
        setError("Bạn không phải admin!");
        showToast("Bạn không phải admin!", "warning");
        localStorage.removeItem("accessToken");
      }
    } catch (err) {
      setwarning("Đăng nhập thất bại hoặc bạn không phải admin!");
      showToast("Đăng nhập thất bại hoặc bạn không phải admin! ", "warning");
      localStorage.removeItem("accessToken");
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-[#f5faf6]">
    <div className="relative min-h-screen flex items-center justify-center bg-[#f5faf6]">
      <img
        src="bg.jpg"
        alt=""
        className="w-full h-full absolute object-cover"
      />
      {/* <div className="w-full max-w-md bg-white bg-opacity-70 rounded-2xl shadow-lg pt-5 p-10"> */}
      <div className="w-full max-w-md bg-white bg-opacity-70 rounded-2xl shadow-lg pt-5 p-10 z-50">
        <button
          onClick={() => navigate("/")}
          className=" bg-white bg-opacity-80 rounded-full p-2 m-2 cursor-pointer hover:p-3 hover:m-1 ease-in-out shadow hover:bg-green-100 transition"
          title="Về trang chủ"
        >
          <HomeIcon color="primary" />
        </button>
        <h2 className="text-2xl font-normal text-green-700 mb-1 text-center">
          Welcome to,
        </h2>
        <h1 className="text-4xl font-bold text-pink-500 mb-8 text-center">
          Admin
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 text-lg placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 text-lg placeholder-gray-400 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
          <button
            type="submit"
            className="cursor-pointer w-full bg-green-400 hover:bg-green-500 text-white text-xl font-medium py-3 rounded-full transition mb-4"
          >
            Login
          </button>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-400 text-sm">OR Continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {/* <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-gray-700 font-medium">Google</span>
            </button> */}
            <button
              type="button"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
              onClick={handleLoginWithGoogle}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                alt="Google"
                className="w-15 h-5"
              />
              {/* <span className="text-gray-700 font-medium">Google</span> */}
            </button>
            {/* <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-5 h-5"
              >
                <circle cx="16" cy="16" r="16" fill="#1877f3" />
                <path
                  d="M21.5 16h-3v8h-3v-8h-2v-3h2v-2c0-1.7 1.3-3 3-3h2v3h-2c-.6 0-1 .4-1 1v1h3l-.5 3z"
                  fill="#fff"
                />
              </svg>
              <span className="text-gray-700 font-medium">Facebook</span>
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}
