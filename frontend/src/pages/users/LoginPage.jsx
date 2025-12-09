import GoogleIcon from "@mui/icons-material/Google";
import { sendPasswordResetEmail } from "firebase/auth";

import React, { useState, useContext, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastProvider";

export default function LoginPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  // đăng nhập với email và mật khẩu
  const handleLoginWithEmail = async () => {
    if (!email || !password) {
      showToast("Vui lòng nhập đầy đủ email và mật khẩu", "error");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Đăng nhập thành công", "success");
      navigate("/");
    } catch (error) {
      console.error("Đăng nhập thất bại:", error.code, error.message);

      switch (error.code) {
        case "auth/invalid-credential":
          showToast(
            "Tài khoản đã được đăng nhập bằng phương thức khác",
            "error"
          );
          break;
        case "auth/invalid-email":
          showToast("Email không hợp lệ", "error");
          break;
        case "auth/user-not-found":
          showToast("Email chưa được đăng ký", "error");
          break;
        case "auth/wrong-password":
          showToast("Sai mật khẩu", "error");
          break;
        case "auth/user-disabled":
          showToast("Tài khoản đã bị khóa", "error");
          break;
        default:
          showToast("Đăng nhập thất bại. Vui lòng thử lại", "error");
          break;
      }
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const token = await user.getIdToken();
      localStorage.setItem("accessToken", token);

      showToast("Đăng nhập thành công", "success");
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      showToast("Đăng nhập thất bại. Vui lòng thử lại.", "error");
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      showToast("Vui lòng nhập email để đặt lại mật khẩu", "error");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showToast(
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến.",
        "success"
      );
    } catch (error) {
      console.error("Forgot Password Error:", error);
      if (error.code === "auth/user-not-found") {
        showToast("Email không tồn tại", "error");
      } else if (error.code === "auth/invalid-email") {
        showToast("Email không hợp lệ", "error");
      } else {
        showToast("Đã xảy ra lỗi. Vui lòng thử lại.", "error");
      }
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      {/* Card form */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-green-600 text-white py-5 text-center">
          <h1 className="text-xl font-bold tracking-wide flex items-center justify-center gap-2">
            Đăng nhập
          </h1>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              className="w-full h-11 mt-1 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              type="email"
              placeholder="Nhập Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Mật khẩu</label>
            <input
              className="w-full h-11 mt-1 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end">
            <a
              className="text-sm font-medium text-red-500 cursor-pointer hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Quên mật khẩu?
            </a>
          </div>

          <button
            onClick={handleLoginWithEmail}
            className="w-full bg-green-600 cursor-pointer hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
          >
            Đăng nhập
          </button>

          <div className="text-center text-sm text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-green-600 font-medium cursor-pointer hover:underline"
            >
              Đăng ký
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-400">Hoặc</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            onClick={handleLoginWithGoogle}
            className="flex items-center justify-center gap-2 w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-[#D34836]">
              <GoogleIcon />
            </span>
            <span className="text-sm cursor-pointer">Đăng nhập với Google</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 py-4 text-center flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 cursor-pointer text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            ← Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
