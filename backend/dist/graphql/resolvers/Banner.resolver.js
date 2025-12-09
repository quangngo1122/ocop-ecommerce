"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _graphql = require("graphql");
var _cloudinary = require("../../utils/cloudinary.js");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var bannerResolvers = {
  Query: {
    banner: function () {
      var _banner = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, _ref, _ref2) {
        var _id, models, _banner2, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              _id = _ref._id;
              models = _ref2.models;
              _context.p = 1;
              _context.n = 2;
              return models.Banner.findById(_id);
            case 2:
              _banner2 = _context.v;
              if (_banner2) {
                _context.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Banner not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              return _context.a(2, _banner2);
            case 4:
              _context.p = 4;
              _t = _context.v;
              console.error("Get banner error:", _t);
              throw new _graphql.GraphQLError("Failed to fetch banner", {
                extensions: {
                  code: "FETCH_ERROR",
                  details: _t.message
                }
              });
            case 5:
              return _context.a(2);
          }
        }, _callee, null, [[1, 4]]);
      }));
      function banner(_x, _x2, _x3) {
        return _banner.apply(this, arguments);
      }
      return banner;
    }(),
    banners: function () {
      var _banners = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, _ref3, _ref4) {
        var filter, pagination, models, query, page, limit, total, items, _t2;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              filter = _ref3.filter, pagination = _ref3.pagination;
              models = _ref4.models;
              _context2.p = 1;
              // Xây dựng query filter
              query = {};
              if (filter) {
                if (filter.title) {
                  query.title = {
                    $regex: filter.title,
                    $options: "i"
                  };
                }
                if (filter.status) {
                  query.status = filter.status;
                }
              }
              // Thiết lập pagination
              page = Math.max(0, (pagination === null || pagination === void 0 ? void 0 : pagination.offset) || 0);
              limit = Math.min(50, (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10); // Đếm tổng số records
              _context2.n = 2;
              return models.Banner.countDocuments(query);
            case 2:
              total = _context2.v;
              _context2.n = 3;
              return models.Banner.find(query).skip(page * limit).limit(limit).sort({
                createdAt: -1
              });
            case 3:
              items = _context2.v;
              return _context2.a(2, {
                items: items,
                total: total,
                hasMore: total > (page + 1) * limit
              });
            case 4:
              _context2.p = 4;
              _t2 = _context2.v;
              console.error("List banners error:", _t2);
              throw new _graphql.GraphQLError("Failed to fetch banners", {
                extensions: {
                  code: "FETCH_ERROR",
                  details: _t2.message
                }
              });
            case 5:
              return _context2.a(2);
          }
        }, _callee2, null, [[1, 4]]);
      }));
      function banners(_x4, _x5, _x6) {
        return _banners.apply(this, arguments);
      }
      return banners;
    }()
  },
  Mutation: {
    createBanner: function () {
      var _createBanner = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_, _ref5, _ref6) {
        var input, models, title, image, link, status, imageUrl, newBanner, _error$extensions, _t3;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              input = _ref5.input;
              models = _ref6.models;
              _context3.p = 1;
              title = input.title, image = input.image, link = input.link, status = input.status;
              if (image) {
                _context3.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Image is required", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 2:
              _context3.n = 3;
              return (0, _cloudinary.uploadImageSingle)(image);
            case 3:
              imageUrl = _context3.v;
              if (imageUrl) {
                _context3.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Image upload failed", {
                extensions: {
                  code: "UPLOAD_FAILED"
                }
              });
            case 4:
              _context3.n = 5;
              return models.Banner.create({
                title: title,
                image: imageUrl,
                link: link,
                status: status
              });
            case 5:
              newBanner = _context3.v;
              return _context3.a(2, newBanner);
            case 6:
              _context3.p = 6;
              _t3 = _context3.v;
              console.error("Create banner error:", _t3);
              throw new _graphql.GraphQLError("Failed to create banner", {
                extensions: {
                  code: (_t3 === null || _t3 === void 0 || (_error$extensions = _t3.extensions) === null || _error$extensions === void 0 ? void 0 : _error$extensions.code) || "CREATE_ERROR",
                  details: _t3.message
                }
              });
            case 7:
              return _context3.a(2);
          }
        }, _callee3, null, [[1, 6]]);
      }));
      function createBanner(_x7, _x8, _x9) {
        return _createBanner.apply(this, arguments);
      }
      return createBanner;
    }(),
    updateBanner: function () {
      var _updateBanner = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_, _ref7, _ref8) {
        var _id, input, models, updateData, file, imageUrl, banner, _t4;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              _id = _ref7._id, input = _ref7.input;
              models = _ref8.models;
              _context4.p = 1;
              updateData = _objectSpread({}, input); // Nếu có ảnh mới thì xử lý upload trước
              if (!input.image) {
                _context4.n = 5;
                break;
              }
              _context4.n = 2;
              return input.image;
            case 2:
              file = _context4.v;
              _context4.n = 3;
              return (0, _cloudinary.uploadImageSingle)(file);
            case 3:
              imageUrl = _context4.v;
              if (imageUrl) {
                _context4.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Image upload failed", {
                extensions: {
                  code: "UPLOAD_FAILED"
                }
              });
            case 4:
              updateData.image = imageUrl; // gán URL string
            case 5:
              _context4.n = 6;
              return models.Banner.findByIdAndUpdate(_id, {
                $set: updateData
              }, {
                "new": true,
                runValidators: true
              });
            case 6:
              banner = _context4.v;
              if (banner) {
                _context4.n = 7;
                break;
              }
              throw new _graphql.GraphQLError("Banner not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 7:
              return _context4.a(2, banner);
            case 8:
              _context4.p = 8;
              _t4 = _context4.v;
              console.error("Update banner error:", _t4);
              throw new _graphql.GraphQLError("Failed to update banner", {
                extensions: {
                  code: "UPDATE_ERROR",
                  details: _t4.message
                }
              });
            case 9:
              return _context4.a(2);
          }
        }, _callee4, null, [[1, 8]]);
      }));
      function updateBanner(_x0, _x1, _x10) {
        return _updateBanner.apply(this, arguments);
      }
      return updateBanner;
    }(),
    deleteBanner: function () {
      var _deleteBanner = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(_, _ref9, _ref0) {
        var _id, models, banner, _t5;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.p = _context5.n) {
            case 0:
              _id = _ref9._id;
              models = _ref0.models;
              _context5.p = 1;
              _context5.n = 2;
              return models.Banner.findByIdAndDelete(_id);
            case 2:
              banner = _context5.v;
              if (banner) {
                _context5.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Banner not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              return _context5.a(2, true);
            case 4:
              _context5.p = 4;
              _t5 = _context5.v;
              console.error("Delete banner error:", _t5);
              throw new _graphql.GraphQLError("Failed to delete banner", {
                extensions: {
                  code: "DELETE_ERROR",
                  details: _t5.message
                }
              });
            case 5:
              return _context5.a(2);
          }
        }, _callee5, null, [[1, 4]]);
      }));
      function deleteBanner(_x11, _x12, _x13) {
        return _deleteBanner.apply(this, arguments);
      }
      return deleteBanner;
    }()
  }
};
var _default = exports["default"] = bannerResolvers;