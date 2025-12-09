"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var bannerSchema = new _mongoose["default"].Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  status: {
    type: String,
    "enum": ["active", "inactive"],
    "default": "active"
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});
var Banner = _mongoose["default"].model("Banner", bannerSchema);
var _default = exports["default"] = Banner;