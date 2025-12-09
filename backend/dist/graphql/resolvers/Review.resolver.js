"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _graphql = require("graphql");
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
var reviewResolvers = {
  Query: {
    review: function () {
      var _review = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, _ref, _ref2) {
        var _id, models, review;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _id = _ref._id;
              models = _ref2.models;
              _context.n = 1;
              return models.Review.findById(_id).populate("product_id").populate("user_id").populate("shop_order_id");
            case 1:
              review = _context.v;
              if (review) {
                _context.n = 2;
                break;
              }
              throw new Error("Review not found");
            case 2:
              return _context.a(2, review);
          }
        }, _callee);
      }));
      function review(_x, _x2, _x3) {
        return _review.apply(this, arguments);
      }
      return review;
    }(),
    productReviews: function () {
      var _productReviews = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, _ref3, _ref4) {
        var productId, filter, pagination, models, query, _ref5, _ref5$offset, offset, _ref5$limit, limit, _yield$Promise$all, _yield$Promise$all2, items, total;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              productId = _ref3.productId, filter = _ref3.filter, pagination = _ref3.pagination;
              models = _ref4.models;
              query = {
                product_id: productId
              };
              if (filter) {
                if (filter.status) query.status = filter.status;
                if (filter.rating) query.rating = filter.rating;
                if (filter.fromDate || filter.toDate) {
                  query.createdAt = {};
                  if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
                  if (filter.toDate) query.createdAt.$lte = filter.toDate;
                }
              }
              _ref5 = pagination || {}, _ref5$offset = _ref5.offset, offset = _ref5$offset === void 0 ? 0 : _ref5$offset, _ref5$limit = _ref5.limit, limit = _ref5$limit === void 0 ? 10 : _ref5$limit;
              _context2.n = 1;
              return Promise.all([models.Review.find(query).sort({
                createdAt: -1
              }).skip(offset).limit(limit).populate("product_id").populate("user_id").populate("shop_order_id"), models.Review.countDocuments(query)]);
            case 1:
              _yield$Promise$all = _context2.v;
              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
              items = _yield$Promise$all2[0];
              total = _yield$Promise$all2[1];
              return _context2.a(2, {
                items: items,
                total: total,
                hasMore: offset + items.length < total
              });
          }
        }, _callee2);
      }));
      function productReviews(_x4, _x5, _x6) {
        return _productReviews.apply(this, arguments);
      }
      return productReviews;
    }(),
    userReviews: function () {
      var _userReviews = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_, _ref6, _ref7) {
        var userId, filter, pagination, models, user, query, _ref8, _ref8$offset, offset, _ref8$limit, limit, _yield$Promise$all3, _yield$Promise$all4, items, total;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              userId = _ref6.userId, filter = _ref6.filter, pagination = _ref6.pagination;
              models = _ref7.models, user = _ref7.user;
              if (!(!user || user.id !== userId && user.role !== "admin")) {
                _context3.n = 1;
                break;
              }
              throw new ForbiddenError("Not authorized to view these reviews");
            case 1:
              query = {
                user_id: userId
              };
              if (filter) {
                if (filter.status) query.status = filter.status;
                if (filter.rating) query.rating = filter.rating;
                if (filter.fromDate || filter.toDate) {
                  query.createdAt = {};
                  if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
                  if (filter.toDate) query.createdAt.$lte = filter.toDate;
                }
              }
              _ref8 = pagination || {}, _ref8$offset = _ref8.offset, offset = _ref8$offset === void 0 ? 0 : _ref8$offset, _ref8$limit = _ref8.limit, limit = _ref8$limit === void 0 ? 10 : _ref8$limit;
              _context3.n = 2;
              return Promise.all([models.Review.find(query).sort({
                createdAt: -1
              }).skip(offset).limit(limit).populate("product_id").populate("user_id").populate("shop_order_id"), models.Review.countDocuments(query)]);
            case 2:
              _yield$Promise$all3 = _context3.v;
              _yield$Promise$all4 = _slicedToArray(_yield$Promise$all3, 2);
              items = _yield$Promise$all4[0];
              total = _yield$Promise$all4[1];
              return _context3.a(2, {
                items: items,
                total: total,
                hasMore: offset + items.length < total
              });
          }
        }, _callee3);
      }));
      function userReviews(_x7, _x8, _x9) {
        return _userReviews.apply(this, arguments);
      }
      return userReviews;
    }()
  },
  Mutation: {
    createReview: function () {
      var _createReview = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_, _ref9, _ref0) {
        var input, models, user, shopOrder, existingReview, review, product, allReviews;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              input = _ref9.input;
              models = _ref0.models, user = _ref0.user;
              if (user) {
                _context4.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("You must be logged in to create a review", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context4.n = 2;
              return models.ShopOrder.findOne({
                _id: input.shopOrderId,
                user_id: user.id,
                "products.product_id": input.productId
              });
            case 2:
              shopOrder = _context4.v;
              if (shopOrder) {
                _context4.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("You can only review products from your own orders", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 3:
              _context4.n = 4;
              return models.Review.findOne({
                product_id: input.productId,
                user_id: user.id,
                shop_order_id: input.shopOrderId
              });
            case 4:
              existingReview = _context4.v;
              if (!existingReview) {
                _context4.n = 5;
                break;
              }
              throw new _graphql.GraphQLError("You have already reviewed this product in this order", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 5:
              review = new models.Review({
                product_id: input.productId,
                user_id: user.id,
                shop_order_id: input.shopOrderId,
                rating: input.rating,
                content: input.content,
                review_images: input.images,
                status: "pending"
              });
              _context4.n = 6;
              return review.save();
            case 6:
              _context4.n = 7;
              return models.Product.findById(input.productId);
            case 7:
              product = _context4.v;
              _context4.n = 8;
              return models.Review.find({
                product_id: input.productId,
                status: "approved"
              });
            case 8:
              allReviews = _context4.v;
              product.rating.average = allReviews.reduce(function (acc, review) {
                return acc + review.rating;
              }, 0) / allReviews.length;
              product.rating.count = allReviews.length;
              _context4.n = 9;
              return product.save();
            case 9:
              return _context4.a(2, review);
          }
        }, _callee4);
      }));
      function createReview(_x0, _x1, _x10) {
        return _createReview.apply(this, arguments);
      }
      return createReview;
    }(),
    updateReview: function () {
      var _updateReview = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(_, _ref1, _ref10) {
        var _id, input, models, user, review;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              _id = _ref1._id, input = _ref1.input;
              models = _ref10.models, user = _ref10.user;
              _context5.n = 1;
              return models.Review.findById(_id);
            case 1:
              review = _context5.v;
              if (review) {
                _context5.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Review not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              if (!(!user || user._id !== review.user_id.toString() && user.role !== "admin")) {
                _context5.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Not authorized to update this review", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 3:
              Object.assign(review, input);
              _context5.n = 4;
              return review.save();
            case 4:
              return _context5.a(2, review);
          }
        }, _callee5);
      }));
      function updateReview(_x11, _x12, _x13) {
        return _updateReview.apply(this, arguments);
      }
      return updateReview;
    }(),
    deleteReview: function () {
      var _deleteReview = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(_, _ref11, _ref12) {
        var _id, models, user, review;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              _id = _ref11._id;
              models = _ref12.models, user = _ref12.user;
              _context6.n = 1;
              return models.Review.findById(_id);
            case 1:
              review = _context6.v;
              if (review) {
                _context6.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Review not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              if (!(!user || user._id !== review.user_id.toString() && user.role !== "admin")) {
                _context6.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Not authorized to delete this review", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 3:
              _context6.n = 4;
              return review.remove();
            case 4:
              return _context6.a(2, true);
          }
        }, _callee6);
      }));
      function deleteReview(_x14, _x15, _x16) {
        return _deleteReview.apply(this, arguments);
      }
      return deleteReview;
    }(),
    replyToReview: function () {
      var _replyToReview = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(_, _ref13, _ref14) {
        var _user$shop_id;
        var reviewId, content, models, user, review;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              reviewId = _ref13.reviewId, content = _ref13.content;
              models = _ref14.models, user = _ref14.user;
              if (user) {
                _context7.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("You must be logged in to reply to reviews", {
                extensions: {
                  code: "UNAUTHENTICATED"
                }
              });
            case 1:
              _context7.n = 2;
              return models.Review.findById(reviewId).populate("product_id");
            case 2:
              review = _context7.v;
              if (review) {
                _context7.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Review not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              if (!(review.product_id.shop_id.toString() !== ((_user$shop_id = user.shop_id) === null || _user$shop_id === void 0 ? void 0 : _user$shop_id.toString()))) {
                _context7.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("You can only reply to reviews for products in your shop", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 4:
              review.replies = {
                user_id: user._id,
                content: content,
                createdAt: new Date()
              };
              _context7.n = 5;
              return review.save();
            case 5:
              return _context7.a(2, review);
          }
        }, _callee7);
      }));
      function replyToReview(_x17, _x18, _x19) {
        return _replyToReview.apply(this, arguments);
      }
      return replyToReview;
    }(),
    updateReviewStatus: function () {
      var _updateReviewStatus = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(_, _ref15, _ref16) {
        var _id, status, models, user, review;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              _id = _ref15._id, status = _ref15.status;
              models = _ref16.models, user = _ref16.user;
              if (!(!user || user.role !== "admin")) {
                _context8.n = 1;
                break;
              }
              throw new _graphql.GraphQLError("Only admins can update review status", {
                extensions: {
                  code: "FORBIDDEN"
                }
              });
            case 1:
              _context8.n = 2;
              return models.Review.findById(_id);
            case 2:
              review = _context8.v;
              if (review) {
                _context8.n = 3;
                break;
              }
              throw new _graphql.GraphQLError("Review not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 3:
              review.status = status;
              _context8.n = 4;
              return review.save();
            case 4:
              return _context8.a(2, review);
          }
        }, _callee8);
      }));
      function updateReviewStatus(_x20, _x21, _x22) {
        return _updateReviewStatus.apply(this, arguments);
      }
      return updateReviewStatus;
    }()
  },
  Review: {
    product: function product(review) {
      return review.product_id;
    },
    user: function user(review) {
      return review.user_id;
    },
    shopOrder: function shopOrder(review) {
      return review.shop_order_id;
    },
    reviewImages: function reviewImages(review) {
      return review.review_images;
    }
  }
};
var _default = exports["default"] = reviewResolvers;