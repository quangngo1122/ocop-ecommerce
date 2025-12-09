"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _graphql = require("graphql");
var _slugify = _interopRequireDefault(require("slugify"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var categoryResolvers = {
  Query: {
    categories: function () {
      var _categories = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, _ref, _ref2) {
        var filter, pagination, models, query, page, limit, total, _categories2, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              filter = _ref.filter, pagination = _ref.pagination;
              models = _ref2.models;
              _context.p = 1;
              // Xây dựng query filter
              query = {};
              if (filter) {
                if (filter.name) {
                  query.name = {
                    $regex: filter.name,
                    $options: "i"
                  };
                }
                if (filter.slug) {
                  query.slug = filter.slug;
                }
                if (filter._id) {
                  query._id = filter.id;
                }
              }

              // Thiết lập pagination
              page = Math.max(0, (pagination === null || pagination === void 0 ? void 0 : pagination.offset) || 0);
              limit = Math.min(50, (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || 10); // Đếm tổng số records
              _context.n = 2;
              return models.Category.countDocuments(query);
            case 2:
              total = _context.v;
              _context.n = 3;
              return models.Category.find(query).populate("parent").skip(page).limit(limit).sort({
                createdAt: -1
              });
            case 3:
              _categories2 = _context.v;
              return _context.a(2, {
                items: _categories2,
                total: total,
                hasMore: total > page + limit
              });
            case 4:
              _context.p = 4;
              _t = _context.v;
              console.error("List categories error:", _t);
              throw new _graphql.GraphQLError("Failed to fetch categories", {
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
      function categories(_x, _x2, _x3) {
        return _categories.apply(this, arguments);
      }
      return categories;
    }(),
    category: function () {
      var _category = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_, _ref3, _ref4) {
        var _id, models, _category2, _t2;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              _id = _ref3._id;
              models = _ref4.models;
              _context2.p = 1;
              _context2.n = 2;
              return models.Category.findById(_id).populate("parent");
            case 2:
              _category2 = _context2.v;
              if (_category2) {
                _context2.n = 3;
                break;
              }
              return _context2.a(2, null);
            case 3:
              return _context2.a(2, _category2);
            case 4:
              _context2.p = 4;
              _t2 = _context2.v;
              console.error("Get category error:", _t2);
              throw new _graphql.GraphQLError("Failed to fetch category", {
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
      function category(_x4, _x5, _x6) {
        return _category.apply(this, arguments);
      }
      return category;
    }()
  },
  Mutation: {
    createCategory: function () {
      var _createCategory = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_, _ref5, _ref6) {
        var input, models, slug, existingCategory, category, _t3;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              input = _ref5.input;
              models = _ref6.models;
              _context3.p = 1;
              if (input.name) {
                _context3.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Name is required", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 2:
              slug = input.slug || (0, _slugify["default"])(input.name, {
                lower: true,
                strict: true
              }); // Check if category with same slug exists
              _context3.n = 3;
              return models.Category.findOne({
                slug: slug
              });
            case 3:
              existingCategory = _context3.v;
              if (!existingCategory) {
                _context3.n = 4;
                break;
              }
              throw new _graphql.GraphQLError("Category with this name already exists", {
                extensions: {
                  code: "BAD_USER_INPUT"
                }
              });
            case 4:
              _context3.n = 5;
              return models.Category.create({
                name: input.name,
                slug: slug,
                parent: input.parentId || null,
                status: input.status || "active"
              });
            case 5:
              category = _context3.v;
              return _context3.a(2, category);
            case 6:
              _context3.p = 6;
              _t3 = _context3.v;
              console.error("Create category error:", _t3);
              throw new _graphql.GraphQLError(_t3.message || "Failed to create category");
            case 7:
              return _context3.a(2);
          }
        }, _callee3, null, [[1, 6]]);
      }));
      function createCategory(_x7, _x8, _x9) {
        return _createCategory.apply(this, arguments);
      }
      return createCategory;
    }(),
    updateCategory: function () {
      var _updateCategory = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(_, _ref7, _ref8) {
        var _id, input, models, category;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              _id = _ref7._id, input = _ref7.input;
              models = _ref8.models;
              _context4.n = 1;
              return models.Category.findById(_id);
            case 1:
              category = _context4.v;
              if (category) {
                _context4.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Category not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              // Xử lý cập nhật parent (danh mục cha)
              if (Object.prototype.hasOwnProperty.call(input, "parentId")) {
                category.parent = input.parentId || null;
              }
              // Cập nhật các trường khác
              if (input.name !== undefined) category.name = input.name;
              if (input.slug !== undefined) category.slug = input.slug;
              if (input.status !== undefined) category.status = input.status;
              _context4.n = 3;
              return category.save();
            case 3:
              return _context4.a(2, category);
          }
        }, _callee4);
      }));
      function updateCategory(_x0, _x1, _x10) {
        return _updateCategory.apply(this, arguments);
      }
      return updateCategory;
    }(),
    deleteCategory: function () {
      var _deleteCategory = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(_, _ref9, _ref0) {
        var _id, models, category;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              _id = _ref9._id;
              models = _ref0.models;
              _context5.n = 1;
              return models.Category.findById(_id);
            case 1:
              category = _context5.v;
              if (category) {
                _context5.n = 2;
                break;
              }
              throw new _graphql.GraphQLError("Category not found", {
                extensions: {
                  code: "NOT_FOUND"
                }
              });
            case 2:
              _context5.n = 3;
              return category.deleteOne();
            case 3:
              return _context5.a(2, category);
          }
        }, _callee5);
      }));
      function deleteCategory(_x11, _x12, _x13) {
        return _deleteCategory.apply(this, arguments);
      }
      return deleteCategory;
    }()
  }
};
var _default = exports["default"] = categoryResolvers;