"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var variantSchema = new _mongoose["default"].Schema({
  product_id: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  selling_price: {
    type: Number
  },
  image: {
    type: String
  },
  stock_quantity: {
    type: Number,
    "default": 0
  },
  attributes: [{
    name: String,
    value: String
  }],
  weight: {
    type: Number,
    "default": 10
  },
  length: {
    type: Number,
    "default": 10
  },
  width: {
    type: Number,
    "default": 10
  },
  height: {
    type: Number,
    "default": 10
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
});
var Variants = _mongoose["default"].model("Variants", variantSchema);
var _default = exports["default"] = Variants;