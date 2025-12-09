"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _UserModel = _interopRequireDefault(require("./User.model.js"));
var _ProductModel = _interopRequireDefault(require("./Product.model.js"));
var _ProductAuditLogModel = _interopRequireDefault(require("./ProductAuditLog.model.js"));
var _CategoryModel = _interopRequireDefault(require("./Category.model.js"));
var _OrderModel = _interopRequireDefault(require("./Order.model.js"));
var _ReviewModel = _interopRequireDefault(require("./Review.model.js"));
var _ShopModel = _interopRequireDefault(require("./Shop.model.js"));
var _ShopOrderModel = _interopRequireDefault(require("./ShopOrder.model.js"));
var _InventoryBatchesModel = _interopRequireDefault(require("./InventoryBatches.model.js"));
var _BannerModel = _interopRequireDefault(require("./Banner.model.js"));
var _VariantsModel = _interopRequireDefault(require("./Variants.model.js"));
var _VoucherModel = _interopRequireDefault(require("./Voucher.model.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var _default = exports["default"] = {
  User: _UserModel["default"],
  Product: _ProductModel["default"],
  Category: _CategoryModel["default"],
  Order: _OrderModel["default"],
  Review: _ReviewModel["default"],
  Shop: _ShopModel["default"],
  ProductAuditLog: _ProductAuditLogModel["default"],
  ShopOrder: _ShopOrderModel["default"],
  InventoryBatch: _InventoryBatchesModel["default"],
  Banner: _BannerModel["default"],
  Variants: _VariantsModel["default"],
  Voucher: _VoucherModel["default"]
};