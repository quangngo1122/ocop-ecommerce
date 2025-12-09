"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _firebaseAdmin = _interopRequireDefault(require("../../config/firebase-admin.js"));
var _graphql = require("graphql");
var _cloudinary = require("../../utils/cloudinary.js");
var _slugify = _interopRequireDefault(require("slugify"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var mapProviderToEnum = function mapProviderToEnum(firebaseProvider) {
  var providerMap = {
    "google.com": "google",
    "facebook.com": "facebook",
    password: "email"
  };
  return providerMap[firebaseProvider] || "email";
};
var authResolvers = {
  Query: {
    getCurrentUser: function () {
      var _getCurrentUser = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, __, _ref) {
        var token, models, decodedToken, user, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              token = _ref.token, models = _ref.models;
              if (token) {
                _context.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy token xác thực", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context.p = 1;
              _context.n = 2;
              return _firebaseAdmin["default"].auth().verifyIdToken(token);
            case 2:
              decodedToken = _context.v;
              _context.n = 3;
              return models.User.findOne({
                firebaseUid: decodedToken.uid
              });
            case 3:
              user = _context.v;
              if (user) {
                _context.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy người dùng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 4:
              return _context.a(2, _objectSpread(_objectSpread({}, user.toObject()), {}, {
                _id: user._id.toString(),
                status: user.isActive ? "active" : "inactive",
                role: user.role.toUpperCase()
              }));
            case 5:
              _context.p = 5;
              _t = _context.v;
              console.error("Get current user error:", _t);
              throw new _graphql.GraphQLError("Token không hợp lệ hoặc đã hết hạn", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 6:
              return _context.a(2);
          }
        }, _callee, null, [[1, 5]]);
      }));
      function getCurrentUser(_x, _x2, _x3) {
        return _getCurrentUser.apply(this, arguments);
      }
      return getCurrentUser;
    }()
  },
  Mutation: {
    register: function () {
      var _register = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, _ref2, _ref3) {
        var input, models, firebaseUid, firebaseUser, currentProviders, isGoogleLogin, user, existingUserWithEmail, customToken, _t2, _t3;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              input = _ref2.input;
              models = _ref3.models;
              firebaseUid = input.firebaseUid;
              if (firebaseUid) {
                _context2.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Firebase UID là bắt buộc", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 1:
              _context2.p = 1;
              if (_firebaseAdmin["default"].apps.length) {
                _context2.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Firebase chưa được cấu hình", {
                extensions: {
                  code: "FIREBASE_CONFIG_ERROR"
                }
              });
            case 2:
              _context2.p = 2;
              _context2.n = 3;
              return _firebaseAdmin["default"].auth().getUser(firebaseUid);
            case 3:
              firebaseUser = _context2.v;
              _context2.n = 5;
              break;
            case 4:
              _context2.p = 4;
              _t2 = _context2.v;
              console.error("Firebase get user error:", _t2);
              throw new _graphql.GraphQLError("Không tìm thấy tài khoản Firebase", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 5:
              currentProviders = firebaseUser.providerData.map(function (p) {
                return p.providerId;
              });
              isGoogleLogin = currentProviders.includes("google.com");
              _context2.n = 6;
              return models.User.findOne({
                firebaseUid: firebaseUid
              });
            case 6:
              user = _context2.v;
              _context2.n = 7;
              return models.User.findOne({
                email: firebaseUser.email
              });
            case 7:
              existingUserWithEmail = _context2.v;
              if (!(!user && isGoogleLogin && existingUserWithEmail && existingUserWithEmail.provider === "email")) {
                _context2.n = 8;
                break;
              }
              return _context2.a(2, {
                user: null,
                firebaseInfo: {
                  firebaseUid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                  phoneNumber: firebaseUser.phoneNumber,
                  providerId: "google.com"
                },
                needsAccountLinking: true,
                existingProvider: existingUserWithEmail.provider,
                accessToken: null,
                refreshToken: null
              });
            case 8:
              if (!(!user && !existingUserWithEmail)) {
                _context2.n = 10;
                break;
              }
              _context2.n = 9;
              return models.User.create({
                firebaseUid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
                phoneNumber: firebaseUser.phoneNumber || "",
                role: "user",
                isActive: true,
                provider: isGoogleLogin ? "google" : "email",
                providerIds: currentProviders,
                avatar: firebaseUser.photoURL || "https://res.cloudinary.com/dtexmphc4/image/upload/v1750046642/default_avatar_ynxrjq.avif",
                createdAt: new Date(),
                updatedAt: new Date()
              });
            case 9:
              user = _context2.v;
            case 10:
              if (!user) {
                _context2.n = 13;
                break;
              }
              user.providerIds = currentProviders;
              _context2.n = 11;
              return user.save();
            case 11:
              _context2.n = 12;
              return _firebaseAdmin["default"].auth().createCustomToken(user.firebaseUid, {
                role: user.role,
                userId: user._id.toString()
              });
            case 12:
              customToken = _context2.v;
              return _context2.a(2, {
                user: _objectSpread(_objectSpread({}, user.toObject()), {}, {
                  _id: user._id.toString(),
                  status: user.isActive ? "active" : "inactive",
                  role: user.role.toUpperCase()
                }),
                firebaseInfo: null,
                accessToken: customToken,
                refreshToken: null,
                needsAccountLinking: false
              });
            case 13:
              return _context2.a(2, {
                user: null,
                firebaseInfo: {
                  firebaseUid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                  phoneNumber: firebaseUser.phoneNumber,
                  providerId: isGoogleLogin ? "google.com" : "password"
                },
                needsAccountLinking: true,
                existingProvider: (existingUserWithEmail === null || existingUserWithEmail === void 0 ? void 0 : existingUserWithEmail.provider) || null,
                accessToken: null,
                refreshToken: null
              });
            case 14:
              _context2.p = 14;
              _t3 = _context2.v;
              console.error("Register error:", _t3);
              if (!(_t3 instanceof UserInputError)) {
                _context2.n = 15;
                break;
              }
              throw _t3;
            case 15:
              if (!(_t3.code === "auth/configuration-not-found")) {
                _context2.n = 16;
                break;
              }
              throw new _graphql.GraphQLError("Lỗi cấu hình Firebase", {
                extensions: {
                  code: "FIREBASE_CONFIG_ERROR"
                }
              });
            case 16:
              throw new _graphql.GraphQLError("Đăng ký thất bại. Vui lòng thử lại sau.", {
                extensions: {
                  code: "REGISTER_FAILED"
                }
              });
            case 17:
              return _context2.a(2);
          }
        }, _callee2, null, [[2, 4], [1, 14]]);
      }));
      function register(_x4, _x5, _x6) {
        return _register.apply(this, arguments);
      }
      return register;
    }(),
    linkGoogleAccount: function () {
      var _linkGoogleAccount = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_, __, _ref4) {
        var models, token, decodedToken, firebaseUser, isGoogleLinked, user, currentProviders, _t4;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              models = _ref4.models, token = _ref4.token;
              if (token) {
                _context3.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Token xác thực không được cung cấp", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context3.p = 1;
              _context3.n = 2;
              return _firebaseAdmin["default"].auth().verifyIdToken(token);
            case 2:
              decodedToken = _context3.v;
              _context3.n = 3;
              return _firebaseAdmin["default"].auth().getUser(decodedToken.uid);
            case 3:
              firebaseUser = _context3.v;
              isGoogleLinked = firebaseUser.providerData.some(function (provider) {
                return provider.providerId === "google.com";
              });
              if (isGoogleLinked) {
                _context3.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Tài khoản Google chưa được liên kết", {
                extensions: {
                  code: "GOOGLE_NOT_LINKED"
                }
              });
            case 4:
              _context3.n = 5;
              return models.User.findOne({
                firebaseUid: decodedToken.uid
              });
            case 5:
              user = _context3.v;
              if (user) {
                _context3.n = 6;
                break;
              }
              throw new _graphql.GraphQLError("Người dùng không tồn tại", {
                extensions: {
                  code: "USER_NOT_FOUND"
                }
              });
            case 6:
              currentProviders = firebaseUser.providerData.map(function (p) {
                return p.providerId;
              });
              if (!user.providerIds.includes("google.com")) {
                user.providerIds.push("google.com");
              }
              if (!user.avatar && firebaseUser.photoURL) {
                user.avatar = firebaseUser.photoURL;
              }
              _context3.n = 7;
              return user.save();
            case 7:
              return _context3.a(2, {
                user: _objectSpread(_objectSpread({}, user.toObject()), {}, {
                  _id: user._id.toString(),
                  status: user.isActive ? "active" : "inactive",
                  role: user.role.toUpperCase()
                }),
                accessToken: token,
                refreshToken: null
              });
            case 8:
              _context3.p = 8;
              _t4 = _context3.v;
              console.error("Link Google error:", _t4);
              if (!(_t4 instanceof UserInputError || _t4 instanceof AuthenticationError)) {
                _context3.n = 9;
                break;
              }
              throw _t4;
            case 9:
              throw new _graphql.GraphQLError("Không thể liên kết tài khoản Google", {
                extensions: {
                  code: "LINK_GOOGLE_ERROR"
                }
              });
            case 10:
              return _context3.a(2);
          }
        }, _callee3, null, [[1, 8]]);
      }));
      function linkGoogleAccount(_x7, _x8, _x9) {
        return _linkGoogleAccount.apply(this, arguments);
      }
      return linkGoogleAccount;
    }(),
    registerSeller: function () {
      var _registerSeller = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_, _ref5, _ref6) {
        var input, models, user, token, existingShop, uploadResult, baseSlug, slug, count, shop, updatedUser, refreshToken;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              input = _ref5.input;
              models = _ref6.models, user = _ref6.user, token = _ref6.token;
              if (user) {
                _context4.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn phải đăng nhập để đăng ký bán hàng", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              if (!(user.role === "seller")) {
                _context4.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Tài khoản đã là người bán hàng", {
                extensions: {
                  code: "AccountWasSeller"
                }
              });
            case 2:
              _context4.n = 3;
              return models.Shop.findOne({
                owner: user._id
              });
            case 3:
              existingShop = _context4.v;
              if (!existingShop) {
                _context4.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Cửa hàng này đã tồn tại", {
                extensions: {
                  code: "ExistShop"
                }
              });
            case 4:
              if (!input.shop.logo) {
                _context4.n = 6;
                break;
              }
              _context4.n = 5;
              return (0, _cloudinary.uploadImageSingle)(input.shop.logo);
            case 5:
              uploadResult = _context4.v;
              input.shop.logo = uploadResult;
            case 6:
              // Tạo slug từ tên cửa hàng
              baseSlug = (0, _slugify["default"])(input.shop.name, {
                lower: true,
                strict: true
              });
              slug = baseSlug;
              count = 1;
            case 7:
              _context4.n = 8;
              return models.Shop.exists({
                slug: slug
              });
            case 8:
              if (!_context4.v) {
                _context4.n = 9;
                break;
              }
              slug = "".concat(baseSlug, "-").concat(count++);
              _context4.n = 7;
              break;
            case 9:
              input.shop.slug = slug;
              shop = new models.Shop(_objectSpread(_objectSpread({}, input.shop), {}, {
                owner: user._id,
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date()
              }));
              _context4.n = 10;
              return shop.save();
            case 10:
              _context4.n = 11;
              return models.User.findByIdAndUpdate(user._id, {
                role: "seller",
                updatedAt: new Date()
              });
            case 11:
              _context4.n = 12;
              return models.User.findById(user._id);
            case 12:
              updatedUser = _context4.v;
              refreshToken = null;
              if (!(user.firebaseUid && typeof (_firebaseAdmin["default"] === null || _firebaseAdmin["default"] === void 0 ? void 0 : _firebaseAdmin["default"].auth) === "function")) {
                _context4.n = 14;
                break;
              }
              _context4.n = 13;
              return _firebaseAdmin["default"].auth().createCustomToken(user.firebaseUid, {
                role: "seller",
                userId: user._id.toString()
              });
            case 13:
              refreshToken = _context4.v;
            case 14:
              return _context4.a(2, {
                auth: {
                  user: _objectSpread(_objectSpread({}, updatedUser.toObject()), {}, {
                    _id: updatedUser._id.toString(),
                    status: updatedUser.isActive ? "active" : "inactive",
                    role: updatedUser.role.toUpperCase()
                  }),
                  accessToken: token || null,
                  refreshToken: refreshToken,
                  firebaseInfo: null,
                  needsAccountLinking: false
                },
                shop: shop
              });
          }
        }, _callee4);
      }));
      function registerSeller(_x0, _x1, _x10) {
        return _registerSeller.apply(this, arguments);
      }
      return registerSeller;
    }()
  }
};
var _default = exports["default"] = authResolvers;