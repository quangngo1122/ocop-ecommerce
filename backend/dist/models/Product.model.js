"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var productSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  shop_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  category_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  description: {
    "short": String,
    full: String
  },
  images: [String],
  price: {
    regular: {
      type: Number
    },
    sale: {
      type: Number,
      "default": null
    },
    saleStartDate: {
      type: Date
    },
    saleEndDate: {
      type: Date
    },
    min_price: {
      type: Number
    },
    max_price: {
      type: Number
    }
  },
  specifications: [{
    name: String,
    value: String
  }],
  rating: {
    average: {
      type: Number,
      "default": 0
    },
    count: {
      type: Number,
      "default": 0
    }
  },
  status: {
    type: String,
    "enum": ["draft", "pending", "active", "suspended", "deleted"],
    "default": "draft"
  },
  stock: {
    type: Number,
    "default": 0
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  updatedAt: {
    type: Date,
    "default": Date.now
  }
}, {
  timestamps: true
});

// Tạo index cho status
productSchema.index({
  status: 1
});

// Tạo index cho tìm kiếm sản phẩm theo cửa hàng và danh mục
productSchema.index({
  shop_id: 1,
  category_id: 1
});
productSchema.index({
  "price.min_price": 1,
  "price.max_price": 1
});
var Product = _mongoose["default"].model("Product", productSchema);
var _default = exports["default"] = Product;