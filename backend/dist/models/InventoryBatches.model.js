"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var inventoryBatchesSchema = new _mongoose["default"].Schema({
  product_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },
  variant_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "ProductVariant",
    index: true
  },
  batch_number: {
    type: String,
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  remaining_quantity: {
    type: Number,
    required: true,
    min: 0
  },
  import_price: {
    type: Number,
    required: true,
    // hoặc false nếu không bắt buộc
    min: 0
  },
  import_date: {
    type: Date,
    required: true
  }
});
var InventoryBatch = _mongoose["default"].model("InventoryBatches", inventoryBatchesSchema);
var _default = exports["default"] = InventoryBatch;