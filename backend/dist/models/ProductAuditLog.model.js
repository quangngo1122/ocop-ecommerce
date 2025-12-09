"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var productAuditLogSchema = new _mongoose["default"].Schema({
  product_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },
  variant_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Variants",
    index: true
  },
  // Nếu thay đổi thuộc về 1 variant cụ thể
  action_type: {
    // Loại hành động
    type: String,
    "enum": ["product_create", "product_update", "variant_create", "variant_update", "status_change", "product_delete", "product_status_update"],
    required: true
  },
  changes: [{
    // Lưu chi tiết các trường đã thay đổi
    field: String,
    // Tên trường, ví dụ: 'name', 'description.full', 'variants.selling_price'
    old_value: _mongoose["default"].Schema.Types.Mixed,
    // Giá trị cũ
    new_value: _mongoose["default"].Schema.Types.Mixed // Giá trị mới
  }]
}, {
  timestamps: true
});
var ProductAuditLog = _mongoose["default"].model("ProductAuditLog", productAuditLogSchema);
var _default = exports["default"] = ProductAuditLog;