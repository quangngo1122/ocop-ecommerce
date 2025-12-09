import React from "react";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";

export default function Footer() {
  return (
    <footer className="bg-[#5aa32a] text-gray-300">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Cột 1: Giới thiệu và liên hệ */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Cần Thơ Mart</h3>
            <p className="text-sm">
              Nền tảng thương mại điện tử hàng đầu, mang đặc sản từ các địa
              phương Việt Nam đến mọi nhà.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <LocationOnIcon className="w-5 h-5 mr-3 text-yellow-400" />
                <span>Đường Nguyễn Văn Cừ, An Hòa, Ninh Kiều, Cần Thơ</span>
              </div>
              <div className="flex items-center">
                <LocalPhoneIcon className="w-5 h-5 mr-3 text-yellow-400" />
                <span>0335226656</span>
              </div>
              <div className="flex items-center">
                <EmailIcon className="w-5 h-5 mr-3 text-yellow-400" />
                <span>hotro@canthomart.vn</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Về Chúng Tôi
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Giới thiệu Cần Thơ Mart
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Về chương trình OCOP
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Câu chuyện sản phẩm
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Chính sách vận chuyển
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng phân cách */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Cần Thơ Mart. Đã đăng ký bản
              quyền.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
