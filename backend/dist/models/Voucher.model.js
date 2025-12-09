"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var voucherSchema = new _mongoose["default"].Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  shop_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Shop"
  },
  description: {
    type: String
  },
  type: {
    type: String,
    "enum": ["percentage", "fixed_amount"],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  max_discount_amount: {
    type: Number
  },
  min_order_value: {
    type: Number
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  usage_limit: {
    type: Number,
    required: true
  },
  usage_count: {
    type: Number,
    "default": 0
  },
  usage_limit_per_user: {
    type: Number,
    "default": 1
  },
  status: {
    type: String,
    "enum": ["active", "paused", "expired", "used_up"],
    "default": "active"
  },
  created_at: {
    type: Date,
    "default": Date.now
  },
  updated_at: {
    type: Date,
    "default": Date.now
  }
});
voucherSchema.index({
  code: 1
});
voucherSchema.index({
  shop_id: 1
});
voucherSchema.index({
  status: 1
});
voucherSchema.index({
  start_date: 1,
  end_date: 1
});
var Voucher = _mongoose["default"].model("Voucher", voucherSchema);
var _default = exports["default"] = Voucher;