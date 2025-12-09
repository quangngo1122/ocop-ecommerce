"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _graphql = require("graphql");
var _mongoose = _interopRequireWildcard(require("mongoose"));
var _ShopOrderModel = _interopRequireDefault(require("../../models/ShopOrder.model.js"));
var _OrderModel = _interopRequireDefault(require("../../models/Order.model.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t5 in e) "default" !== _t5 && {}.hasOwnProperty.call(e, _t5) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t5)) && (i.get || i.set) ? o(f, _t5, i) : f[_t5] = e[_t5]); return f; })(e, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var toDecimal = function toDecimal(num) {
  return _mongoose["default"].Types.Decimal128.fromString(num.toFixed(2));
};
var getVoucherDiscount = function getVoucherDiscount(voucher, subtotal) {
  if (!voucher || voucher.status !== "active") return 0;
  var now = new Date();
  if (now < voucher.start_date || now > voucher.end_date) return 0;
  if (voucher.min_order_value && subtotal < parseFloat(voucher.min_order_value)) return 0;
  var discount = 0;
  if (voucher.type === "percentage") {
    discount = parseFloat(voucher.value) / 100 * subtotal;
  } else if (voucher.type === "fixed_amount") {
    discount = parseFloat(voucher.value);
  }
  if (voucher.max_discount_amount) {
    discount = Math.min(discount, parseFloat(voucher.max_discount_amount));
  }
  return discount;
};
var orderResolvers = {
  Query: {
    order: function () {
      var _order = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, _ref, _ref2) {
        var _id, models, user, order, shopOrders;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _id = _ref._id;
              models = _ref2.models, user = _ref2.user;
              if (user) {
                _context.n = 1;
                break;
              }
              throw new AuthenticationError("You must be logged in to view orders");
            case 1:
              _context.n = 2;
              return models.Order.findById(_id);
            case 2:
              order = _context.v;
              if (order) {
                _context.n = 3;
                break;
              }
              throw new Error("Order not found");
            case 3:
              _context.n = 4;
              return models.ShopOrder.find({
                order_id: order._id
              }).populate("user_id").populate({
                path: "items.variant_id",
                populate: {
                  path: "product_id"
                }
              });
            case 4:
              shopOrders = _context.v;
              if (order) {
                _context.n = 5;
                break;
              }
              throw new Error("Order not found");
            case 5:
              if (!(user._id !== order.user_id.toString() && shopOrders.some(function (so) {
                var _user$shop_id;
                return so.shop_id.toString() === ((_user$shop_id = user.shop_id) === null || _user$shop_id === void 0 ? void 0 : _user$shop_id.toString());
              }))) {
                _context.n = 6;
                break;
              }
              throw new _graphql.GraphQLError("Not authorized to view this order", {
                extensions: {
                  code: "UNAUTHORIZED"
                }
              });
            case 6:
              return _context.a(2, order);
          }
        }, _callee);
      }));
      function order(_x, _x2, _x3) {
        return _order.apply(this, arguments);
      }
      return order;
    }(),
    // shopOrder: async (_, { id }, { models, user }) => {
    //   if (!user) {
    //     throw new AuthenticationError("You must be logged in to view orders");
    //   }

    //   const shopOrder = await models.ShopOrder.findById(id)
    //     .populate("order_id")
    //     .populate("shop_id")
    //     .populate("items.product");

    //   if (!shopOrder) {
    //     throw new Error("Shop order not found");
    //   }

    //   // Only allow user to view their own orders, or shop owners to view their shop's orders
    //   if (
    //     user.id !== shopOrder.order.user_id.toString() &&
    //     user.shop_id?.toString() !== shopOrder.shop_id.toString()
    //   ) {
    //     throw new ForbiddenError("Not authorized to view this order");
    //   }

    //   return shopOrder;
    // },

    shopOrder: function () {
      var _shopOrder = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, _ref3, _ref4) {
        var _id, models, user, shopOrder, variantIds, variants, items;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _id = _ref3._id;
              models = _ref4.models, user = _ref4.user;
              if (user) {
                _context2.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để xem đơn hàng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context2.n = 2;
              return models.ShopOrder.findById(_id).populate("order_id").populate("shop_id").lean();
            case 2:
              shopOrder = _context2.v;
              if (shopOrder) {
                _context2.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Shop order not found", {
                extensions: {
                  code: "SHOP_ORDER_NOT_FOUND"
                }
              });
            case 3:
              // Lấy tất cả variant_id trong items
              variantIds = shopOrder.items.map(function (item) {
                return item.variant_id;
              }); // Lấy variants và products liên quan
              _context2.n = 4;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).populate("product_id").lean();
            case 4:
              variants = _context2.v;
              // Map lại items để trả về product info
              items = shopOrder.items.map(function (item) {
                var _product$_id;
                var variant = variants.find(function (v) {
                  return v._id.toString() === item.variant_id.toString();
                });
                var product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                return _objectSpread(_objectSpread({}, item), {}, {
                  price: item.price,
                  product: product ? {
                    _id: (_product$_id = product._id) === null || _product$_id === void 0 ? void 0 : _product$_id.toString(),
                    name: product.name
                  } : null,
                  // hoặc trả về object rỗng nếu typedef cho phép
                  variant: variant
                });
              });
              return _context2.a(2, _objectSpread(_objectSpread({}, shopOrder), {}, {
                items: items
              }));
          }
        }, _callee2);
      }));
      function shopOrder(_x4, _x5, _x6) {
        return _shopOrder.apply(this, arguments);
      }
      return shopOrder;
    }(),
    // userOrders: async (_, { filter, pagination }, { models, user }) => {
    //   if (!user) {
    //     throw new GraphQLError("Bạn cần đăng nhập để xem đơn hàng", {
    //       extensions: { code: "UNAUTHENTICATED" },
    //     });
    //   }

    //   const query = { user_id: user._id };

    //   if (filter) {
    //     if (filter.status) query.status = filter.status;
    //     if (filter.paymentStatus) query.payment_status = filter.paymentStatus;
    //     if (filter.fromDate || filter.toDate) {
    //       query.createdAt = {};
    //       if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
    //       if (filter.toDate) query.createdAt.$lte = filter.toDate;
    //     }
    //   }

    //   const { offset = 0, limit = 10 } = pagination || {};

    //   const [orders, total] = await Promise.all([
    //     models.Order.find(query)
    //       .sort({ createdAt: -1 })
    //       .skip(offset)
    //       .limit(limit)
    //       .lean(),
    //     models.Order.countDocuments(query),
    //   ]);

    //   const mappedOrders = await Promise.all(
    //     orders.map(async (order) => {
    //       const shopOrders = await models.ShopOrder.find({
    //         order_id: order._id,
    //       })
    //         .populate({
    //           path: "items.variant_id",
    //           populate: { path: "product_id", model: "Product" },
    //         })
    //         .populate("shop_id")
    //         .lean();

    //       return {
    //         ...order,
    //         shopOrders,
    //       };
    //     })
    //   );

    //   return {
    //     items: mappedOrders,
    //     total,
    //     hasMore: offset + mappedOrders.length < total,
    //   };
    // },

    shopOrders: function () {
      var _shopOrders = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_, _ref5, _ref6) {
        var filter, pagination, models, user, query, _ref7, _ref7$offset, offset, _ref7$limit, limit, _yield$Promise$all, _yield$Promise$all2, shopOrders, total, mappedOrders;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              filter = _ref5.filter, pagination = _ref5.pagination;
              models = _ref6.models, user = _ref6.user;
              if (user) {
                _context4.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để xem đơn hàng của cửa hàng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              query = {};
              if (filter) {
                if (filter.shopId) query.shop_id = filter.shopId;
                if (filter.status) query.status = filter.status;
                if (filter.paymentStatus) query.payment_status = filter.paymentStatus;
                if (filter.fromDate || filter.toDate) {
                  query.createdAt = {};
                  if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
                  if (filter.toDate) query.createdAt.$lte = filter.toDate;
                }
              }
              _ref7 = pagination || {}, _ref7$offset = _ref7.offset, offset = _ref7$offset === void 0 ? 0 : _ref7$offset, _ref7$limit = _ref7.limit, limit = _ref7$limit === void 0 ? 10 : _ref7$limit;
              _context4.n = 2;
              return Promise.all([models.ShopOrder.find(query).sort({
                createdAt: -1
              }).skip(offset).limit(limit).populate("user_id").populate("order_id").populate("shop_id").lean(), models.ShopOrder.countDocuments(query)]);
            case 2:
              _yield$Promise$all = _context4.v;
              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
              shopOrders = _yield$Promise$all2[0];
              total = _yield$Promise$all2[1];
              _context4.n = 3;
              return Promise.all(shopOrders.map(/*#__PURE__*/function () {
                var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(shopOrder) {
                  var _shopOrder$_id;
                  var variantIds, variants, items;
                  return _regenerator().w(function (_context3) {
                    while (1) switch (_context3.n) {
                      case 0:
                        variantIds = shopOrder.items.map(function (item) {
                          return item.variant_id;
                        });
                        _context3.n = 1;
                        return models.Variants.find({
                          _id: {
                            $in: variantIds
                          }
                        }).populate("product_id").lean();
                      case 1:
                        variants = _context3.v;
                        items = shopOrder.items.map(function (item) {
                          var _product$_id2;
                          var variant = variants.find(function (v) {
                            return v._id.toString() === item.variant_id.toString();
                          });
                          var product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                          return _objectSpread(_objectSpread({}, item), {}, {
                            product: product ? {
                              _id: (_product$_id2 = product._id) === null || _product$_id2 === void 0 ? void 0 : _product$_id2.toString(),
                              name: product.name
                            } : null,
                            variant: variant,
                            price: item.price,
                            total: item.total
                          });
                        });
                        return _context3.a(2, _objectSpread(_objectSpread({}, shopOrder), {}, {
                          items: items,
                          _id: (_shopOrder$_id = shopOrder._id) === null || _shopOrder$_id === void 0 ? void 0 : _shopOrder$_id.toString()
                        }));
                    }
                  }, _callee3);
                }));
                return function (_x0) {
                  return _ref8.apply(this, arguments);
                };
              }()));
            case 3:
              mappedOrders = _context4.v;
              return _context4.a(2, {
                items: mappedOrders,
                total: total,
                hasMore: offset + mappedOrders.length < total
              });
          }
        }, _callee4);
      }));
      function shopOrders(_x7, _x8, _x9) {
        return _shopOrders.apply(this, arguments);
      }
      return shopOrders;
    }(),
    myOrders: function () {
      var _myOrders = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(_, _ref9, _ref0) {
        var filter, pagination, models, user, query, _ref1, _ref1$offset, offset, _ref1$limit, limit, _yield$Promise$all3, _yield$Promise$all4, orders, total, mappedOrders;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              filter = _ref9.filter, pagination = _ref9.pagination;
              models = _ref0.models, user = _ref0.user;
              if (user) {
                _context5.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để xem đơn hàng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              // Ép user._id về ObjectId
              query = {
                user_id: new _mongoose["default"].Types.ObjectId(user._id)
              };
              if (filter) {
                if (filter.status) query.status = filter.status;
                if (filter.paymentStatus) {
                  query["payment.status"] = filter.paymentStatus;
                }
                if (filter.fromDate || filter.toDate) {
                  query.createdAt = {};
                  if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
                  if (filter.toDate) query.createdAt.$lte = filter.toDate;
                }
              }
              _ref1 = pagination || {}, _ref1$offset = _ref1.offset, offset = _ref1$offset === void 0 ? 0 : _ref1$offset, _ref1$limit = _ref1.limit, limit = _ref1$limit === void 0 ? 10 : _ref1$limit;
              _context5.n = 2;
              return Promise.all([models.Order.find(query).sort({
                createdAt: -1
              }).populate({
                path: "shopOrders",
                model: "ShopOrder",
                populate: {
                  path: "items.variant_id",
                  model: "Variants",
                  populate: {
                    path: "product_id",
                    model: "Product"
                  }
                }
              }).skip(offset).limit(limit).lean(), models.Order.countDocuments(query)]);
            case 2:
              _yield$Promise$all3 = _context5.v;
              _yield$Promise$all4 = _slicedToArray(_yield$Promise$all3, 2);
              orders = _yield$Promise$all4[0];
              total = _yield$Promise$all4[1];
              // Map lại để gắn variant trực tiếp vào items
              mappedOrders = orders.map(function (order) {
                var shopOrders = order.shopOrders.map(function (shopOrder) {
                  var items = shopOrder.items.map(function (item) {
                    return _objectSpread(_objectSpread({}, item), {}, {
                      variant: item.variant_id // ✅ gắn variant luôn
                    });
                  });
                  return _objectSpread(_objectSpread({}, shopOrder), {}, {
                    items: items
                  });
                });
                return _objectSpread(_objectSpread({}, order), {}, {
                  shopOrders: shopOrders
                });
              });
              return _context5.a(2, {
                items: mappedOrders,
                total: total,
                hasMore: offset + mappedOrders.length < total
              });
          }
        }, _callee5);
      }));
      function myOrders(_x1, _x10, _x11) {
        return _myOrders.apply(this, arguments);
      }
      return myOrders;
    }(),
    myShopOrders: function () {
      var _myShopOrders = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(_, _ref10, _ref11) {
        var filter, pagination, models, user, shop, query, _ref12, _ref12$offset, offset, _ref12$limit, limit, _yield$Promise$all5, _yield$Promise$all6, shopOrders, total, mappedOrders;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              filter = _ref10.filter, pagination = _ref10.pagination;
              models = _ref11.models, user = _ref11.user, shop = _ref11.shop;
              if (user) {
                _context7.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để xem đơn hàng của cửa hàng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              if (shop) {
                _context7.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần có cửa hàng để xem đơn hàng", {
                extensions: {
                  code: "SHOP_NOT_FOUND"
                }
              });
            case 2:
              query = {
                shop_id: shop._id
              };
              if (filter) {
                if (filter.status) query.status = filter.status;
                if (filter.paymentStatus) query.payment_status = filter.paymentStatus;
                if (filter.fromDate || filter.toDate) {
                  query.createdAt = {};
                  if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
                  if (filter.toDate) query.createdAt.$lte = filter.toDate;
                }
              }
              _ref12 = pagination || {}, _ref12$offset = _ref12.offset, offset = _ref12$offset === void 0 ? 0 : _ref12$offset, _ref12$limit = _ref12.limit, limit = _ref12$limit === void 0 ? 10 : _ref12$limit;
              _context7.n = 3;
              return Promise.all([models.ShopOrder.find(query).sort({
                createdAt: -1
              }).skip(offset).limit(limit).populate("order_id").populate("shop_id").lean(), models.ShopOrder.countDocuments(query)]);
            case 3:
              _yield$Promise$all5 = _context7.v;
              _yield$Promise$all6 = _slicedToArray(_yield$Promise$all5, 2);
              shopOrders = _yield$Promise$all6[0];
              total = _yield$Promise$all6[1];
              _context7.n = 4;
              return Promise.all(shopOrders.map(/*#__PURE__*/function () {
                var _ref13 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(shopOrder) {
                  var _shopOrder$_id2;
                  var variantIds, variants, items;
                  return _regenerator().w(function (_context6) {
                    while (1) switch (_context6.n) {
                      case 0:
                        variantIds = shopOrder.items.map(function (item) {
                          return item.variant_id;
                        });
                        _context6.n = 1;
                        return models.Variants.find({
                          _id: {
                            $in: variantIds
                          }
                        }).populate("product_id").lean();
                      case 1:
                        variants = _context6.v;
                        items = shopOrder.items.map(function (item) {
                          var _product$_id3;
                          var variant = variants.find(function (v) {
                            return v._id.toString() === item.variant_id.toString();
                          });
                          var product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                          return _objectSpread(_objectSpread({}, item), {}, {
                            product: product ? {
                              _id: (_product$_id3 = product._id) === null || _product$_id3 === void 0 ? void 0 : _product$_id3.toString(),
                              name: product.name
                            } : null,
                            variant: variant,
                            price: item.price,
                            total: item.total
                          });
                        });
                        return _context6.a(2, _objectSpread(_objectSpread({}, shopOrder), {}, {
                          items: items,
                          _id: (_shopOrder$_id2 = shopOrder._id) === null || _shopOrder$_id2 === void 0 ? void 0 : _shopOrder$_id2.toString()
                        }));
                    }
                  }, _callee6);
                }));
                return function (_x15) {
                  return _ref13.apply(this, arguments);
                };
              }()));
            case 4:
              mappedOrders = _context7.v;
              return _context7.a(2, {
                items: mappedOrders,
                total: total,
                hasMore: offset + mappedOrders.length < total
              });
          }
        }, _callee7);
      }));
      function myShopOrders(_x12, _x13, _x14) {
        return _myShopOrders.apply(this, arguments);
      }
      return myShopOrders;
    }()
  },
  Mutation: {
    createOrder: function () {
      var _createOrder = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(_, _ref14, _ref15) {
        var input, models, user, session, userInfo, orderNumber, subtotalAll, shippingAll, discountAll, shopOrderDocs, _iterator, _step, shopOrderInput, shopId, items, shipping, voucherCode, note, shop, voucher, variantIds, variants, shopSubtotal, shopItems, _iterator2, _step2, _loop, shopDiscount, shippingFee, shopTotal, shopOrderCode, shopOrderDoc, order, _i, _shopOrderDocs, doc, _t, _t2, _t3, _t4;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.p = _context9.n) {
            case 0:
              input = _ref14.input;
              models = _ref15.models, user = _ref15.user;
              if (user) {
                _context9.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để đặt hàng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context9.n = 2;
              return _mongoose["default"].startSession();
            case 2:
              session = _context9.v;
              session.startTransaction();
              _context9.p = 3;
              _context9.n = 4;
              return models.User.findById(user._id).session(session);
            case 4:
              userInfo = _context9.v;
              orderNumber = "OD".concat(Date.now());
              subtotalAll = 0;
              shippingAll = 0;
              discountAll = 0;
              shopOrderDocs = [];
              _iterator = _createForOfIteratorHelper(input.shopOrders);
              _context9.p = 5;
              _iterator.s();
            case 6:
              if ((_step = _iterator.n()).done) {
                _context9.n = 21;
                break;
              }
              shopOrderInput = _step.value;
              shopId = shopOrderInput.shopId, items = shopOrderInput.items, shipping = shopOrderInput.shipping, voucherCode = shopOrderInput.voucherCode, note = shopOrderInput.note; // Lấy thông tin shop & voucher
              _context9.n = 7;
              return models.Shop.findById(shopId).session(session);
            case 7:
              shop = _context9.v;
              if (shop) {
                _context9.n = 8;
                break;
              }
              throw new _graphql.GraphQLError("C\u1EEDa h\xE0ng v\u1EDBi ID ".concat(shopId, " kh\xF4ng t\u1ED3n t\u1EA1i"), {
                extensions: {
                  code: "SHOP_NOT_FOUND"
                }
              });
            case 8:
              if (!voucherCode) {
                _context9.n = 10;
                break;
              }
              _context9.n = 9;
              return models.Voucher.findOne({
                code: voucherCode,
                shop_id: shopId
              }).session(session);
            case 9:
              _t = _context9.v;
              _context9.n = 11;
              break;
            case 10:
              _t = null;
            case 11:
              voucher = _t;
              // Lấy thông tin biến thể
              variantIds = items.map(function (item) {
                return item.variantId;
              });
              _context9.n = 12;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).session(session);
            case 12:
              variants = _context9.v;
              // Tính subtotal
              shopSubtotal = 0;
              shopItems = [];
              _iterator2 = _createForOfIteratorHelper(items);
              _context9.p = 13;
              _loop = /*#__PURE__*/_regenerator().m(function _loop() {
                var item, variant, price, total;
                return _regenerator().w(function (_context8) {
                  while (1) switch (_context8.n) {
                    case 0:
                      item = _step2.value;
                      variant = variants.find(function (v) {
                        return v._id.equals(item.variantId);
                      });
                      if (variant) {
                        _context8.n = 1;
                        break;
                      }
                      throw new _graphql.GraphQLError("Biến thể không tồn tại", {
                        code: "NOT_FOUND"
                      });
                    case 1:
                      if (!(variant.stock_quantity < item.quantity)) {
                        _context8.n = 2;
                        break;
                      }
                      throw new _graphql.GraphQLError("Bi\u1EBFn th\u1EC3 ".concat(variant.slug, " kh\xF4ng \u0111\u1EE7 h\xE0ng"), {
                        code: "OUT_OF_STOCK"
                      });
                    case 2:
                      price = variant.selling_price;
                      total = price * item.quantity;
                      shopSubtotal += total;

                      // Cập nhật tồn kho
                      variant.stock_quantity -= item.quantity;
                      _context8.n = 3;
                      return variant.save({
                        session: session
                      });
                    case 3:
                      shopItems.push({
                        variant_id: variant._id,
                        quantity: item.quantity,
                        price: toDecimal(price),
                        discount: toDecimal(0)
                      });
                    case 4:
                      return _context8.a(2);
                  }
                }, _loop);
              });
              _iterator2.s();
            case 14:
              if ((_step2 = _iterator2.n()).done) {
                _context9.n = 16;
                break;
              }
              return _context9.d(_regeneratorValues(_loop()), 15);
            case 15:
              _context9.n = 14;
              break;
            case 16:
              _context9.n = 18;
              break;
            case 17:
              _context9.p = 17;
              _t2 = _context9.v;
              _iterator2.e(_t2);
            case 18:
              _context9.p = 18;
              _iterator2.f();
              return _context9.f(18);
            case 19:
              // Tính giảm giá
              shopDiscount = getVoucherDiscount(voucher, shopSubtotal);
              shippingFee = 30000; // Giả sử phí vận chuyển cố định là 30000 VND
              // Tổng cộng
              shopTotal = shopSubtotal + shippingFee - shopDiscount;
              subtotalAll += shopSubtotal;
              shippingAll += shippingFee;
              discountAll += shopDiscount;

              // Tạo mã đơn hàng shop
              shopOrderCode = "SOD".concat(Date.now(), "-").concat(Math.floor(Math.random() * 1000)); // Tạo shopOrder document
              shopOrderDoc = new _ShopOrderModel["default"]({
                user_id: user._id,
                order_id: null,
                // Sẽ gán sau khi tạo order chính
                shop_id: shopId,
                order_code: shopOrderCode,
                shipping: {
                  from_address: shop.address,
                  to_address: shipping,
                  method: "standard",
                  status: "pending"
                },
                items: shopItems,
                amounts: {
                  subtotal: toDecimal(shopSubtotal),
                  shippingFee: toDecimal(shippingFee),
                  total_discount: toDecimal(shopDiscount),
                  total: toDecimal(shopTotal)
                },
                current_status: "pending",
                status_history: [{
                  status: "pending",
                  updatedAt: new Date()
                }],
                discount: voucher ? [{
                  value: toDecimal(shopDiscount),
                  discount_code: voucher.code
                }] : [],
                note: note || ""
              });
              shopOrderDocs.push(shopOrderDoc);
            case 20:
              _context9.n = 6;
              break;
            case 21:
              _context9.n = 23;
              break;
            case 22:
              _context9.p = 22;
              _t3 = _context9.v;
              _iterator.e(_t3);
            case 23:
              _context9.p = 23;
              _iterator.f();
              return _context9.f(23);
            case 24:
              // Tạo order chính
              order = new _OrderModel["default"]({
                user_id: user._id,
                order_code: orderNumber,
                amounts: {
                  subtotal: toDecimal(subtotalAll),
                  shippingFee: toDecimal(shippingAll),
                  total_discount: toDecimal(discountAll),
                  total: toDecimal(subtotalAll + shippingAll - discountAll)
                },
                payment: {
                  method: input.paymentMethod,
                  status: "pending"
                },
                status: "pending"
              });
              _context9.n = 25;
              return order.save({
                session: session
              });
            case 25:
              // Gán order_id cho mỗi shopOrder
              for (_i = 0, _shopOrderDocs = shopOrderDocs; _i < _shopOrderDocs.length; _i++) {
                doc = _shopOrderDocs[_i];
                doc.order_id = order._id;
              }
              _context9.n = 26;
              return _ShopOrderModel["default"].insertMany(shopOrderDocs, {
                session: session
              });
            case 26:
              _context9.n = 27;
              return session.commitTransaction();
            case 27:
              session.endSession();
              return _context9.a(2, order);
            case 28:
              _context9.p = 28;
              _t4 = _context9.v;
              _context9.n = 29;
              return session.abortTransaction();
            case 29:
              session.endSession();
              console.error("❌ createOrder error:", _t4);
              throw new _graphql.GraphQLError(_t4.message, {
                extensions: {
                  code: "INTERNAL_SERVER_ERROR"
                }
              });
            case 30:
              return _context9.a(2);
          }
        }, _callee8, null, [[13, 17, 18, 19], [5, 22, 23, 24], [3, 28]]);
      }));
      function createOrder(_x16, _x17, _x18) {
        return _createOrder.apply(this, arguments);
      }
      return createOrder;
    }(),
    updateShopOrderStatus: function () {
      var _updateShopOrderStatus = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(_, _ref16, _ref17) {
        var _shop$_id;
        var shopOrderId, status, models, user, shop, shopOrder, validStatuses;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              shopOrderId = _ref16.shopOrderId, status = _ref16.status;
              models = _ref17.models, user = _ref17.user, shop = _ref17.shop;
              if (user) {
                _context0.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để cập nhật đơn hàng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context0.n = 2;
              return models.ShopOrder.findById(shopOrderId);
            case 2:
              shopOrder = _context0.v;
              if (shopOrder) {
                _context0.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Shop order not found", {
                extensions: {
                  code: "SHOP_ORDER_NOT_FOUND"
                }
              });
            case 3:
              if (!(shopOrder.shop_id.toString() !== ((_shop$_id = shop._id) === null || _shop$_id === void 0 ? void 0 : _shop$_id.toString()))) {
                _context0.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Not authorized to update this order", {
                extensions: {
                  code: "UNAUTHORIZED"
                }
              });
            case 4:
              validStatuses = ["pending", "confirmed", "preparing", "transit", "delivered", "failed", "cancelled_by_shop", "cancelled_by_buyer"];
              if (validStatuses.includes(status)) {
                _context0.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("Invalid status", {
                extensions: {
                  code: "INVALID_STATUS"
                }
              });
            case 5:
              // ✅ Cập nhật current_status
              shopOrder.current_status = status;

              // ✅ Thêm lịch sử trạng thái
              shopOrder.status_history.push({
                status: status,
                updatedAt: new Date()
              });
              shopOrder.updatedAt = new Date();
              _context0.n = 6;
              return shopOrder.save();
            case 6:
              return _context0.a(2, shopOrder);
          }
        }, _callee9);
      }));
      function updateShopOrderStatus(_x19, _x20, _x21) {
        return _updateShopOrderStatus.apply(this, arguments);
      }
      return updateShopOrderStatus;
    }()
  },
  OrderItem: {
    variant: function () {
      var _variant = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(parent, _, _ref18) {
        var models;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.n) {
            case 0:
              models = _ref18.models;
              if (parent.variant_id) {
                _context1.n = 1;
                break;
              }
              return _context1.a(2, null);
            case 1:
              return _context1.a(2, models.Variants.findById(parent.variant_id).populate("product_id"));
          }
        }, _callee0);
      }));
      function variant(_x22, _x23, _x24) {
        return _variant.apply(this, arguments);
      }
      return variant;
    }()
  },
  Order: {
    user: function user(order, _, _ref19) {
      var models = _ref19.models;
      return models.User.findById(order.user_id);
    },
    shopOrders: function shopOrders(order, _, _ref20) {
      var models = _ref20.models;
      return models.ShopOrder.find({
        order_id: order._id
      });
    }
  },
  ShopOrder: {
    order: function order(shopOrder, _, _ref21) {
      var models = _ref21.models;
      return models.Order.findById(shopOrder.order_id);
    },
    shop: function shop(shopOrder, _, _ref22) {
      var models = _ref22.models;
      return models.Shop.findById(shopOrder.shop_id);
    },
    items: function () {
      var _items = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(shopOrder, _, _ref23) {
        var models, variantIds, variants;
        return _regenerator().w(function (_context10) {
          while (1) switch (_context10.n) {
            case 0:
              models = _ref23.models;
              // Lấy tất cả variant_id trong items
              variantIds = shopOrder.items.map(function (item) {
                return item.variant_id;
              });
              _context10.n = 1;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).populate("product_id").lean();
            case 1:
              variants = _context10.v;
              return _context10.a(2, shopOrder.items.map(function (item) {
                var _product$_id4;
                var variant = variants.find(function (v) {
                  return v._id.toString() === item.variant_id.toString();
                });
                var product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                return _objectSpread(_objectSpread({}, item), {}, {
                  product: product ? {
                    _id: (_product$_id4 = product._id) === null || _product$_id4 === void 0 ? void 0 : _product$_id4.toString(),
                    name: product.name
                  } : null,
                  variant: variant,
                  price: item.price,
                  total: item.total
                });
              }));
          }
        }, _callee1);
      }));
      function items(_x25, _x26, _x27) {
        return _items.apply(this, arguments);
      }
      return items;
    }(),
    voucher: function voucher(shopOrder, _, _ref24) {
      var models = _ref24.models;
      return shopOrder.voucher_id ? models.Voucher.findById(shopOrder.voucher_id) : null;
    },
    discount: function discount(shopOrder) {
      // Nếu có trường amounts.total_discount thì lấy từ đó
      if (shopOrder.amounts && shopOrder.amounts.total_discount) {
        // Xử lý kiểu Decimal128 nếu cần
        if (shopOrder.amounts.total_discount.$numberDecimal) {
          return parseFloat(shopOrder.amounts.total_discount.$numberDecimal);
        }
        if (_typeof(shopOrder.amounts.total_discount) === "object") {
          return parseFloat(shopOrder.amounts.total_discount.toString());
        }
        return shopOrder.amounts.total_discount;
      }
      // Nếu có trường discount là mảng, lấy tổng value
      if (Array.isArray(shopOrder.discount) && shopOrder.discount.length > 0) {
        return shopOrder.discount.reduce(function (sum, d) {
          if (d.value && d.value.$numberDecimal) {
            return sum + parseFloat(d.value.$numberDecimal);
          }
          if (_typeof(d.value) === "object") {
            return sum + parseFloat(d.value.toString());
          }
          return sum + (d.value || 0);
        }, 0);
      }
      // Không có giảm giá thì trả về 0
      return 0;
    },
    shipping: function shipping(shopOrder) {
      // Trả về đúng cấu trúc typedef
      if (!shopOrder.shipping) return null;
      return {
        from_address: shopOrder.shipping.from_address,
        to_address: shopOrder.shipping.to_address
      };
    }
  }
};
var _default = exports["default"] = orderResolvers;