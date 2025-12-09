"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _graphql = require("graphql");
var _cloudinary = require("../../utils/cloudinary.js");
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var userResolvers = {
  Query: {
    users: function () {
      var _users = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, __, _ref) {
        var models;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              models = _ref.models;
              _context.n = 1;
              return models.User.find({});
            case 1:
              return _context.a(2, _context.v);
          }
        }, _callee);
      }));
      function users(_x, _x2, _x3) {
        return _users.apply(this, arguments);
      }
      return users;
    }(),
    user: function () {
      var _user = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, _ref2, _ref3) {
        var _id, models, user;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _id = _ref2._id;
              models = _ref3.models;
              _context2.n = 1;
              return models.User.findById(_id);
            case 1:
              user = _context2.v;
              if (user) {
                _context2.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              return _context2.a(2, user);
          }
        }, _callee2);
      }));
      function user(_x4, _x5, _x6) {
        return _user.apply(this, arguments);
      }
      return user;
    }(),
    userByFirebaseUid: function () {
      var _userByFirebaseUid = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_, _ref4, _ref5) {
        var firebaseUid, models, user;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              firebaseUid = _ref4.firebaseUid;
              models = _ref5.models;
              _context3.n = 1;
              return models.User.findOne({
                firebaseUid: firebaseUid
              });
            case 1:
              user = _context3.v;
              if (user) {
                _context3.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng với Firebase UID này", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              return _context3.a(2, _objectSpread(_objectSpread({}, user.toObject()), {}, {
                _id: user._id.toString()
              }));
          }
        }, _callee3);
      }));
      function userByFirebaseUid(_x7, _x8, _x9) {
        return _userByFirebaseUid.apply(this, arguments);
      }
      return userByFirebaseUid;
    }(),
    userByEmail: function () {
      var _userByEmail = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_, _ref6, _ref7) {
        var email, models, user;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              email = _ref6.email;
              models = _ref7.models;
              _context4.n = 1;
              return models.User.findOne({
                email: email
              });
            case 1:
              user = _context4.v;
              if (user) {
                _context4.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng với email này", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              return _context4.a(2, _objectSpread(_objectSpread({}, user.toObject()), {}, {
                _id: user._id.toString()
              }));
          }
        }, _callee4);
      }));
      function userByEmail(_x0, _x1, _x10) {
        return _userByEmail.apply(this, arguments);
      }
      return userByEmail;
    }(),
    address: function () {
      var _address = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(_, _ref8, _ref9) {
        var userId, addressId, models, user, addr;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              userId = _ref8.userId, addressId = _ref8.addressId;
              models = _ref9.models;
              _context5.n = 1;
              return models.User.findById(userId);
            case 1:
              user = _context5.v;
              if (user) {
                _context5.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              if (Array.isArray(user.address)) {
                _context5.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Không có địa chỉ", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              addr = user.address.find(function (a) {
                return a && a._id && a._id.toString() === addressId;
              });
              if (addr) {
                _context5.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Địa chỉ không tồn tại", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 4:
              return _context5.a(2, addr);
          }
        }, _callee5);
      }));
      function address(_x11, _x12, _x13) {
        return _address.apply(this, arguments);
      }
      return address;
    }(),
    addresses: function () {
      var _addresses = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(_, _ref0, _ref1) {
        var userId, models, user;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              userId = _ref0.userId;
              models = _ref1.models;
              _context6.n = 1;
              return models.User.findById(userId);
            case 1:
              user = _context6.v;
              if (user) {
                _context6.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              return _context6.a(2, user.address || []);
          }
        }, _callee6);
      }));
      function addresses(_x14, _x15, _x16) {
        return _addresses.apply(this, arguments);
      }
      return addresses;
    }(),
    myCart: function () {
      var _myCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(_, _ref10, _ref11) {
        var filter, pagination, models, user, cart, _ref12, _ref12$offset, offset, limit, variantIds, variants, enrichedCart, grouped, _iterator, _step, item, _t;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.p = _context7.n) {
            case 0:
              filter = _ref10.filter, pagination = _ref10.pagination;
              models = _ref11.models, user = _ref11.user;
              if (user) {
                _context7.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              // 2. Lấy giỏ hàng từ user
              cart = user.cart || [];
              if (!(cart.length === 0)) {
                _context7.n = 2;
                break;
              }
              return _context7.a(2, []);
            case 2:
              // ✅ 3. Lọc theo isChecked (nếu có)
              if ((filter === null || filter === void 0 ? void 0 : filter.isChecked) !== undefined) {
                cart = cart.filter(function (item) {
                  return item.isChecked === filter.isChecked;
                });
              }

              // ✅ 4. Phân trang (offset, limit)
              _ref12 = pagination || {}, _ref12$offset = _ref12.offset, offset = _ref12$offset === void 0 ? 0 : _ref12$offset, limit = _ref12.limit;
              if (typeof limit === "number") {
                cart = cart.slice(offset, offset + limit);
              } else if (offset > 0) {
                cart = cart.slice(offset);
              }

              // 5. Lấy danh sách Variant từ cart
              variantIds = cart.map(function (item) {
                return item.VariantId;
              });
              _context7.n = 3;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).populate({
                path: "product_id",
                populate: {
                  path: "shop_id"
                }
              }).lean();
            case 3:
              variants = _context7.v;
              // 6. Ghép dữ liệu cart với thông tin variant và product
              enrichedCart = cart.map(function (item) {
                var _shop$_id;
                var variant = variants.find(function (v) {
                  return v._id.toString() === item.VariantId.toString();
                });
                var product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                var shop = product === null || product === void 0 ? void 0 : product.shop_id;
                var shopId = shop === null || shop === void 0 || (_shop$_id = shop._id) === null || _shop$_id === void 0 ? void 0 : _shop$_id.toString();
                return {
                  _id: item._id,
                  VariantId: item.VariantId,
                  quantity: item.quantity,
                  price: item.price,
                  isChecked: item.isChecked,
                  // ✅ thêm vào
                  createdAt: item.createdAt,
                  product: product,
                  shop: shop,
                  shopId: shopId,
                  attributes: (variant === null || variant === void 0 ? void 0 : variant.attributes) || []
                };
              }); // 7. Gom nhóm theo shopId
              grouped = {};
              _iterator = _createForOfIteratorHelper(enrichedCart);
              _context7.p = 4;
              _iterator.s();
            case 5:
              if ((_step = _iterator.n()).done) {
                _context7.n = 8;
                break;
              }
              item = _step.value;
              if (item.shopId) {
                _context7.n = 6;
                break;
              }
              return _context7.a(3, 7);
            case 6:
              if (!grouped[item.shopId]) {
                grouped[item.shopId] = {
                  shop: item.shop,
                  items: []
                };
              }
              grouped[item.shopId].items.push({
                _id: item._id,
                VariantId: item.VariantId,
                quantity: item.quantity,
                price: item.price,
                isChecked: item.isChecked,
                // ✅ trả về luôn
                product: item.product,
                attributes: item.attributes
              });
            case 7:
              _context7.n = 5;
              break;
            case 8:
              _context7.n = 10;
              break;
            case 9:
              _context7.p = 9;
              _t = _context7.v;
              _iterator.e(_t);
            case 10:
              _context7.p = 10;
              _iterator.f();
              return _context7.f(10);
            case 11:
              return _context7.a(2, Object.values(grouped));
          }
        }, _callee7, null, [[4, 9, 10, 11]]);
      }));
      function myCart(_x17, _x18, _x19) {
        return _myCart.apply(this, arguments);
      }
      return myCart;
    }()
  },
  Mutation: {
    createUser: function () {
      var _createUser = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(_, _ref13, _ref14) {
        var input, models, avatarUrl, user;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              input = _ref13.input;
              models = _ref14.models;
              if (!(input.gender && !["male", "female"].includes(input.gender))) {
                _context8.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Giới tính không hợp lệ. Chỉ chấp nhận 'male' hoặc 'female'.", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 1:
              if (!(input.dateOfBirth && isNaN(Date.parse(input.dateOfBirth)))) {
                _context8.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Ngày sinh không hợp lệ.", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 2:
              avatarUrl = input.avatar;
              if (!(input.avatar && _typeof(input.avatar) === "object" && input.avatar.createReadStream)) {
                _context8.n = 4;
                break;
              }
              _context8.n = 3;
              return (0, _cloudinary.uploadImageSingle)(input.avatar);
            case 3:
              avatarUrl = _context8.v;
            case 4:
              user = new models.User(_objectSpread(_objectSpread({}, input), {}, {
                avatar: avatarUrl
              }));
              _context8.n = 5;
              return user.save();
            case 5:
              return _context8.a(2, user);
          }
        }, _callee8);
      }));
      function createUser(_x20, _x21, _x22) {
        return _createUser.apply(this, arguments);
      }
      return createUser;
    }(),
    updateUser: function () {
      var _updateUser = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(_, _ref15, _ref16) {
        var _id, input, models, updateData, user;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              _id = _ref15._id, input = _ref15.input;
              models = _ref16.models;
              if (!(input.gender && !["male", "female"].includes(input.gender))) {
                _context9.n = 1;
                break;
              }
              throw new UserInputError("Giới tính không hợp lệ. Chỉ chấp nhận 'male' hoặc 'female'.");
            case 1:
              if (!(input.dateOfBirth && isNaN(Date.parse(input.dateOfBirth)))) {
                _context9.n = 2;
                break;
              }
              throw new UserInputError("Ngày sinh không hợp lệ.");
            case 2:
              updateData = _objectSpread({}, input);
              if (!input.avatar) {
                _context9.n = 4;
                break;
              }
              _context9.n = 3;
              return (0, _cloudinary.uploadImageSingle)(input.avatar);
            case 3:
              updateData.avatar = _context9.v;
            case 4:
              _context9.n = 5;
              return models.User.findByIdAndUpdate(_id, {
                $set: updateData
              }, {
                "new": true,
                runValidators: true
              });
            case 5:
              user = _context9.v;
              if (user) {
                _context9.n = 6;
                break;
              }
              throw new _graphql.GraphQLError("User not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 6:
              return _context9.a(2, user);
          }
        }, _callee9);
      }));
      function updateUser(_x23, _x24, _x25) {
        return _updateUser.apply(this, arguments);
      }
      return updateUser;
    }(),
    deleteUser: function () {
      var _deleteUser = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(_, _ref17, _ref18) {
        var _id, models, user;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              _id = _ref17._id;
              models = _ref18.models;
              _context0.n = 1;
              return models.User.findByIdAndDelete(_id);
            case 1:
              user = _context0.v;
              return _context0.a(2, !!user);
          }
        }, _callee0);
      }));
      function deleteUser(_x26, _x27, _x28) {
        return _deleteUser.apply(this, arguments);
      }
      return deleteUser;
    }(),
    // Thêm địa chỉ mới
    addAddress: function () {
      var _addAddress = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(_, _ref19, _ref20) {
        var userId, input, models, user;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.n) {
            case 0:
              userId = _ref19.userId, input = _ref19.input;
              models = _ref20.models;
              _context1.n = 1;
              return models.User.findById(userId);
            case 1:
              user = _context1.v;
              if (user) {
                _context1.n = 2;
                break;
              }
              throw new UserInputError("Không tìm thấy người dùng");
            case 2:
              if (!user.address) user.address = [];
              // Nếu thêm địa chỉ mặc định, bỏ isDefault của các địa chỉ khác
              if (input.isDefault) {
                user.address.forEach(function (addr) {
                  return addr.isDefault = false;
                });
              }
              user.address.push(_objectSpread({}, input));
              _context1.n = 3;
              return user.save();
            case 3:
              return _context1.a(2, user.address);
          }
        }, _callee1);
      }));
      function addAddress(_x29, _x30, _x31) {
        return _addAddress.apply(this, arguments);
      }
      return addAddress;
    }(),
    // Sửa địa chỉ (không cho sửa địa chỉ mặc định)
    updateAddress: function () {
      var _updateAddress = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(_, _ref21, _ref22) {
        var userId, addressId, input, models, user, idx;
        return _regenerator().w(function (_context10) {
          while (1) switch (_context10.n) {
            case 0:
              userId = _ref21.userId, addressId = _ref21.addressId, input = _ref21.input;
              models = _ref22.models;
              _context10.n = 1;
              return models.User.findById(userId);
            case 1:
              user = _context10.v;
              if (user) {
                _context10.n = 2;
                break;
              }
              throw new UserInputError("Không tìm thấy người dùng");
            case 2:
              if (Array.isArray(user.address)) {
                _context10.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Không có địa chỉ", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              idx = user.address.findIndex(function (a) {
                return a && a._id && a._id.toString() === addressId;
              });
              if (!(idx === -1)) {
                _context10.n = 4;
                break;
              }
              throw new UserInputError("Địa chỉ không tồn tại");
            case 4:
              if (!user.address[idx].isDefault) {
                _context10.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("Không thể sửa địa chỉ mặc định", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 5:
              if (input.isDefault) {
                user.address.forEach(function (addr) {
                  return addr.isDefault = false;
                });
              }
              user.address[idx] = _objectSpread(_objectSpread({}, user.address[idx]), input);
              _context10.n = 6;
              return user.save();
            case 6:
              return _context10.a(2, user.address);
          }
        }, _callee10);
      }));
      function updateAddress(_x32, _x33, _x34) {
        return _updateAddress.apply(this, arguments);
      }
      return updateAddress;
    }(),
    // Xóa địa chỉ (không cho xóa địa chỉ mặc định)
    deleteAddress: function () {
      var _deleteAddress = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(_, _ref23, _ref24) {
        var userId, addressId, models, user, idx;
        return _regenerator().w(function (_context11) {
          while (1) switch (_context11.n) {
            case 0:
              userId = _ref23.userId, addressId = _ref23.addressId;
              models = _ref24.models;
              _context11.n = 1;
              return models.User.findById(userId);
            case 1:
              user = _context11.v;
              if (user) {
                _context11.n = 2;
                break;
              }
              throw new UserInputError("Không tìm thấy người dùng");
            case 2:
              if (Array.isArray(user.address)) {
                _context11.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Không có địa chỉ", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              idx = user.address.findIndex(function (a) {
                return a && a._id && a._id.toString() === addressId;
              });
              if (!(idx === -1)) {
                _context11.n = 4;
                break;
              }
              throw new UserInputError("Địa chỉ không tồn tại");
            case 4:
              if (!user.address[idx].isDefault) {
                _context11.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("Không thể xóa địa chỉ mặc định", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 5:
              user.address.splice(idx, 1);
              _context11.n = 6;
              return user.save();
            case 6:
              return _context11.a(2, user.address);
          }
        }, _callee11);
      }));
      function deleteAddress(_x35, _x36, _x37) {
        return _deleteAddress.apply(this, arguments);
      }
      return deleteAddress;
    }(),
    // Đặt địa chỉ mặc định
    setDefaultAddress: function () {
      var _setDefaultAddress = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(_, _ref25, _ref26) {
        var userId, addressId, models, user, idx;
        return _regenerator().w(function (_context12) {
          while (1) switch (_context12.n) {
            case 0:
              userId = _ref25.userId, addressId = _ref25.addressId;
              models = _ref26.models;
              _context12.n = 1;
              return models.User.findById(userId);
            case 1:
              user = _context12.v;
              if (user) {
                _context12.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              if (Array.isArray(user.address)) {
                _context12.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Không có địa chỉ", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              idx = user.address.findIndex(function (a) {
                return a && a._id && a._id.toString() === addressId;
              });
              if (!(idx === -1)) {
                _context12.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Địa chỉ không tồn tại", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 4:
              // Đặt địa chỉ này là mặc định, các địa chỉ khác không còn là mặc định
              user.address.forEach(function (addr, i) {
                addr.isDefault = i === idx;
              });
              _context12.n = 5;
              return user.save();
            case 5:
              return _context12.a(2, user.address);
          }
        }, _callee12);
      }));
      function setDefaultAddress(_x38, _x39, _x40) {
        return _setDefaultAddress.apply(this, arguments);
      }
      return setDefaultAddress;
    }(),
    // Thêm sản phẩm vào giỏ hàng
    // addToCart: async (_, { userId, input }, { models, user }) => {
    //   if (!user)
    //     throw new GraphQLError(
    //       "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng",
    //       {
    //         extensions: { code: "UNAUTHORIZED" },
    //       }
    //     );

    //   // Tìm thông tin variant
    //   const variant = await models.Variants.findById(input.VariantId);
    //   if (!variant)
    //     throw new GraphQLError("Không tìm thấy biến thể sản phẩm", {
    //       extensions: { code: "NOT_FOUND" },
    //     });
    //   const sellingPrice = variant.selling_price || 0;
    //   if (!user.cart) user.cart = [];

    //   // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    //   const existingItem = user.cart.find(
    //     (item) => item.VariantId.toString() === input.VariantId
    //   );

    //   if (existingItem) {
    //     // Nếu đã có, cập nhật số lượng và giá
    //     existingItem.quantity += input.quantity;
    //     existingItem.price = existingItem.quantity * sellingPrice;
    //   } else {
    //     // Nếu chưa có, thêm mới
    //     user.cart.push({
    //       VariantId: input.VariantId,
    //       quantity: input.quantity,
    //       price: input.quantity * sellingPrice,
    //       createdAt: new Date(),
    //     });
    //   }

    //   await user.save();
    //   return user.cart;
    // },
    addToCart: function () {
      var _addToCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(_, _ref27, _ref28) {
        var input, models, user, variant, product, shopId, sellingPrice, existingItem, cart, variantIds, variants, grouped, _iterator2, _step2, _loop, _t2;
        return _regenerator().w(function (_context14) {
          while (1) switch (_context14.p = _context14.n) {
            case 0:
              input = _ref27.input;
              models = _ref28.models, user = _ref28.user;
              if (user) {
                _context14.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng", {
                extensions: {
                  code: "UNAUTHORIZED"
                }
              });
            case 1:
              _context14.n = 2;
              return models.Variants.findById(input.VariantId).populate("product_id");
            case 2:
              variant = _context14.v;
              if (!(!variant || !variant.product_id)) {
                _context14.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy biến thể hoặc sản phẩm", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              product = variant.product_id;
              shopId = product.shop_id.toString();
              sellingPrice = variant.selling_price || 0;
              if (!user.cart) user.cart = [];
              existingItem = user.cart.find(function (item) {
                return item.VariantId.toString() === input.VariantId;
              });
              if (existingItem) {
                existingItem.quantity += input.quantity;
                existingItem.price = existingItem.quantity * sellingPrice;
              } else {
                user.cart.push({
                  VariantId: input.VariantId,
                  quantity: input.quantity,
                  price: input.quantity * sellingPrice,
                  createdAt: new Date()
                });
              }
              _context14.n = 4;
              return user.save();
            case 4:
              cart = user.cart || [];
              variantIds = cart.map(function (item) {
                return item.VariantId;
              });
              _context14.n = 5;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).populate({
                path: "product_id",
                populate: {
                  path: "shop_id"
                }
              }).lean();
            case 5:
              variants = _context14.v;
              // Gom nhóm theo shop
              grouped = {};
              _iterator2 = _createForOfIteratorHelper(cart);
              _context14.p = 6;
              _loop = /*#__PURE__*/_regenerator().m(function _loop() {
                var _shop$_id2;
                var item, variant, product, shop, shopId;
                return _regenerator().w(function (_context13) {
                  while (1) switch (_context13.n) {
                    case 0:
                      item = _step2.value;
                      variant = variants.find(function (v) {
                        return v._id.toString() === item.VariantId.toString();
                      });
                      product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                      shop = product === null || product === void 0 ? void 0 : product.shop_id;
                      shopId = shop === null || shop === void 0 || (_shop$_id2 = shop._id) === null || _shop$_id2 === void 0 ? void 0 : _shop$_id2.toString();
                      if (shopId) {
                        _context13.n = 1;
                        break;
                      }
                      return _context13.a(2, 1);
                    case 1:
                      if (!grouped[shopId]) {
                        grouped[shopId] = {
                          shop: shop,
                          items: []
                        };
                      }
                      grouped[shopId].items.push({
                        _id: item._id,
                        VariantId: item.VariantId,
                        quantity: item.quantity,
                        price: item.price,
                        product: product
                      });
                    case 2:
                      return _context13.a(2);
                  }
                }, _loop);
              });
              _iterator2.s();
            case 7:
              if ((_step2 = _iterator2.n()).done) {
                _context14.n = 10;
                break;
              }
              return _context14.d(_regeneratorValues(_loop()), 8);
            case 8:
              if (!_context14.v) {
                _context14.n = 9;
                break;
              }
              return _context14.a(3, 9);
            case 9:
              _context14.n = 7;
              break;
            case 10:
              _context14.n = 12;
              break;
            case 11:
              _context14.p = 11;
              _t2 = _context14.v;
              _iterator2.e(_t2);
            case 12:
              _context14.p = 12;
              _iterator2.f();
              return _context14.f(12);
            case 13:
              return _context14.a(2, Object.values(grouped));
          }
        }, _callee13, null, [[6, 11, 12, 13]]);
      }));
      function addToCart(_x41, _x42, _x43) {
        return _addToCart.apply(this, arguments);
      }
      return addToCart;
    }(),
    // Dò nhiều sản phẩm nếu sản phẩm nào chưa có thì thêm vào giỏ hàng, nếu có rồi thì cập nhật số lượng
    addListToCart: function () {
      var _addListToCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(_, _ref29, _ref30) {
        var userId, input, models, user, _iterator3, _step3, _loop2, _ret, cart, variantIds, variants, grouped, _iterator4, _step4, _loop3, _t3, _t4;
        return _regenerator().w(function (_context17) {
          while (1) switch (_context17.p = _context17.n) {
            case 0:
              userId = _ref29.userId, input = _ref29.input;
              models = _ref30.models, user = _ref30.user;
              if (user) {
                _context17.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng", {
                extensions: {
                  code: "UNAUTHORIZED"
                }
              });
            case 1:
              if (!(!Array.isArray(input) || input.length === 0)) {
                _context17.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Danh sách sản phẩm không hợp lệ", {
                extensions: {
                  code: "INVALID_INPUT"
                }
              });
            case 2:
              if (!user.cart) user.cart = [];
              _iterator3 = _createForOfIteratorHelper(input);
              _context17.p = 3;
              _loop2 = /*#__PURE__*/_regenerator().m(function _loop2() {
                var item, VariantId, quantity, variant, sellingPrice, existingItem;
                return _regenerator().w(function (_context15) {
                  while (1) switch (_context15.n) {
                    case 0:
                      item = _step3.value;
                      VariantId = item.VariantId, quantity = item.quantity;
                      if (!(!VariantId || !quantity || quantity <= 0)) {
                        _context15.n = 1;
                        break;
                      }
                      return _context15.a(2, 0);
                    case 1:
                      _context15.n = 2;
                      return models.Variants.findById(VariantId).populate("product_id");
                    case 2:
                      variant = _context15.v;
                      if (!(!variant || !variant.product_id)) {
                        _context15.n = 3;
                        break;
                      }
                      return _context15.a(2, 0);
                    case 3:
                      sellingPrice = variant.selling_price || 0;
                      existingItem = user.cart.find(function (ci) {
                        return ci.VariantId.toString() === VariantId;
                      });
                      if (existingItem) {
                        existingItem.quantity += quantity;
                        existingItem.price = existingItem.quantity * sellingPrice;
                      } else {
                        user.cart.push({
                          VariantId: VariantId,
                          quantity: quantity,
                          price: quantity * sellingPrice,
                          createdAt: new Date()
                        });
                      }
                    case 4:
                      return _context15.a(2);
                  }
                }, _loop2);
              });
              _iterator3.s();
            case 4:
              if ((_step3 = _iterator3.n()).done) {
                _context17.n = 7;
                break;
              }
              return _context17.d(_regeneratorValues(_loop2()), 5);
            case 5:
              _ret = _context17.v;
              if (!(_ret === 0)) {
                _context17.n = 6;
                break;
              }
              return _context17.a(3, 6);
            case 6:
              _context17.n = 4;
              break;
            case 7:
              _context17.n = 9;
              break;
            case 8:
              _context17.p = 8;
              _t3 = _context17.v;
              _iterator3.e(_t3);
            case 9:
              _context17.p = 9;
              _iterator3.f();
              return _context17.f(9);
            case 10:
              _context17.n = 11;
              return user.save();
            case 11:
              // Trả về giỏ hàng dạng nhóm theo Shop (giống myCart)
              cart = user.cart || [];
              variantIds = cart.map(function (item) {
                return item.VariantId;
              });
              _context17.n = 12;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).populate({
                path: "product_id",
                populate: {
                  path: "shop_id"
                }
              }).lean();
            case 12:
              variants = _context17.v;
              grouped = {};
              _iterator4 = _createForOfIteratorHelper(cart);
              _context17.p = 13;
              _loop3 = /*#__PURE__*/_regenerator().m(function _loop3() {
                var _shop$_id3;
                var item, variant, product, shop, shopId;
                return _regenerator().w(function (_context16) {
                  while (1) switch (_context16.n) {
                    case 0:
                      item = _step4.value;
                      variant = variants.find(function (v) {
                        return v._id.toString() === item.VariantId.toString();
                      });
                      product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                      shop = product === null || product === void 0 ? void 0 : product.shop_id;
                      shopId = shop === null || shop === void 0 || (_shop$_id3 = shop._id) === null || _shop$_id3 === void 0 ? void 0 : _shop$_id3.toString();
                      if (shopId) {
                        _context16.n = 1;
                        break;
                      }
                      return _context16.a(2, 1);
                    case 1:
                      if (!grouped[shopId]) {
                        grouped[shopId] = {
                          shop: shop,
                          items: []
                        };
                      }
                      grouped[shopId].items.push({
                        _id: item._id,
                        VariantId: item.VariantId,
                        quantity: item.quantity,
                        price: item.price,
                        product: product
                      });
                    case 2:
                      return _context16.a(2);
                  }
                }, _loop3);
              });
              _iterator4.s();
            case 14:
              if ((_step4 = _iterator4.n()).done) {
                _context17.n = 17;
                break;
              }
              return _context17.d(_regeneratorValues(_loop3()), 15);
            case 15:
              if (!_context17.v) {
                _context17.n = 16;
                break;
              }
              return _context17.a(3, 16);
            case 16:
              _context17.n = 14;
              break;
            case 17:
              _context17.n = 19;
              break;
            case 18:
              _context17.p = 18;
              _t4 = _context17.v;
              _iterator4.e(_t4);
            case 19:
              _context17.p = 19;
              _iterator4.f();
              return _context17.f(19);
            case 20:
              return _context17.a(2, Object.values(grouped));
          }
        }, _callee14, null, [[13, 18, 19, 20], [3, 8, 9, 10]]);
      }));
      function addListToCart(_x44, _x45, _x46) {
        return _addListToCart.apply(this, arguments);
      }
      return addListToCart;
    }(),
    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartItem: function () {
      var _updateCartItem = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(_, _ref31, _ref32) {
        var cartId, quantity, isChecked, models, user, itemIndex, cartItem, variant, cart, variantIds, variants, enrichedCart, grouped, _iterator5, _step5, item, _t5;
        return _regenerator().w(function (_context18) {
          while (1) switch (_context18.p = _context18.n) {
            case 0:
              cartId = _ref31.cartId, quantity = _ref31.quantity, isChecked = _ref31.isChecked;
              models = _ref32.models, user = _ref32.user;
              if (user) {
                _context18.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn cần đăng nhập", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              // Tìm item trong cart
              itemIndex = user.cart.findIndex(function (item) {
                return item._id.toString() === cartId;
              });
              if (!(itemIndex === -1)) {
                _context18.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy sản phẩm trong giỏ hàng", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              cartItem = user.cart[itemIndex]; // Cập nhật số lượng (nếu có truyền)
              if (!(typeof quantity === "number")) {
                _context18.n = 6;
                break;
              }
              if (!(quantity < 1)) {
                _context18.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Số lượng phải >= 1", {
                extensions: {
                  code: "BAD_REQUEST"
                }
              });
            case 3:
              cartItem.quantity = quantity;

              // Lấy lại giá bán từ variant
              _context18.n = 4;
              return models.Variants.findById(cartItem.VariantId);
            case 4:
              variant = _context18.v;
              if (variant) {
                _context18.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy biến thể sản phẩm", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 5:
              cartItem.price = quantity * (variant.selling_price || 0);
            case 6:
              // Cập nhật trạng thái isChecked (nếu có truyền)
              if (typeof isChecked === "boolean") {
                cartItem.isChecked = isChecked;
              }

              // Lưu thay đổi
              _context18.n = 7;
              return user.save();
            case 7:
              // Build enrichedCart giống myCart
              cart = user.cart || [];
              if (!(cart.length === 0)) {
                _context18.n = 8;
                break;
              }
              return _context18.a(2, []);
            case 8:
              variantIds = cart.map(function (item) {
                return item.VariantId;
              });
              _context18.n = 9;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).populate({
                path: "product_id",
                populate: {
                  path: "shop_id"
                }
              }).lean();
            case 9:
              variants = _context18.v;
              enrichedCart = cart.map(function (item) {
                var _shop$_id4;
                var variant = variants.find(function (v) {
                  return v._id.toString() === item.VariantId.toString();
                });
                var product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                var shop = product === null || product === void 0 ? void 0 : product.shop_id;
                return {
                  _id: item._id,
                  VariantId: item.VariantId,
                  quantity: item.quantity,
                  price: item.price,
                  isChecked: item.isChecked,
                  createdAt: item.createdAt,
                  product: product,
                  shop: shop,
                  shopId: shop === null || shop === void 0 || (_shop$_id4 = shop._id) === null || _shop$_id4 === void 0 ? void 0 : _shop$_id4.toString(),
                  attributes: (variant === null || variant === void 0 ? void 0 : variant.attributes) || []
                };
              }); // Nhóm theo shop
              grouped = {};
              _iterator5 = _createForOfIteratorHelper(enrichedCart);
              _context18.p = 10;
              _iterator5.s();
            case 11:
              if ((_step5 = _iterator5.n()).done) {
                _context18.n = 14;
                break;
              }
              item = _step5.value;
              if (item.shopId) {
                _context18.n = 12;
                break;
              }
              return _context18.a(3, 13);
            case 12:
              if (!grouped[item.shopId]) {
                grouped[item.shopId] = {
                  shop: item.shop,
                  items: []
                };
              }
              grouped[item.shopId].items.push({
                _id: item._id,
                VariantId: item.VariantId,
                quantity: item.quantity,
                price: item.price,
                isChecked: item.isChecked,
                product: item.product,
                attributes: item.attributes
              });
            case 13:
              _context18.n = 11;
              break;
            case 14:
              _context18.n = 16;
              break;
            case 15:
              _context18.p = 15;
              _t5 = _context18.v;
              _iterator5.e(_t5);
            case 16:
              _context18.p = 16;
              _iterator5.f();
              return _context18.f(16);
            case 17:
              return _context18.a(2, Object.values(grouped));
          }
        }, _callee15, null, [[10, 15, 16, 17]]);
      }));
      function updateCartItem(_x47, _x48, _x49) {
        return _updateCartItem.apply(this, arguments);
      }
      return updateCartItem;
    }(),
    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: function () {
      var _removeFromCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(_, _ref33, _ref34) {
        var cartId, models, user, itemIndex, cart, variantIds, variants, grouped, _iterator6, _step6, _loop4, result, _t6;
        return _regenerator().w(function (_context20) {
          while (1) switch (_context20.p = _context20.n) {
            case 0:
              cartId = _ref33.cartId;
              models = _ref34.models, user = _ref34.user;
              if (user) {
                _context20.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 1:
              itemIndex = user.cart.findIndex(function (item) {
                return item._id.toString() === cartId;
              });
              if (!(itemIndex === -1)) {
                _context20.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Sản phẩm không tồn tại trong giỏ hàng", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              // Xóa sản phẩm khỏi giỏ hàng
              user.cart.splice(itemIndex, 1);
              _context20.n = 3;
              return user.save();
            case 3:
              // Gom nhóm lại theo shop (giống myCart)
              cart = user.cart || [];
              variantIds = cart.map(function (item) {
                return item.VariantId;
              });
              _context20.n = 4;
              return models.Variants.find({
                _id: {
                  $in: variantIds
                }
              }).populate({
                path: "product_id",
                populate: {
                  path: "shop_id"
                }
              }).lean();
            case 4:
              variants = _context20.v;
              grouped = {};
              _iterator6 = _createForOfIteratorHelper(cart);
              _context20.p = 5;
              _loop4 = /*#__PURE__*/_regenerator().m(function _loop4() {
                var _shop$_id5;
                var item, variant, product, shop, shopId;
                return _regenerator().w(function (_context19) {
                  while (1) switch (_context19.n) {
                    case 0:
                      item = _step6.value;
                      variant = variants.find(function (v) {
                        return v._id.toString() === item.VariantId.toString();
                      });
                      product = variant === null || variant === void 0 ? void 0 : variant.product_id;
                      shop = product === null || product === void 0 ? void 0 : product.shop_id;
                      shopId = shop === null || shop === void 0 || (_shop$_id5 = shop._id) === null || _shop$_id5 === void 0 ? void 0 : _shop$_id5.toString();
                      if (shopId) {
                        _context19.n = 1;
                        break;
                      }
                      return _context19.a(2, 1);
                    case 1:
                      if (!grouped[shopId]) {
                        grouped[shopId] = {
                          shop: shop,
                          items: []
                        };
                      }
                      grouped[shopId].items.push({
                        _id: item._id,
                        VariantId: item.VariantId,
                        quantity: item.quantity,
                        price: item.price,
                        product: product
                      });
                    case 2:
                      return _context19.a(2);
                  }
                }, _loop4);
              });
              _iterator6.s();
            case 6:
              if ((_step6 = _iterator6.n()).done) {
                _context20.n = 9;
                break;
              }
              return _context20.d(_regeneratorValues(_loop4()), 7);
            case 7:
              if (!_context20.v) {
                _context20.n = 8;
                break;
              }
              return _context20.a(3, 8);
            case 8:
              _context20.n = 6;
              break;
            case 9:
              _context20.n = 11;
              break;
            case 10:
              _context20.p = 10;
              _t6 = _context20.v;
              _iterator6.e(_t6);
            case 11:
              _context20.p = 11;
              _iterator6.f();
              return _context20.f(11);
            case 12:
              // Đảm bảo items luôn là mảng (không null)
              result = Object.values(grouped).map(function (group) {
                return _objectSpread(_objectSpread({}, group), {}, {
                  items: group.items || []
                });
              });
              return _context20.a(2, result);
          }
        }, _callee16, null, [[5, 10, 11, 12]]);
      }));
      function removeFromCart(_x50, _x51, _x52) {
        return _removeFromCart.apply(this, arguments);
      }
      return removeFromCart;
    }()
  }
};
var _default = exports["default"] = userResolvers;