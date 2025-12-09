"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var shopOrderSchema = new _mongoose["default"].Schema({
  user_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  order_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  order_code: {
    type: String,
    required: true,
    unique: true
  },
  shop_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  shipping: {
    from_address: {
      name: String,
      phone: String,
      address: String,
      provinvece: String,
      district: String,
      ward: String,
      province_id: Number,
      district_id: Number,
      ward_code: Number
    },
    to_address: {
      name: String,
      phone: String,
      address: String,
      provinvece: String,
      district: String,
      ward: String,
      province_id: Number,
      district_id: Number,
      ward_code: Number
    },
    method: String,
    status: {
      type: String,
      "enum": ["pending", "confirmed", "preparing", "transit", "delivered", "failed", "cancelled_by_shop", "cancelled_by_buyer"],
      "default": "pending"
    },
    tracking_code: String
  },
  items: [{
    variant_id: {
      type: _mongoose["default"].Schema.Types.ObjectId,
      ref: "Variants",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      "default": 0
    }
  }],
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
  current_status: {
    type: String,
    "enum": ["pending", "confirmed", "preparing", "transit", "delivered", "failed", "cancelled_by_shop", "cancelled_by_buyer"],
    "default": "pending"
  },
  status_history: [{
    status: {
      type: String,
      "enum": ["pending", "confirmed", "preparing", "transit", "delivered", "failed", "cancelled_by_shop", "cancelled_by_buyer"],
      required: true
    },
    updatedAt: {
      type: Date,
      "default": Date.now
    }
  }],
  // discount: [
  //   {
  //     value: {
  //       type: N,
  //     },
  //     discount_code: String,
  //     applied_at: {
  //       type: Date,
  //       default: Date.now,
  //     },
  //   },
  // ],
  cancel_reason: {
    type: String,
    "enum": ["customer_request", "out_of_stock", "shipping_issue", "other"],
    "default": null
  },
  return_reason: {
    type: String,
    "enum": ["defective", "not_as_described", "customer_request", "other"],
    "default": null
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
var ShopOrder = _mongoose["default"].model("ShopOrder", shopOrderSchema);
var _default = exports["default"] = ShopOrder;