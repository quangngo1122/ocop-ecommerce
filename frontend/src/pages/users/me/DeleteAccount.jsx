import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DeleteAccount() {
  const [confirm, setConfirm] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    // TODO: Thực hiện gọi API xóa tài khoản ở đây
    alert("Tài khoản đã được xóa!");
    navigate("/login");
  };
  return (
    <div className="w-230 mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 ">Xóa tài khoản</h2>
      <p className="mb-4">
        Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.
      </p>
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={confirm}
          onChange={() => setConfirm(!confirm)}
          className="mr-2"
        />
        Tôi xác nhận muốn xóa tài khoản của mình.
      </label>
      <button
        className={`px-4 cursor-pointer py-2 rounded text-white ${
          confirm
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!confirm}
        onClick={handleDelete}
      >
        Xóa tài khoản
      </button>
    </div>
  );
}
