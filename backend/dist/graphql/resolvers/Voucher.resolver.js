"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _graphql = require("graphql");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var voucherResolvers = {
  Query: {
    voucher: function () {
      var _voucher = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, _ref, _ref2) {
        var _id, models, voucher;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _id = _ref._id;
              models = _ref2.models;
              _context.n = 1;
              return models.Voucher.findById(_id).populate("shop_id");
            case 1:
              voucher = _context.v;
              if (voucher) {
                _context.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("voucher not found", {
                extensions: {
                  code: "VOUCHER_NOT_FOUND"
                }
              });
            case 2:
              return _context.a(2, voucher);
          }
        }, _callee);
      }));
      function voucher(_x, _x2, _x3) {
        return _voucher.apply(this, arguments);
      }
      return voucher;
    }(),
    validateVoucher: function () {
      var _validateVoucher = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, _ref3, _ref4) {
        var code, orderAmount, models, user, voucher, now, userUsage;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              code = _ref3.code, orderAmount = _ref3.orderAmount;
              models = _ref4.models, user = _ref4.user;
              if (user) {
                _context2.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("user not found", {
                extensions: {
                  code: "USER_NOT_FOUND"
                }
              });
            case 1:
              _context2.n = 2;
              return models.Voucher.findOne({
                code: code.toUpperCase()
              }).populate("shop_id");
            case 2:
              voucher = _context2.v;
              if (voucher) {
                _context2.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("voucher not found", {
                extensions: {
                  code: "VOUCHER_NOT_FOUND"
                }
              });
            case 3:
              // Check if voucher is active
              now = new Date();
              if (!(now < voucher.start_date || now > voucher.end_date)) {
                _context2.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("voucher not found", {
                extensions: {
                  code: "VOUCHER_NOT_FOUND"
                }
              });
            case 4:
              if (!(voucher.usage_count >= voucher.usage_limit)) {
                _context2.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("user already to use", {
                extensions: {
                  code: "USER_ALREADY_TO_USE"
                }
              });
            case 5:
              if (!(voucher.min_order_value && orderAmount < voucher.min_order_value)) {
                _context2.n = 6;
                break;
              }
              throw new _graphql.GraphQLError("Order amount must be at least ".concat(voucher.min_order_value), {
                extensions: {
                  code: "Order amount must be at least ".concat(voucher.min_order_value)
                }
              });
            case 6:
              _context2.n = 7;
              return models.Order.countDocuments({
                "vouchers.code": code.toUpperCase(),
                user_id: user.id
              });
            case 7:
              userUsage = _context2.v;
              if (!(userUsage >= voucher.usage_limit_per_user)) {
                _context2.n = 8;
                break;
              }
              throw new _graphql.GraphQLError("You have reached the usage limit for this voucher", {
                extensions: {
                  code: "You have reached the usage limit for this voucher"
                }
              });
            case 8:
              return _context2.a(2, voucher);
          }
        }, _callee2);
      }));
      function validateVoucher(_x4, _x5, _x6) {
        return _validateVoucher.apply(this, arguments);
      }
      return validateVoucher;
    }(),
    shopVouchers: function () {
      var _shopVouchers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_, _ref5, _ref6) {
        var shopId, filter, pagination, models, query, _ref7, _ref7$offset, offset, _ref7$limit, limit, _yield$Promise$all, _yield$Promise$all2, items, total;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              shopId = _ref5.shopId, filter = _ref5.filter, pagination = _ref5.pagination;
              models = _ref6.models;
              query = {
                shop_id: shopId
              };
              if (filter) {
                if (filter.status) query.status = filter.status;
                if (filter.type) query.type = filter.type;
                if (filter.fromDate || filter.toDate) {
                  query.start_date = {};
                  if (filter.fromDate) query.start_date.$gte = filter.fromDate;
                  if (filter.toDate) query.start_date.$lte = filter.toDate;
                }
              }
              _ref7 = pagination || {}, _ref7$offset = _ref7.offset, offset = _ref7$offset === void 0 ? 0 : _ref7$offset, _ref7$limit = _ref7.limit, limit = _ref7$limit === void 0 ? 10 : _ref7$limit;
              _context3.n = 1;
              return Promise.all([models.Voucher.find(query).sort({
                createdAt: -1
              }).skip(offset).limit(limit).populate("shop_id"), models.Voucher.countDocuments(query)]);
            case 1:
              _yield$Promise$all = _context3.v;
              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
              items = _yield$Promise$all2[0];
              total = _yield$Promise$all2[1];
              return _context3.a(2, {
                items: items,
                total: total,
                hasMore: offset + items.length < total
              });
          }
        }, _callee3);
      }));
      function shopVouchers(_x7, _x8, _x9) {
        return _shopVouchers.apply(this, arguments);
      }
      return shopVouchers;
    }(),
    availableVouchers: function () {
      var _availableVouchers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(_, _ref8, _ref9) {
        var shopId, orderAmount, pagination, models, user, now, query, _ref0, _ref0$offset, offset, _ref0$limit, limit, _yield$Promise$all3, _yield$Promise$all4, items, total, filteredItems, validVouchers;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              shopId = _ref8.shopId, orderAmount = _ref8.orderAmount, pagination = _ref8.pagination;
              models = _ref9.models, user = _ref9.user;
              if (user) {
                _context5.n = 1;
                break;
              }
              throw new AuthenticationError("You must be logged in to view available vouchers");
            case 1:
              now = new Date();
              query = {
                shop_id: shopId,
                start_date: {
                  $lte: now
                },
                end_date: {
                  $gt: now
                },
                usage_count: {
                  $lt: mongoose.expr({
                    $toLong: "$usage_limit"
                  })
                },
                min_order_value: {
                  $lte: orderAmount
                }
              };
              _ref0 = pagination || {}, _ref0$offset = _ref0.offset, offset = _ref0$offset === void 0 ? 0 : _ref0$offset, _ref0$limit = _ref0.limit, limit = _ref0$limit === void 0 ? 10 : _ref0$limit; // Get vouchers and exclude ones where user has reached their limit
              _context5.n = 2;
              return Promise.all([models.Voucher.find(query).sort({
                created_at: -1
              }).skip(offset).limit(limit).populate("shop_id"), models.Voucher.countDocuments(query)]);
            case 2:
              _yield$Promise$all3 = _context5.v;
              _yield$Promise$all4 = _slicedToArray(_yield$Promise$all3, 2);
              items = _yield$Promise$all4[0];
              total = _yield$Promise$all4[1];
              _context5.n = 3;
              return Promise.all(items.map(/*#__PURE__*/function () {
                var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(voucher) {
                  var userUsage;
                  return _regenerator().w(function (_context4) {
                    while (1) switch (_context4.n) {
                      case 0:
                        _context4.n = 1;
                        return models.Order.countDocuments({
                          "vouchers.code": voucher.code,
                          user_id: user.id
                        });
                      case 1:
                        userUsage = _context4.v;
                        return _context4.a(2, userUsage < voucher.usage_limit_per_user ? voucher : null);
                    }
                  }, _callee4);
                }));
                return function (_x11) {
                  return _ref1.apply(this, arguments);
                };
              }()));
            case 3:
              filteredItems = _context5.v;
              validVouchers = filteredItems.filter(Boolean);
              return _context5.a(2, {
                items: validVouchers,
                total: total,
                hasMore: offset + validVouchers.length < total
              });
          }
        }, _callee5);
      }));
      function availableVouchers(_x0, _x1, _x10) {
        return _availableVouchers.apply(this, arguments);
      }
      return availableVouchers;
    }()
  },
  Mutation: {
    createVoucher: function () {
      var _createVoucher = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(_, _ref10, _ref11) {
        var input, models, user, shop, voucher;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              input = _ref10.input;
              models = _ref11.models, user = _ref11.user, shop = _ref11.shop;
              if (!(!user && !shop)) {
                _context6.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Only shop owners can create vouchers", {
                extensions: {
                  code: "Only shop owners can create vouchers"
                }
              });
            case 1:
              if (!(input.startDate >= input.endDate)) {
                _context6.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("End date must be after start date", {
                extensions: {
                  code: "End date must be after start date"
                }
              });
            case 2:
              if (!(input.type === "percentage" && input.value > 100)) {
                _context6.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Percentage discount cannot exceed 100%", {
                extensions: {
                  code: "Percentage discount cannot exceed 100%"
                }
              });
            case 3:
              voucher = new models.Voucher(_objectSpread(_objectSpread({}, input), {}, {
                code: input.code.toUpperCase(),
                shop_id: shop._id
              }));
              _context6.n = 4;
              return voucher.save();
            case 4:
              return _context6.a(2, voucher);
          }
        }, _callee6);
      }));
      function createVoucher(_x12, _x13, _x14) {
        return _createVoucher.apply(this, arguments);
      }
      return createVoucher;
    }(),
    updateVoucher: function () {
      var _updateVoucher = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(_, _ref12, _ref13) {
        var _id, input, models, user, shop, voucher;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              _id = _ref12._id, input = _ref12.input;
              models = _ref13.models, user = _ref13.user, shop = _ref13.shop;
              _context7.n = 1;
              return models.Voucher.findById(_id);
            case 1:
              voucher = _context7.v;
              if (voucher) {
                _context7.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Voucher not found", {
                extensions: {
                  code: "VOUCHER_NOT_FOUND"
                }
              });
            case 2:
              if (!(!user || shop._id.toString() !== voucher.shop_id.toString())) {
                _context7.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Not authorized to update this voucher", {
                extensions: {
                  code: "NOT_AUTHORIZED"
                }
              });
            case 3:
              if (!(input.startDate && input.endDate && input.startDate >= input.endDate)) {
                _context7.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("End date must be after start date", {
                extensions: {
                  code: "End date must be after start date"
                }
              });
            case 4:
              if (!(input.type === "percentage" && input.value > 100)) {
                _context7.n = 5;
                break;
              }
              throw new _graphql.graphql.GraphQLError("Percentage discount cannot exceed 100%", {
                extensions: {
                  code: "Percentage discount cannot exceed 100%"
                }
              });
            case 5:
              Object.assign(voucher, input);
              _context7.n = 6;
              return voucher.save();
            case 6:
              return _context7.a(2, voucher);
          }
        }, _callee7);
      }));
      function updateVoucher(_x15, _x16, _x17) {
        return _updateVoucher.apply(this, arguments);
      }
      return updateVoucher;
    }(),
    deleteVoucher: function () {
      var _deleteVoucher = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(_, _ref14, _ref15) {
        var _id, models, user, shop, voucher, now;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              _id = _ref14._id;
              models = _ref15.models, user = _ref15.user, shop = _ref15.shop;
              _context8.n = 1;
              return models.Voucher.findById(_id);
            case 1:
              voucher = _context8.v;
              if (voucher) {
                _context8.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Voucher not found", {
                extensions: {
                  code: "VOUCHER_NOT_FOUND"
                }
              });
            case 2:
              if (shop) {
                _context8.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Shop not found", {
                extensions: {
                  code: "SHOP_NOT_FOUND"
                }
              });
            case 3:
              if (!(!user || String(shop._id) !== String(voucher.shop_id))) {
                _context8.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Not authorized to delete this voucher", {
                extensions: {
                  code: "NOT_AUTHORIZED"
                }
              });
            case 4:
              now = new Date();
              if (!(voucher.start_date <= now && voucher.end_date >= now)) {
                _context8.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("Cannot delete an active voucher", {
                extensions: {
                  code: "CANNOT_DELETE_ACTIVE_VOUCHER"
                }
              });
            case 5:
              _context8.n = 6;
              return models.Voucher.deleteOne({
                _id: voucher._id
              });
            case 6:
              return _context8.a(2, true);
          }
        }, _callee8);
      }));
      function deleteVoucher(_x18, _x19, _x20) {
        return _deleteVoucher.apply(this, arguments);
      }
      return deleteVoucher;
    }()
  },
  Voucher: {
    shop: function shop(voucher) {
      return voucher.shop_id;
    }
  }
};
var _default = exports["default"] = voucherResolvers;