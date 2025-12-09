"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var orderSchema = new _mongoose["default"].Schema({
  order_code: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amounts: {
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      required: true
    },
    total_discount: {
      type: Number,
      "default": 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      "enum": ["cod", "bank_transfer", "credit_card", "paypal"],
      "default": "cod",
      required: true
    },
    status: {
      type: String,
      "enum": ["pending", "confirmed", "preparing", "transit", "delivered", "failed", "cancelled_by_shop", "cancelled_by_buyer"],
      "default": "pending"
    },
    transactionId: String,
    paid_at: Date
  },
  status: {
    type: String,
    "enum": ["pending", "confirmed", "preparing", "transit", "delivered", "failed", "cancelled_by_shop", "cancelled_by_buyer"],
    "default": "pending"
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  updatedAt: {
    type: Date,
    "default": Date.now
  }
});

// Tạo virtual field shopOrders
orderSchema.virtual("shopOrders", {
  ref: "ShopOrder",
  localField: "_id",
  // _id của Order
  foreignField: "order_id" // field order_id trong ShopOrder
});

// Cho phép trả về cả virtual khi dùng toJSON/toObject
orderSchema.set("toObject", {
  virtuals: true
});
orderSchema.set("toJSON", {
  virtuals: true
});

// Tạo index cho tìm kiếm đơn hàng
orderSchema.index({
  buyer: 1,
  createdAt: -1
});
orderSchema.index({
  status: 1
});
orderSchema.index({
  "items.shop": 1
});
var Order = _mongoose["default"].model("Order", orderSchema);
var _default = exports["default"] = Order;