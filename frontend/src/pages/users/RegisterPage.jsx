import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { getAuth } from "firebase/auth";

import { useToast } from "../../contexts/ToastProvider";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
// -------------------------- Grapql ----------------------------------
const REGISTER_USER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        _id
      }
    }
  }
`;
// -------------------------- Component ----------------------------------
export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const auth = getAuth();
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    repeatPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [register] = useMutation(REGISTER_USER);
  const handleSubmit = async () => {
    // 1️⃣ Kiểm tra dữ liệu đầu vào
    if (!form.name.trim()) {
      showToast("Vui lòng nhập họ và tên.", "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      showToast("Email không hợp lệ.", "error");
      return;
    }

    if (form.password !== form.repeatPassword) {
      showToast("Mật khẩu không khớp. Vui lòng kiểm tra lại.", "error");
      return;
    }

    if (form.password.length < 6) {
      showToast("Mật khẩu phải có ít nhất 6 ký tự.", "error");
      return;
    }
    setLoading(true);
    let firebaseUser = null;
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      firebaseUser = result.user;

      // 3️⃣ Cập nhật tên hiển thị
      await updateProfile(firebaseUser, { displayName: form.name });

      // 4️⃣ Gọi GraphQL register
      const response = await register({
        variables: {
          input: {
            firebaseUid: firebaseUser.uid,
          },
        },
      });

      // 5️⃣ Kiểm tra lỗi server trả về
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      // 6️⃣ Đăng xuất Firebase sau khi đăng ký thành công
      await signOut(auth);
      showToast("Đăng ký thành công. Vui lòng đăng nhập.", "success");
      navigate("/login");
    } catch (error) {
      console.error("Register Error:", error);

      // 7️⃣ Rollback Firebase nếu GraphQL lỗi
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
          console.log("Rollback Firebase user thành công.");
        } catch (deleteError) {
          console.error("Không thể rollback Firebase user:", deleteError);
        }
      }

      // 8️⃣ Hiển thị lỗi chi tiết
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        showToast(error.graphQLErrors[0].message, "error");
      } else if (error.code === "auth/email-already-in-use") {
        showToast("Email này đã được sử dụng.", "error");
      } else if (error.code === "auth/weak-password") {
        showToast("Mật khẩu quá yếu.", "error");
      } else {
        showToast(
          error.message || "Đăng ký không thành công. Vui lòng thử lại sau.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-green-600 text-white py-5 text-center">
          <h1 className="text-xl font-bold tracking-wide flex items-center justify-center gap-2">
            Đăng ký tài khoản
          </h1>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              className="w-full h-11 mt-1 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              type="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Họ và tên</label>
            <input
              className="w-full h-11 mt-1 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Mật khẩu</label>
            <input
              className="w-full h-11 mt-1 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Nhập lại mật khẩu</label>
            <input
              className="w-full h-11 mt-1 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              type="password"
              placeholder="••••••••"
              value={form.repeatPassword}
              onChange={(e) =>
                setForm({ ...form, repeatPassword: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 cursor-pointer  hover:bg-green-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin cursor-pointer rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Đang đăng ký...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 py-4 text-center text-sm text-gray-600">
          Bạn đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 font-medium cursor-pointer hover:underline"
          >
            Đăng nhập
          </span>
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
