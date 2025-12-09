import React, { useState, useContext, useEffect } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../contexts/ToastProvider";

export default function ChangePasswordPage() {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    if (userData?.provider !== "email") {
      showToast("Truy cập đường dẫn thất bại", "warning");
      navigate("/admin", { replace: true });
    }
  }, [userData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp", "warning");
      return;
    }
    if (newPassword === oldPassword) {
      showToast("Trùng mật khẩu cũ", "warning");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Mật khẩu ít nhất 6 ký tự", "warning");
      return;
    }

    try {
      if (window.confirm("Bạn có chắc chắn muốn đổi mật khẩu?")) {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user || !user.email) {
          showToast("Không tìm thấy người dùng hiện tại", "error");
          return;
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          oldPassword
        );
        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPassword);

        showToast("Đổi mật khẩu thành công", "success");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      if (error.code === "auth/wrong-password") {
        showToast("Mật khẩu cũ không đúng", "error");
      } else {
        showToast("Đổi mật khẩu thất bại", "error");
      }
    }
  };
  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-6">Đổi Mật Khẩu</h1> */}
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-purple-300 rounded-sm inline-block" />
        <h1 className="text-2xl font-bold ">Đổi Mật Khẩu</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 w-full">
        <div className="border shadow border-gray-400 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-400">
            <h2 className="text-lg font-semibold text-gray-700">
              Thay đổi mật khẩu cá nhân
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              <div className="flex">
                <div className="w-64 bg-gray-200 px-4 py-3 text-gray-600 rounded-l flex items-center">
                  Mật Khẩu Cũ
                </div>
                <div className="flex-1 relative">
                  <input
                    // type="password"
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className=" hover:border-blue-400  w-full px-4 py-3 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded-r"
                    required
                  />
                  <button
                    type="button"
                    className=" cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowOldPassword((v) => !v)}
                  >
                    {showOldPassword ? (
                      <VisibilityIcon />
                    ) : (
                      <VisibilityOffIcon />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex relative">
                <div className="w-64 bg-gray-200 px-4 py-3 text-gray-600 rounded-l flex items-center">
                  Mật Khẩu Mới
                </div>
                <div className="flex-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className=" hover:border-blue-400 w-full px-4 py-3 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded-r"
                    required
                  />
                  <button
                    type="button"
                    className=" cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword((v) => !v)}
                  >
                    {showNewPassword ? (
                      <VisibilityIcon />
                    ) : (
                      <VisibilityOffIcon />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex relative">
                <div className="w-64 bg-gray-200 px-4 py-3 text-gray-600 rounded-l flex items-center">
                  Xác Nhận Mật Khẩu
                </div>
                <div className="flex-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className=" hover:border-blue-400 w-full px-4 py-3 border-gray-200 border bg-white focus:border-blue-500 focus:outline-none rounded-r"
                    required
                  />
                  <button
                    type="button"
                    className=" cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? (
                      <VisibilityIcon />
                    ) : (
                      <VisibilityOffIcon />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className=" cursor-pointer px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Cập Nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
