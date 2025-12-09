"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var shopSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: {
    type: String
  },
  logo: {
    type: String
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  coverImage: {
    type: String
  },
  address: {
    name: String,
    phone: String,
    address: String,
    province: String,
    district: String,
    ward: String,
    province_id: Number,
    district_id: Number,
    ward_code: Number
  },
  contact: {
    phone: String,
    email: String
  },
  businessLicense: [{
    id: _mongoose["default"].Schema.Types.ObjectId,
    name: String,
    code: String,
    description: String,
    images: [String]
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
    "enum": ["pending", "active", "suspended", "closed"],
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
var Shop = _mongoose["default"].model("Shop", shopSchema);
var _default = exports["default"] = Shop;