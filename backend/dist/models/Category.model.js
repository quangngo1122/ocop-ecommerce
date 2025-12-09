"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var categorySchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  parent: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Category",
    "default": null
  },
  status: {
    type: String,
    "enum": ["active", "inactive"],
    "default": "active"
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
var Category = _mongoose["default"].model("Category", categorySchema);
var _default = exports["default"] = Category;