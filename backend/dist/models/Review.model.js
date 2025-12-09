"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var reviewSchema = new _mongoose["default"].Schema({
  product_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  user_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  shop_order_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "ShopOrder"
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true
  },
  review_images: [String],
  replies: {
    user_id: {
      type: _mongoose["default"].Schema.Types.ObjectId,
      ref: "User"
    },
    content: String,
    createdAt: {
      type: Date,
      "default": Date.now
    }
  },
  status: {
    type: String,
    "enum": ["pending", "approved", "rejected"],
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

// Tạo index cho tìm kiếm đánh giá
reviewSchema.index({
  product: 1,
  createdAt: -1
});
reviewSchema.index({
  user: 1
});
reviewSchema.index({
  rating: 1
});
var Review = _mongoose["default"].model("Review", reviewSchema);
var _default = exports["default"] = Review;