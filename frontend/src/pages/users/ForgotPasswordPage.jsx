import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "../../contexts/ToastProvider";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleResetPassword = async () => {
    if (!email) {
      showToast("Vui lòng nhập email", "error");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Email đặt lại mật khẩu đã được gửi", "success");
      navigate("/login"); // gửi xong quay về trang đăng nhập
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

  return (
    <div className="flex w-full h-screen justify-center items-center bg-[#f6f6f6]">
      <div className="w-96 bg-white p-6 rounded-md shadow-md">
        <h1 className="text-xl font-bold mb-4">Quên mật khẩu</h1>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
        />
        <button
          onClick={handleResetPassword}
          className="w-full cursor-pointer  bg-[#5aa32a] text-white py-2 rounded-md"
        >
          Gửi email đặt lại mật khẩu
        </button>
        <p
          className="mt-4  text-sm text-blue-500 cursor-pointer underline"
          onClick={() => navigate("/login")}
        >
          Quay lại đăng nhập
        </p>
      </div>
    </div>
  );
}
