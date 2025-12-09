import mongoose from "mongoose";

const productAuditLogSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variants",
      index: true,
    }, // Nếu thay đổi thuộc về 1 variant cụ thể
    action_type: {
      // Loại hành động
      type: String,
      enum: [
        "product_create",
        "product_update",
        "variant_create",
        "variant_update",
        "status_change",
        "product_delete",
        "product_status_update",
      ],
      required: true,
    },
    changes: [
      {
        // Lưu chi tiết các trường đã thay đổi
        field: String, // Tên trường, ví dụ: 'name', 'description.full', 'variants.selling_price'
        old_value: mongoose.Schema.Types.Mixed, // Giá trị cũ
        new_value: mongoose.Schema.Types.Mixed, // Giá trị mới
      },
    ],
  },
  { timestamps: true }
);

const ProductAuditLog = mongoose.model(
  "ProductAuditLog",
  productAuditLogSchema
);
export default ProductAuditLog;
