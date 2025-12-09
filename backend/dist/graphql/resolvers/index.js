"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _AuthResolver = _interopRequireDefault(require("./Auth.resolver.js"));
var _UserResolver = _interopRequireDefault(require("./User.resolver.js"));
var _CategoryResolver = _interopRequireDefault(require("./Category.resolver.js"));
var _ShopResolver = _interopRequireDefault(require("./Shop.resolver.js"));
var _ProductResolver = _interopRequireDefault(require("./Product.resolver.js"));
var _ReviewResolver = _interopRequireDefault(require("./Review.resolver.js"));
var _VoucherResolver = _interopRequireDefault(require("./Voucher.resolver.js"));
var _OrderResolver = _interopRequireDefault(require("./Order.resolver.js"));
var _BannerResolver = _interopRequireDefault(require("./Banner.resolver.js"));
var _InventoryBatchesResolver = _interopRequireDefault(require("./InventoryBatches.resolver.js"));
var _CommonResolver = _interopRequireDefault(require("./Common.resolver.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var resolvers = _objectSpread({
  Query: _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, _AuthResolver["default"].Query), _UserResolver["default"].Query), _CategoryResolver["default"].Query), _ShopResolver["default"].Query), _ProductResolver["default"].Query), _ReviewResolver["default"].Query), _VoucherResolver["default"].Query), _OrderResolver["default"].Query), _BannerResolver["default"].Query), _InventoryBatchesResolver["default"].Query),
  Mutation: _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, _AuthResolver["default"].Mutation), _UserResolver["default"].Mutation), _CategoryResolver["default"].Mutation), _ShopResolver["default"].Mutation), _ProductResolver["default"].Mutation), _ReviewResolver["default"].Mutation), _VoucherResolver["default"].Mutation), _OrderResolver["default"].Mutation), _BannerResolver["default"].Mutation), _InventoryBatchesResolver["default"].Mutation)
}, _CommonResolver["default"]);
var _default = exports["default"] = resolvers;