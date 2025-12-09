export default function ColAllPageSeller({ type }) {
  if (type === "product") {
    return (
      <thead className="bg-gray-100">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Tên
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Ảnh
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Danh mục
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Giá
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Tồn kho
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Trạng thái
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Ngày tạo
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Ngày cập nhật
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border border-gray-200">
            Thao tác
          </th>
        </tr>
      </thead>
    );
  }
  if (type === "productManagement") {
    return (
      <thead>
        <tr>
          <th className="px-3 py-3 border border-gray-300 text-center">STT</th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Tên sản phẩm
          </th>
          <th className="px-6 py-3 border border-gray-300 text-center">Ảnh</th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Danh mục
          </th>
          <th className="px-3 py-3 border border-gray-300 text-center">
            Tồn kho
          </th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Giá thấp nhất
          </th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Giá cao nhất
          </th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Trạng thái
          </th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Ngày tạo
          </th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Ngày cập nhật
          </th>
          <th className="px-6 py-3 border border-gray-300 text-center">
            Thao tác
          </th>
        </tr>
      </thead>
    );
  }
  // if (type === "orderDetail") {
  //   return (
  //     <thead>
  //       <tr>
  //         <th className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600">
  //           Tên SP
  //         </th>
  //         <th className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600">
  //           Hình Ảnh
  //         </th>
  //         <th className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600">
  //           Màu
  //         </th>
  //         <th className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600">
  //           Kích Thước
  //         </th>
  //         <th className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600">
  //           Số Lượng
  //         </th>
  //         <th className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600">
  //           Đơn Giá
  //         </th>
  //         <th className="px-4 py-2 border bg-gray-50 text-left text-sm font-semibold text-gray-600">
  //           Thành Tiền
  //         </th>
  //       </tr>
  //     </thead>
  //   );
  // }
  if (type === "order") {
    return (
      <thead className="">
        <tr>
          <th className="px-1 py-1 text-center border-gray-300 border">
            Mã Đơn
          </th>
          <th className="px-1 py-1 text-center border-gray-300 border">
            Khách hàng
          </th>
          <th className="px-1 py-2 text-center border-gray-300 border">
            Sản phẩm
          </th>
          {/* <th className="px-1 py-1 text-center border-gray-300 border">
            Email
          </th> */}
          {/* <th className="px-1 py-1 text-center border-gray-300 border">
            Tạm tính
          </th>
          <th className="px-1 py-1 text-center border-gray-300 border">
            Phí ship
          </th>
          <th className="px-1 py-1 text-center border-gray-300 border">
            Tổng giảm
          </th> */}
          <th className="px-1 py-1 text-center border-gray-300 border">
            Tổng tiền
          </th>
          <th className="px-1 py-1 text-center border-gray-300 border">
            Phương thức thanh toán
          </th>
          <th className="px-1 py-1 text-center border-gray-300 border">
            Trạng thái
          </th>
          {/* <th className="px-1 py-2 text-center border-gray-300 border">
            Ngày đặt hàng
          </th> */}
          <th className="px-1 py-1 text-center border-gray-300 border">
            Thao tác
          </th>
        </tr>
      </thead>
    );
  }
  if (type === "review") {
    return (
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Sản phẩm</th>
          <th className="border border-gray-300 px-4 py-2">Người đánh giá</th>
          <th className="border border-gray-300 px-4 py-2">Điểm</th>
          <th className="border border-gray-300 px-4 py-2">Nội dung</th>
          <th className="border border-gray-300 px-4 py-2">Hình ảnh</th>
          <th className="border border-gray-300 px-4 py-2">Trạng thái</th>
          <th className="border border-gray-300 px-4 py-2">Phản hồi</th>
        </tr>
      </thead>
    );
  }
  if (type === "voucher") {
    return (
      <thead className="divide-y divide-gray-200">
        <tr className="transition duration-150 bg-gradient-to-br from-blue-400 via-blue-200 to-blue-400">
          <th className="border px-4 py-2 border-gray-200">Mã</th>
          <th className="border px-4 py-2 border-gray-200">Mô tả</th>
          <th className="border px-4 py-2 border-gray-200">Loại</th>
          <th className="border px-4 py-2 border-gray-200">Giá trị</th>
          <th className="border px-4 py-2 border-gray-200">Giảm tối đa</th>
          <th className="border px-4 py-2 border-gray-200">Đơn tối thiểu</th>
          <th className="border px-4 py-2 border-gray-200">Ngày bắt đầu</th>
          <th className="border px-4 py-2 border-gray-200">Ngày kết thúc</th>
          <th className="border px-4 py-2 border-gray-200">Giới hạn</th>
          <th className="border px-4 py-2 border-gray-200">Đã dùng</th>
          <th className="border px-4 py-2 border-gray-200">Giới hạn/người</th>
          <th className="border px-4 py-2 border-gray-200">Trạng thái</th>
          <th className="border px-4 py-2 border-gray-200">Thao tác</th>
        </tr>
      </thead>
    );
  }
  if (type === "category") {
    return (
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 border border-gray-200">STT</th>
          <th className="px-3 py-3 border border-gray-200 text-center">
            Tên danh mục
          </th>
          <th className="px-3 py-3 border border-gray-200 text-center">Slug</th>
          <th className="px-3 py-3 border border-gray-200 text-center">
            Danh mục cha
          </th>
          <th className="px-3 py-3 border border-gray-200 text-center">
            Ngày tạo
          </th>
          <th className="px-3 py-3 border border-gray-200 text-center">
            Ngày cập nhật
          </th>
          <th className="px-3 py-3 border border-gray-200 text-center">
            Trạng thái
          </th>
          <th className="px-3 py-3 border border-gray-200 text-center">
            Thao tác
          </th>
        </tr>
      </thead>
    );
  }
  if (type === "adminUser") {
    return (
      <thead className="bg-gray-100">
        <tr>
          <th className="px-2 py-3 border border-gray-300">STT</th>
          <th className="px-2 py-3 border border-gray-300">Tên</th>
          <th className="px-2 py-3 border border-gray-300">Avatar</th>
          <th className="px-2 py-3 border border-gray-300">Email</th>
          <th className="px-2 py-3 border border-gray-300">Vai trò</th>
          <th className="px-2 py-3 border border-gray-300">Trạng thái</th>
          <th className="px-2 py-3 border border-gray-300">Ngày tạo</th>
          <th className="px-2 py-3 border border-gray-300">Thao tác</th>
        </tr>
      </thead>
    );
  }
  if (type === "adminShop") {
    return (
      <thead className="bg-gray-100">
        <tr>
          <th className="px-2 py-3 border border-gray-300">STT</th>
          <th className="px-2 py-3 border border-gray-300">Logo</th>
          <th className="px-2 py-3 border border-gray-300">Tên Shop</th>
          <th className="px-2 py-3 border border-gray-300">Chủ Shop</th>
          <th className="px-2 py-3 border border-gray-300">Trạng thái</th>
          <th className="px-2 py-3 border border-gray-300">Ngày tạo</th>
          <th className="px-2 py-3 border border-gray-300">Ngày cập nhật</th>
          <th className="px-2 py-3 border border-gray-300">Hành động</th>
        </tr>
      </thead>
    );
  }
  if (type === "adminProduct") {
    return (
      <thead className="bg-gray-100">
        <tr>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            STT
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Tên sản phẩm
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Ảnh
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Shop
          </th>
          {/* <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">Mô tả ngắn</th> */}
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Danh mục
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Giá cao nhất
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Giá thấp nhất
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Đánh giá
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Tồn kho
          </th>
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Trạng thái
          </th>
          {/* <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">Ngày tạo</th>
              <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">Ngày cập nhật</th> */}
          <th className="px-2 py-3 border text-gray-600 bg-gray-100 border-gray-300">
            Xem
          </th>
        </tr>
      </thead>
    );
  }
  if (type === "adminOrder") {
    return (
      <thead className="bg-gray-100">
        <tr>
          <th className="px-2 py-3 border border-gray-300">STT</th>
          <th className="px-2 py-3 border border-gray-300">Mã đơn</th>
          <th className="px-2 py-3 border border-gray-300">Sản phẩm</th>
          <th className="px-2 py-3 border border-gray-300">Shop</th>
          <th className="px-2 py-3 border border-gray-300">Khách hàng</th>
          {/* <th className="px-2 py-3 border border-gray-300">Email</th> */}
          {/* <th className="px-2 py-3 border border-gray-300">Tạm tính</th>
          <th className="px-2 py-3 border border-gray-300">Phí ship</th>
          <th className="px-2 py-3 border border-gray-300">Giảm giá</th> */}
          <th className="px-2 py-3 border border-gray-300">Tổng tiền</th>
          <th className="px-2 py-3 border border-gray-300">Thanh toán</th>
          <th className="px-2 py-3 border border-gray-300">Trạng thái</th>
          <th className="px-2 py-3 border border-gray-300">Ngày tạo</th>
          <th className="px-2 py-3 border border-gray-300">Hành động</th>
        </tr>
      </thead>
    );
  }
  if (type === "adminOrderShop") {
    return (
      <thead className="bg-gray-100">
        <tr>
          <th className="px-2 py-3 border border-gray-300">STT</th>
          <th className="px-2 py-3 border border-gray-300">Mã đơn</th>
          <th className="px-2 py-3 border border-gray-300">Sản phẩm</th>
          <th className="px-2 py-3 border border-gray-300">Khách hàng</th>
          {/* <th className="px-2 py-3 border border-gray-300">Email</th>
          <th className="px-2 py-3 border border-gray-300">Tạm tính</th>
          <th className="px-2 py-3 border border-gray-300">Phí ship</th>
          <th className="px-2 py-3 border border-gray-300">Giảm giá</th> */}
          <th className="px-2 py-3 border border-gray-300">Tổng tiền</th>
          <th className="px-2 py-3 border border-gray-300">Thanh toán</th>
          <th className="px-2 py-3 border border-gray-300">Trạng thái</th>
          <th className="px-2 py-3 border border-gray-300">Ngày tạo</th>
          <th className="px-2 py-3 border border-gray-300">Hành động</th>
        </tr>
      </thead>
    );
  }
  if (type === "adminDashboardProduct") {
    return (
      <thead className="text-[#b2c2b0] border-b">
        <tr>
          <th className="py-2 px-2">Sản phẩm</th>
          <th className="py-2 px-2 text-center">Danh mục</th>
          <th className="py-2 px-2 text-center">Shop</th>
          <th className="py-2 px-2 text-center">Tồn kho</th>
          <th className="py-2 px-2 text-center">Giá cao nhất</th>
          <th className="py-2 px-2 text-center">Giá thấp nhất</th>
          <th className="py-2 px-2 text-center">Trạng thái</th>
          <th className="py-2 px-2 text-center">Hành động</th>
        </tr>
      </thead>
    );
  }

  return null;
}
