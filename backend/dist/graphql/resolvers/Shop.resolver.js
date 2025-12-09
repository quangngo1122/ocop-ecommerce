"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _graphql = require("graphql");
var _mongoose = _interopRequireDefault(require("mongoose"));
var _cloudinary = require("../../utils/cloudinary.js");
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
var shopResolvers = {
  Query: {
    shop: function () {
      var _shop = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, _ref, _ref2) {
        var _id, models, shop, products;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _id = _ref._id;
              models = _ref2.models;
              _context.n = 1;
              return models.Shop.findById(_id).populate("owner");
            case 1:
              shop = _context.v;
              if (shop) {
                _context.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Shop không tồn tại", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              _context.n = 3;
              return models.Product.find({
                shop_id: shop._id
              });
            case 3:
              products = _context.v;
              return _context.a(2, _objectSpread(_objectSpread({}, shop.toObject()), {}, {
                products: products
              }));
          }
        }, _callee);
      }));
      function shop(_x, _x2, _x3) {
        return _shop.apply(this, arguments);
      }
      return shop;
    }(),
    myShop: function () {
      var _myShop = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, __, _ref3) {
        var models, user, shop, shopDetails, products, shopOwner;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              models = _ref3.models, user = _ref3.user, shop = _ref3.shop;
              if (user) {
                _context2.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn phải đăng nhập để xem thông tin shop", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              if (shop) {
                _context2.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Bạn chưa có cửa hàng nào", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              _context2.n = 3;
              return models.Shop.findById(shop._id);
            case 3:
              shopDetails = _context2.v;
              _context2.n = 4;
              return models.Product.find({
                shop_id: shopDetails.owner
              });
            case 4:
              products = _context2.v;
              _context2.n = 5;
              return models.User.findById(shopDetails.owner);
            case 5:
              shopOwner = _context2.v;
              return _context2.a(2, {
                _id: shopDetails._id,
                name: shopDetails.name,
                owner: shopOwner,
                description: shopDetails.description,
                logo: shopDetails.logo,
                slug: shopDetails.slug,
                coverImage: shopDetails.coverImage,
                address: shopDetails.address,
                contact: shopDetails.contact,
                businessLicense: shopDetails.businessLicense,
                rating: shopDetails.rating,
                status: shopDetails.status,
                createdAt: shopDetails.createdAt,
                products: products
              });
          }
        }, _callee2);
      }));
      function myShop(_x4, _x5, _x6) {
        return _myShop.apply(this, arguments);
      }
      return myShop;
    }(),
    shops: function () {
      var _shops = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_, _ref4, _ref5) {
        var filter, pagination, models, query, total, shops;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              filter = _ref4.filter, pagination = _ref4.pagination;
              models = _ref5.models;
              query = {};
              if (filter) {
                // Handle filter conditions
                if (filter.status) query.status = filter.status;
                if (filter.ownerId) query.owner = filter.ownerId;
              }
              _context3.n = 1;
              return models.Shop.countDocuments(query);
            case 1:
              total = _context3.v;
              _context3.n = 2;
              return models.Shop.find(query).populate("owner").skip((pagination === null || pagination === void 0 ? void 0 : pagination.offset) || 0).limit((pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10).sort({
                createdAt: -1
              });
            case 2:
              shops = _context3.v;
              return _context3.a(2, {
                items: shops,
                total: total,
                hasMore: total > ((pagination === null || pagination === void 0 ? void 0 : pagination.offset) || 0) + ((pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10)
              });
          }
        }, _callee3);
      }));
      function shops(_x7, _x8, _x9) {
        return _shops.apply(this, arguments);
      }
      return shops;
    }(),
    shopProducts: function () {
      var _shopProducts = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_, _ref6, _ref7) {
        var shopId, models, products;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              shopId = _ref6.shopId;
              models = _ref7.models;
              _context4.n = 1;
              return models.Product.find({
                shop_id: shopId
              }).populate("category_id").sort({
                createdAt: -1
              });
            case 1:
              products = _context4.v;
              return _context4.a(2, {
                items: products.map(function (p) {
                  return _objectSpread(_objectSpread({}, p.toObject()), {}, {
                    _id: p._id.toString()
                  });
                }),
                total: products.length,
                hasMore: false // hoặc tính theo pagination nếu có
              });
          }
        }, _callee4);
      }));
      function shopProducts(_x0, _x1, _x10) {
        return _shopProducts.apply(this, arguments);
      }
      return shopProducts;
    }()
  },
  Mutation: {
    // createShop: async (_, { input }, { models, user }) => {
    //   // Check if user is authenticated
    //   if (!user) {
    //     throw new GraphQLError(
    //       "Bạn phải đăng nhập để đăng ký trở thành người bán",
    //       {
    //         extensions: { code: "UNAUTHENTICATED" },
    //       }
    //     );
    //   }

    //   // Check if user already has a shop
    //   const existingShop = await models.Shop.findOne({ owner: user._id });
    //   if (existingShop) {
    //     throw new GraphQLError("Bạn đã có cửa hàng trên hệ thống", {
    //       extensions: { code: "BAD_USER_INPUT" },
    //     });
    //   }

    //   // Create the shop
    //   const shop = new models.Shop({
    //     ...input,
    //     owner: user._id,
    //     status: "pending", // Shop cần được admin phê duyệt trước khi hoạt động
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   });

    //   // Lưu shop
    //   await shop.save(); // Cập nhật user thành seller
    //   await models.User.findByIdAndUpdate(user._id, {
    //     role: "seller",
    //     updatedAt: new Date(),
    //   });

    //   // Populate owner để trả về đầy đủ thông tin
    //   await shop.populate("owner");
    //   return shop;
    // },

    updateShop: function () {
      var _updateShop = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(_, _ref8, _ref9) {
        var _id, input, models, user, shop, logoUrl, coverImageUrl;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              _id = _ref8._id, input = _ref8.input;
              models = _ref9.models, user = _ref9.user;
              if (user) {
                _context5.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn phải đăng nhập để cập nhật thông tin shop", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context5.n = 2;
              return models.Shop.findById(_id);
            case 2:
              shop = _context5.v;
              if (shop) {
                _context5.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Shop không tồn tại", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              if (!(shop.owner.toString() !== user._id.toString())) {
                _context5.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Bạn không có quyền cập nhật thông tin shop này", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 4:
              if (!input.logo) {
                _context5.n = 6;
                break;
              }
              _context5.n = 5;
              return (0, _cloudinary.uploadImageSingle)(input.logo);
            case 5:
              logoUrl = _context5.v;
              input.logo = logoUrl;
            case 6:
              if (!input.coverImage) {
                _context5.n = 8;
                break;
              }
              _context5.n = 7;
              return (0, _cloudinary.uploadImageSingle)(input.coverImage);
            case 7:
              coverImageUrl = _context5.v;
              input.coverImage = coverImageUrl;
            case 8:
              // Update shop
              Object.assign(shop, input, {
                updatedAt: new Date()
              });
              _context5.n = 9;
              return shop.save();
            case 9:
              _context5.n = 10;
              return shop.populate("owner");
            case 10:
              return _context5.a(2, shop);
          }
        }, _callee5);
      }));
      function updateShop(_x11, _x12, _x13) {
        return _updateShop.apply(this, arguments);
      }
      return updateShop;
    }(),
    updateShopStatus: function () {
      var _updateShopStatus = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(_, _ref0, _ref1) {
        var updateShopStatusId, status, models, user, shop;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              updateShopStatusId = _ref0.updateShopStatusId, status = _ref0.status;
              models = _ref1.models, user = _ref1.user;
              if (user) {
                _context6.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn phải đăng nhập để cập nhật trạng thái shop", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context6.n = 2;
              return models.Shop.findById(updateShopStatusId);
            case 2:
              shop = _context6.v;
              if (shop) {
                _context6.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Shop không tồn tại", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              if (!(shop.owner.toString() !== user._id.toString() && user.role !== "admin")) {
                _context6.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Bạn không có quyền cập nhật trạng thái shop này", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 4:
              // Update status
              shop.status = status;
              shop.updatedAt = new Date();
              _context6.n = 5;
              return shop.save();
            case 5:
              _context6.n = 6;
              return shop.populate("owner");
            case 6:
              return _context6.a(2, shop);
          }
        }, _callee6);
      }));
      function updateShopStatus(_x14, _x15, _x16) {
        return _updateShopStatus.apply(this, arguments);
      }
      return updateShopStatus;
    }(),
    addBusinessLicense: function () {
      var _addBusinessLicense = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(_, _ref10, _ref11) {
        var shopId, businessLicense, models, user, shop, imageUrls;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              shopId = _ref10.shopId, businessLicense = _ref10.businessLicense;
              models = _ref11.models, user = _ref11.user;
              if (user) {
                _context7.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn phải đăng nhập để thêm giấy phép kinh doanh", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context7.n = 2;
              return models.Shop.findById(shopId);
            case 2:
              shop = _context7.v;
              if (shop) {
                _context7.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Shop không tồn tại", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              if (!(shop.owner.toString() !== user._id.toString())) {
                _context7.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Bạn không có quyền thêm giấy phép kinh doanh cho shop này", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 4:
              // Upload hình ảnh nếu có
              imageUrls = [];
              if (!(businessLicense.images && businessLicense.images.length > 0)) {
                _context7.n = 6;
                break;
              }
              _context7.n = 5;
              return (0, _cloudinary.uploadImageMultiple)(businessLicense.images);
            case 5:
              imageUrls = _context7.v;
            case 6:
              // Thêm giấy phép vào mảng
              shop.businessLicense.push({
                name: businessLicense.name,
                code: businessLicense.code,
                description: businessLicense.description,
                images: imageUrls
              });

              // Lưu lại shop
              _context7.n = 7;
              return shop.save();
            case 7:
              return _context7.a(2, shop);
          }
        }, _callee7);
      }));
      function addBusinessLicense(_x17, _x18, _x19) {
        return _addBusinessLicense.apply(this, arguments);
      }
      return addBusinessLicense;
    }(),
    updateBusinessLicense: function () {
      var _updateBusinessLicense = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(_, _ref12, _ref13) {
        var businessLicenseId, businessLicense, models, user, shop, imageUrls, urls, setFields, res, updatedShop;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              businessLicenseId = _ref12.businessLicenseId, businessLicense = _ref12.businessLicense;
              models = _ref13.models, user = _ref13.user, shop = _ref13.shop;
              if (user) {
                _context8.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn phải đăng nhập để cập nhật giấy phép kinh doanh", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              if (shop) {
                _context8.n = 3;
                break;
              }
              _context8.n = 2;
              return models.Shop.findOne({
                "businessLicense._id": new _mongoose["default"].Types.ObjectId(businessLicenseId)
              });
            case 2:
              shop = _context8.v;
            case 3:
              if (shop) {
                _context8.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy giấy phép kinh doanh", {
                extensions: {
                  code: "LICENSE_NOT_FOUND"
                }
              });
            case 4:
              if (!(shop.owner.toString() !== user._id.toString())) {
                _context8.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("Bạn không có quyền cập nhật giấy phép kinh doanh cho shop này", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 5:
              if (!(businessLicense.images && businessLicense.images.length > 0)) {
                _context8.n = 7;
                break;
              }
              _context8.n = 6;
              return (0, _cloudinary.uploadImageMultiple)(businessLicense.images);
            case 6:
              urls = _context8.v;
              imageUrls = urls; // model mới: images là [String]
            case 7:
              // 5. Build dữ liệu cần update
              setFields = {
                updatedAt: new Date()
              };
              if (businessLicense.name !== undefined) setFields["businessLicense.$[license].name"] = businessLicense.name;
              if (businessLicense.code !== undefined) setFields["businessLicense.$[license].code"] = businessLicense.code;
              if (businessLicense.description !== undefined) setFields["businessLicense.$[license].description"] = businessLicense.description;
              if (imageUrls !== undefined) setFields["businessLicense.$[license].images"] = imageUrls;

              // 6. Thực hiện update
              _context8.n = 8;
              return models.Shop.updateOne({
                _id: shop._id
              }, {
                $set: setFields
              }, {
                arrayFilters: [{
                  "license._id": new _mongoose["default"].Types.ObjectId(businessLicenseId)
                }]
              });
            case 8:
              res = _context8.v;
              if (!(res.modifiedCount === 0)) {
                _context8.n = 9;
                break;
              }
              throw new _graphql.GraphQLError("Không tìm thấy giấy phép hoặc dữ liệu không thay đổi", {
                extensions: {
                  code: "LICENSE_NOT_FOUND_OR_NO_CHANGE"
                }
              });
            case 9:
              _context8.n = 10;
              return models.Shop.findById(shop._id).populate("owner");
            case 10:
              updatedShop = _context8.v;
              return _context8.a(2, updatedShop);
          }
        }, _callee8);
      }));
      function updateBusinessLicense(_x20, _x21, _x22) {
        return _updateBusinessLicense.apply(this, arguments);
      }
      return updateBusinessLicense;
    }(),
    deleteBusinessLicense: function () {
      var _deleteBusinessLicense = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(_, _ref14, _ref15) {
        var shopId, businessLicenseId, models, user, shop, exists;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              shopId = _ref14.shopId, businessLicenseId = _ref14.businessLicenseId;
              models = _ref15.models, user = _ref15.user;
              if (user) {
                _context9.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Bạn phải đăng nhập để xóa giấy phép kinh doanh", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context9.n = 2;
              return models.Shop.findById(shopId);
            case 2:
              shop = _context9.v;
              if (shop) {
                _context9.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Shop không tồn tại", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              if (!(shop.owner.toString() !== user._id.toString())) {
                _context9.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Bạn không có quyền xóa giấy phép kinh doanh của shop này", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 4:
              exists = shop.businessLicense.find(function (license) {
                var _license$_id;
                return ((_license$_id = license._id) === null || _license$_id === void 0 ? void 0 : _license$_id.toString()) === businessLicenseId;
              });
              if (exists) {
                _context9.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("Giấy phép kinh doanh không tồn tại", {
                extensions: {
                  code: "LICENSE_NOT_FOUND"
                }
              });
            case 5:
              // Find and remove the business license
              shop.businessLicense = shop.businessLicense.filter(function (license) {
                return license._id.toString() !== businessLicenseId;
              });
              shop.updatedAt = new Date();
              _context9.n = 6;
              return shop.save();
            case 6:
              _context9.n = 7;
              return shop.populate("owner");
            case 7:
              return _context9.a(2, shop);
          }
        }, _callee9);
      }));
      function deleteBusinessLicense(_x23, _x24, _x25) {
        return _deleteBusinessLicense.apply(this, arguments);
      }
      return deleteBusinessLicense;
    }()
  }
};
var _default = exports["default"] = shopResolvers;