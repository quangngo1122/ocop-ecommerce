"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;
var _slugify = _interopRequireDefault(require("slugify"));
var _graphql = require("graphql");
var _cloudinary = require("../../utils/cloudinary.js");
var _ProductAuditLogModel = _interopRequireDefault(
  require("../../models/ProductAuditLog.model.js")
);
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return (
    (_typeof =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (o) {
            return typeof o;
          }
        : function (o) {
            return o &&
              "function" == typeof Symbol &&
              o.constructor === Symbol &&
              o !== Symbol.prototype
              ? "symbol"
              : typeof o;
          }),
    _typeof(o)
  );
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return (
      _regeneratorDefine2(
        u,
        "_invoke",
        (function (r, n, o) {
          var i,
            c,
            u,
            f = 0,
            p = o || [],
            y = !1,
            G = {
              p: 0,
              n: 0,
              v: e,
              a: d,
              f: d.bind(e, 4),
              d: function d(t, r) {
                return (i = t), (c = 0), (u = e), (G.n = r), a;
              },
            };
          function d(r, n) {
            for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
              var o,
                i = p[t],
                d = G.p,
                l = i[2];
              r > 3
                ? (o = l === n) &&
                  ((u = i[(c = i[4]) ? 5 : ((c = 3), 3)]), (i[4] = i[5] = e))
                : i[0] <= d &&
                  ((o = r < 2 && d < i[1])
                    ? ((c = 0), (G.v = n), (G.n = i[1]))
                    : d < l &&
                      (o = r < 3 || i[0] > n || n > l) &&
                      ((i[4] = r), (i[5] = n), (G.n = l), (c = 0)));
            }
            if (o || r > 1) return a;
            throw ((y = !0), n);
          }
          return function (o, p, l) {
            if (f > 1) throw TypeError("Generator is already running");
            for (
              y && 1 === p && d(p, l), c = p, u = l;
              (t = c < 2 ? e : u) || !y;

            ) {
              i ||
                (c
                  ? c < 3
                    ? (c > 1 && (G.n = -1), d(c, u))
                    : (G.n = u)
                  : (G.v = u));
              try {
                if (((f = 2), i)) {
                  if ((c || (o = "next"), (t = i[o]))) {
                    if (!(t = t.call(i, u)))
                      throw TypeError("iterator result is not an object");
                    if (!t.done) return t;
                    (u = t.value), c < 2 && (c = 0);
                  } else
                    1 === c && (t = i["return"]) && t.call(i),
                      c < 2 &&
                        ((u = TypeError(
                          "The iterator does not provide a '" + o + "' method"
                        )),
                        (c = 1));
                  i = e;
                } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
              } catch (t) {
                (i = e), (c = 1), (u = t);
              } finally {
                f = 1;
              }
            }
            return { value: t, done: y };
          };
        })(r, o, i),
        !0
      ),
      u
    );
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n]
      ? t(t([][n]()))
      : (_regeneratorDefine2((t = {}), n, function () {
          return this;
        }),
        t),
    u =
      (GeneratorFunctionPrototype.prototype =
      Generator.prototype =
        Object.create(c));
  function f(e) {
    return (
      Object.setPrototypeOf
        ? Object.setPrototypeOf(e, GeneratorFunctionPrototype)
        : ((e.__proto__ = GeneratorFunctionPrototype),
          _regeneratorDefine2(e, o, "GeneratorFunction")),
      (e.prototype = Object.create(u)),
      e
    );
  }
  return (
    (GeneratorFunction.prototype = GeneratorFunctionPrototype),
    _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype),
    _regeneratorDefine2(
      GeneratorFunctionPrototype,
      "constructor",
      GeneratorFunction
    ),
    (GeneratorFunction.displayName = "GeneratorFunction"),
    _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"),
    _regeneratorDefine2(u),
    _regeneratorDefine2(u, o, "Generator"),
    _regeneratorDefine2(u, n, function () {
      return this;
    }),
    _regeneratorDefine2(u, "toString", function () {
      return "[object Generator]";
    }),
    (_regenerator = function _regenerator() {
      return { w: i, m: f };
    })()
  );
}
function _regeneratorDefine2(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  (_regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine2(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r
      ? i
        ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t })
        : (e[r] = n)
      : (o("next", 0), o("throw", 1), o("return", 2));
  }),
    _regeneratorDefine2(e, r, n, t);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r &&
      (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })),
      t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2
      ? ownKeys(Object(t), !0).forEach(function (r) {
          _defineProperty(e, r, t[r]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
      : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (
    (r = _toPropertyKey(r)) in e
      ? Object.defineProperty(e, r, {
          value: t,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[r] = t),
    e
  );
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _toConsumableArray(r) {
  return (
    _arrayWithoutHoles(r) ||
    _iterableToArray(r) ||
    _unsupportedIterableToArray(r) ||
    _nonIterableSpread()
  );
}
function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return (
      "Object" === t && r.constructor && (t = r.constructor.name),
      "Map" === t || "Set" === t
        ? Array.from(r)
        : "Arguments" === t ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
        ? _arrayLikeToArray(r, a)
        : void 0
    );
  }
}
function _iterableToArray(r) {
  if (
    ("undefined" != typeof Symbol && null != r[Symbol.iterator]) ||
    null != r["@@iterator"]
  )
    return Array.from(r);
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function getVariantKey(attrs) {
  return attrs
    .map(function (a) {
      return "".concat(a.name, ":").concat(a.value);
    })
    .sort()
    .join("|");
}
function cartesianProduct(arr) {
  return arr.reduce(
    function (a, b) {
      return a.flatMap(function (d) {
        return b.map(function (e) {
          return [].concat(_toConsumableArray(d), [e]);
        });
      });
    },
    [[]]
  );
}
var productResolvers = {
  Query: {
    product: (function () {
      var _product = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee(_, _ref, _ref2) {
          var _productObject$price$,
            _productObject$price,
            _productObject$price$2,
            _productObject$price2;
          var _id, models, product, variants, productObject;
          return _regenerator().w(function (_context) {
            while (1)
              switch (_context.n) {
                case 0:
                  _id = _ref._id;
                  models = _ref2.models;
                  _context.n = 1;
                  return models.Product.findById(_id)
                    .populate({
                      path: "shop_id",
                      populate: {
                        path: "owner",
                        model: "User",
                      },
                    })
                    .populate("category_id");
                case 1:
                  product = _context.v;
                  if (product) {
                    _context.n = 2;
                    break;
                  }
                  throw new _graphql.GraphQLError("Product not found", {
                    extensions: {
                      code: "PRODUCT_NOT_FOUND",
                    },
                  });
                case 2:
                  _context.n = 3;
                  return models.Variants.find({
                    product_id: product._id,
                  }).lean();
                case 3:
                  variants = _context.v;
                  // Ép kiểu về object thuần và bổ sung các field cần thiết
                  productObject = product.toObject();
                  productObject.variants = variants || [];
                  productObject._id = product._id.toString();

                  // Đảm bảo có trường giá
                  productObject.price = _objectSpread(
                    _objectSpread({}, productObject.price),
                    {},
                    {
                      min_price:
                        (_productObject$price$ =
                          (_productObject$price = productObject.price) ===
                            null || _productObject$price === void 0
                            ? void 0
                            : _productObject$price.min_price) !== null &&
                        _productObject$price$ !== void 0
                          ? _productObject$price$
                          : 0,
                      max_price:
                        (_productObject$price$2 =
                          (_productObject$price2 = productObject.price) ===
                            null || _productObject$price2 === void 0
                            ? void 0
                            : _productObject$price2.max_price) !== null &&
                        _productObject$price$2 !== void 0
                          ? _productObject$price$2
                          : 0,
                    }
                  );

                  // Đảm bảo có category
                  if (!productObject.category_id) {
                    productObject.category_id = {
                      _id: "",
                      name: "Uncategorized",
                    };
                  }
                  return _context.a(2, productObject);
              }
          }, _callee);
        })
      );
      function product(_x, _x2, _x3) {
        return _product.apply(this, arguments);
      }
      return product;
    })(),
    productAuditLogs: (function () {
      var _productAuditLogs = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee2(_, _ref3, _ref4) {
          var productId,
            variantId,
            _ref3$limit,
            limit,
            _ref3$offset,
            offset,
            models,
            query,
            logs;
          return _regenerator().w(function (_context2) {
            while (1)
              switch (_context2.n) {
                case 0:
                  (productId = _ref3.productId),
                    (variantId = _ref3.variantId),
                    (_ref3$limit = _ref3.limit),
                    (limit = _ref3$limit === void 0 ? 20 : _ref3$limit),
                    (_ref3$offset = _ref3.offset),
                    (offset = _ref3$offset === void 0 ? 0 : _ref3$offset);
                  models = _ref4.models;
                  query = {
                    product_id: productId,
                  };
                  if (variantId) query.variant_id = variantId;
                  _context2.n = 1;
                  return models.ProductAuditLog.find(query)
                    .sort({
                      createdAt: -1,
                    })
                    .skip(offset)
                    .limit(limit)
                    .lean();
                case 1:
                  logs = _context2.v;
                  return _context2.a(
                    2,
                    logs.map(function (log) {
                      return _objectSpread(
                        _objectSpread({}, log),
                        {},
                        {
                          _id: log._id.toString(),
                        }
                      );
                    })
                  );
              }
          }, _callee2);
        })
      );
      function productAuditLogs(_x4, _x5, _x6) {
        return _productAuditLogs.apply(this, arguments);
      }
      return productAuditLogs;
    })(),
    products: (function () {
      var _products = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee3(_, _ref5, _ref6) {
          var filter,
            pagination,
            models,
            query,
            offset,
            limit,
            sort,
            total,
            products,
            productIds,
            variants,
            productWithVariants;
          return _regenerator().w(function (_context3) {
            while (1)
              switch (_context3.n) {
                case 0:
                  (filter = _ref5.filter), (pagination = _ref5.pagination);
                  models = _ref6.models;
                  query = {}; // Thêm lọc theo tên nếu có
                  if (filter !== null && filter !== void 0 && filter.name) {
                    query.name = {
                      $regex: filter.name,
                      $options: "i",
                    };
                  }
                  if (filter !== null && filter !== void 0 && filter.shopId) {
                    query.shop_id = filter.shopId;
                  }
                  if (
                    filter !== null &&
                    filter !== void 0 &&
                    filter.categoryId
                  ) {
                    query.category_id = filter.categoryId;
                  }
                  if (filter !== null && filter !== void 0 && filter.status) {
                    query.status = filter.status;
                  }
                  if (filter !== null && filter !== void 0 && filter.minPrice) {
                    query["price.min_price"] = {
                      $gte: filter.minPrice,
                    };
                  }
                  if (filter !== null && filter !== void 0 && filter.maxPrice) {
                    query["price.max_price"] = {
                      $lte: filter.maxPrice,
                    };
                  }
                  offset =
                    (pagination === null || pagination === void 0
                      ? void 0
                      : pagination.offset) || 0;
                  limit =
                    (pagination === null || pagination === void 0
                      ? void 0
                      : pagination.limit) || 10; // Xử lý sort theo giá
                  sort = {
                    createdAt: -1,
                  };
                  if (
                    (filter === null || filter === void 0
                      ? void 0
                      : filter.sortByPrice) === "ascending"
                  ) {
                    sort = {
                      "price.min_price": 1,
                    };
                  } else if (
                    (filter === null || filter === void 0
                      ? void 0
                      : filter.sortByPrice) === "descending"
                  ) {
                    sort = {
                      "price.min_price": -1,
                    };
                  }
                  _context3.n = 1;
                  return models.Product.countDocuments(query);
                case 1:
                  total = _context3.v;
                  _context3.n = 2;
                  return models.Product.find(query)
                    .populate("shop_id")
                    .populate("category_id")
                    .skip(offset)
                    .limit(limit)
                    .sort(sort);
                case 2:
                  products = _context3.v;
                  productIds = products.map(function (p) {
                    return p._id;
                  });
                  _context3.n = 3;
                  return models.Variants.find({
                    product_id: {
                      $in: productIds,
                    },
                  }).lean();
                case 3:
                  variants = _context3.v;
                  productWithVariants = products.map(function (product) {
                    var matchedVariants = variants.filter(function (v) {
                      return v.product_id.toString() === product._id.toString();
                    });
                    var obj = product.toObject();
                    obj.variants = matchedVariants;
                    obj._id = product._id.toString();
                    return obj;
                  });
                  return _context3.a(2, {
                    items: productWithVariants,
                    total: total,
                    hasMore: total > offset + limit,
                  });
              }
          }, _callee3);
        })
      );
      function products(_x7, _x8, _x9) {
        return _products.apply(this, arguments);
      }
      return products;
    })(),
    variant: (function () {
      var _variant = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee4(_, _ref7, _ref8) {
          var variantId, models, variant;
          return _regenerator().w(function (_context4) {
            while (1)
              switch (_context4.n) {
                case 0:
                  variantId = _ref7.variantId;
                  models = _ref8.models;
                  _context4.n = 1;
                  return models.Variants.findOne({
                    _id: variantId,
                  });
                case 1:
                  variant = _context4.v;
                  if (variant) {
                    _context4.n = 2;
                    break;
                  }
                  throw new _graphql.GraphQLError("Variant not found", {
                    extensions: {
                      code: "VARIANT_NOT_FOUND",
                    },
                  });
                case 2:
                  return _context4.a(2, variant);
              }
          }, _callee4);
        })
      );
      function variant(_x0, _x1, _x10) {
        return _variant.apply(this, arguments);
      }
      return variant;
    })(),
  },
  Mutation: {
    createProduct: (function () {
      var _createProduct = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee6(_, _ref9, _ref0) {
          var input,
            models,
            user,
            shop,
            category,
            baseSlug,
            slug,
            count,
            productImages,
            product,
            prices,
            variants,
            stockQuantity,
            min_price,
            max_price;
          return _regenerator().w(function (_context6) {
            while (1)
              switch (_context6.n) {
                case 0:
                  input = _ref9.input;
                  (models = _ref0.models),
                    (user = _ref0.user),
                    (shop = _ref0.shop);
                  if (!(!user || user.role !== "seller")) {
                    _context6.n = 1;
                    break;
                  }
                  throw new _graphql.GraphQLError("Unauthorized", {
                    extensions: {
                      code: "UNAUTHORIZED",
                    },
                  });
                case 1:
                  if (shop) {
                    _context6.n = 2;
                    break;
                  }
                  throw new _graphql.GraphQLError("Shop not found", {
                    extensions: {
                      code: "SHOP_NOT_FOUND",
                    },
                  });
                case 2:
                  _context6.n = 3;
                  return models.Category.findById(input.categoryId);
                case 3:
                  category = _context6.v;
                  if (category) {
                    _context6.n = 4;
                    break;
                  }
                  throw new _graphql.GraphQLError("Category not found", {
                    extensions: {
                      code: "CATEGORY_NOT_FOUND",
                    },
                  });
                case 4:
                  // 1. Tạo slug duy nhất
                  baseSlug = (0, _slugify["default"])(input.name, {
                    lower: true,
                    strict: true,
                  });
                  slug = baseSlug;
                  count = 1;
                case 5:
                  _context6.n = 6;
                  return models.Product.exists({
                    slug: slug,
                  });
                case 6:
                  if (!_context6.v) {
                    _context6.n = 7;
                    break;
                  }
                  slug = "".concat(baseSlug, "-").concat(count++);
                  _context6.n = 5;
                  break;
                case 7:
                  _context6.n = 8;
                  return Promise.all(
                    input.images.map(function (file) {
                      return (0, _cloudinary.uploadImageSingle)(file);
                    })
                  );
                case 8:
                  productImages = _context6.v;
                  _context6.n = 9;
                  return models.Product.create({
                    name: input.name,
                    slug: slug,
                    shop_id: shop._id,
                    category_id: input.categoryId,
                    description: input.description,
                    specifications: input.specifications,
                    images: productImages,
                    price: _objectSpread({}, input.price),
                  });
                case 9:
                  product = _context6.v;
                  // 4. Xử lý biến thể (nếu có)
                  prices = [];
                  _context6.n = 10;
                  return Promise.all(
                    (input.variantCombinations || []).map(
                      /*#__PURE__*/ (function () {
                        var _ref1 = _asyncToGenerator(
                          /*#__PURE__*/ _regenerator().m(function _callee5(
                            combination
                          ) {
                            var _combination$price, _combination$stock_qu;
                            var variantSlug, variantImage, sellingPrice;
                            return _regenerator().w(function (_context5) {
                              while (1)
                                switch (_context5.n) {
                                  case 0:
                                    variantSlug = (0, _slugify["default"])(
                                      "".concat(input.name, "-").concat(
                                        combination.attributes
                                          .map(function (a) {
                                            return a.value;
                                          })
                                          .join("-")
                                      ),
                                      {
                                        lower: true,
                                        strict: true,
                                      }
                                    );
                                    _context5.n = 1;
                                    return (0, _cloudinary.uploadImageSingle)(
                                      combination.image
                                    );
                                  case 1:
                                    variantImage = _context5.v;
                                    sellingPrice =
                                      (_combination$price =
                                        combination.price) !== null &&
                                      _combination$price !== void 0
                                        ? _combination$price
                                        : input.price.regular;
                                    prices.push(sellingPrice);
                                    _context5.n = 2;
                                    return models.Variants.create({
                                      product_id: product._id,
                                      slug: variantSlug,
                                      image: variantImage,
                                      stock_quantity:
                                        (_combination$stock_qu =
                                          combination.stock_quantity) !==
                                          null &&
                                        _combination$stock_qu !== void 0
                                          ? _combination$stock_qu
                                          : 0,
                                      attributes: combination.attributes,
                                      weight: combination.weight,
                                      length: combination.length,
                                      width: combination.width,
                                      height: combination.height,
                                      sku: combination.sku,
                                      selling_price: sellingPrice,
                                    });
                                  case 2:
                                    return _context5.a(2, _context5.v);
                                }
                            }, _callee5);
                          })
                        );
                        return function (_x14) {
                          return _ref1.apply(this, arguments);
                        };
                      })()
                    )
                  );
                case 10:
                  variants = _context6.v;
                  stockQuantity = variants.reduce(function (total, v) {
                    return total + (v.stock_quantity || 0);
                  }, 0);
                  _context6.n = 11;
                  return product.updateOne({
                    variants: variants.map(function (v) {
                      return v._id;
                    }),
                    stock: stockQuantity,
                  });
                case 11:
                  if (!(prices.length > 0)) {
                    _context6.n = 12;
                    break;
                  }
                  min_price = Math.min.apply(Math, prices);
                  max_price = Math.max.apply(Math, prices);
                  _context6.n = 12;
                  return product.updateOne({
                    price: _objectSpread(
                      _objectSpread({}, input.price),
                      {},
                      {
                        min_price: min_price,
                        max_price: max_price,
                      }
                    ),
                  });
                case 12:
                  _context6.n = 13;
                  return _ProductAuditLogModel["default"].create({
                    product_id: product._id,
                    action_type: "product_create",
                    changes: Object.keys(product._doc).map(function (field) {
                      return {
                        field: field,
                        old_value: null,
                        new_value: product[field],
                      };
                    }),
                  });
                case 13:
                  return _context6.a(2, product);
              }
          }, _callee6);
        })
      );
      function createProduct(_x11, _x12, _x13) {
        return _createProduct.apply(this, arguments);
      }
      return createProduct;
    })(),
    updateProductStatus: (function () {
      var _updateProductStatus = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee7(_, _ref10, _ref11) {
          var productId, status, models, user, product, shop, oldStatus;
          return _regenerator().w(function (_context7) {
            while (1)
              switch (_context7.n) {
                case 0:
                  (productId = _ref10.productId), (status = _ref10.status);
                  (models = _ref11.models), (user = _ref11.user);
                  if (user) {
                    _context7.n = 1;
                    break;
                  }
                  throw new _graphql.GraphQLError("user not found", {
                    extensions: {
                      code: "USER_NOT_FOUND",
                    },
                  });
                case 1:
                  _context7.n = 2;
                  return models.Product.findById(productId);
                case 2:
                  product = _context7.v;
                  if (product) {
                    _context7.n = 3;
                    break;
                  }
                  throw new _graphql.GraphQLError("Product not found", {
                    extensions: {
                      code: "PRODUCT_NOT_FOUND",
                    },
                  });
                case 3:
                  _context7.n = 4;
                  return models.Shop.findById(product.shop_id);
                case 4:
                  shop = _context7.v;
                  if (
                    !(
                      !shop ||
                      (shop.owner.toString() !== user._id.toString() &&
                        user.role !== "admin")
                    )
                  ) {
                    _context7.n = 5;
                    break;
                  }
                  throw new Error("Not authorized to update this product");
                case 5:
                  oldStatus = product.status;
                  product.status = status;
                  product.updatedAt = new Date();
                  _context7.n = 6;
                  return _ProductAuditLogModel["default"].create({
                    product_id: product._id,
                    action_type: "product_status_update",
                    changes: [
                      {
                        field: "status",
                        old_value: oldStatus,
                        new_value: status,
                      },
                    ],
                  });
                case 6:
                  _context7.n = 7;
                  return product.save();
                case 7:
                  return _context7.a(2, product);
              }
          }, _callee7);
        })
      );
      function updateProductStatus(_x15, _x16, _x17) {
        return _updateProductStatus.apply(this, arguments);
      }
      return updateProductStatus;
    })(),
    // tách logic xử lý thông tin sản phẩm và biến thể ra riêng
    updateProduct: (function () {
      var _updateProduct = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee8(_, _ref12, _ref13) {
          var productId,
            input,
            models,
            user,
            shop,
            product,
            category,
            updates,
            changes,
            baseSlug,
            slug,
            count,
            uploadedImages,
            fieldsToUpdate;
          return _regenerator().w(function (_context8) {
            while (1)
              switch (_context8.n) {
                case 0:
                  (productId = _ref12.productId), (input = _ref12.input);
                  (models = _ref13.models),
                    (user = _ref13.user),
                    (shop = _ref13.shop);
                  if (!(!user || user.role !== "seller")) {
                    _context8.n = 1;
                    break;
                  }
                  throw new _graphql.GraphQLError("Unauthorized", {
                    extensions: {
                      code: "UNAUTHORIZED",
                    },
                  });
                case 1:
                  if (shop) {
                    _context8.n = 2;
                    break;
                  }
                  throw new _graphql.GraphQLError("Shop not found", {
                    extensions: {
                      code: "SHOP_NOT_FOUND",
                    },
                  });
                case 2:
                  _context8.n = 3;
                  return models.Product.findById(productId);
                case 3:
                  product = _context8.v;
                  if (product) {
                    _context8.n = 4;
                    break;
                  }
                  throw new _graphql.GraphQLError("Product not found", {
                    extensions: {
                      code: "PRODUCT_NOT_FOUND",
                    },
                  });
                case 4:
                  if (product.shop_id.equals(shop._id)) {
                    _context8.n = 5;
                    break;
                  }
                  throw new _graphql.GraphQLError(
                    "You do not have permission to update this product",
                    {
                      extensions: {
                        code: "FORBIDDEN",
                      },
                    }
                  );
                case 5:
                  if (!input.categoryId) {
                    _context8.n = 7;
                    break;
                  }
                  _context8.n = 6;
                  return models.Category.findById(input.categoryId);
                case 6:
                  category = _context8.v;
                  if (category) {
                    _context8.n = 7;
                    break;
                  }
                  throw new _graphql.GraphQLError("Category not found", {
                    extensions: {
                      code: "CATEGORY_NOT_FOUND",
                    },
                  });
                case 7:
                  updates = {};
                  changes = []; // 1. Nếu tên thay đổi → tạo slug mới
                  if (!(input.name && input.name !== product.name)) {
                    _context8.n = 11;
                    break;
                  }
                  baseSlug = (0, _slugify["default"])(input.name, {
                    lower: true,
                    strict: true,
                  });
                  slug = baseSlug;
                  count = 1;
                case 8:
                  _context8.n = 9;
                  return models.Product.exists({
                    slug: slug,
                    _id: {
                      $ne: product._id,
                    },
                  });
                case 9:
                  if (!_context8.v) {
                    _context8.n = 10;
                    break;
                  }
                  slug = "".concat(baseSlug, "-").concat(count++);
                  _context8.n = 8;
                  break;
                case 10:
                  updates.slug = slug;
                  changes.push({
                    field: "slug",
                    old_value: product.slug,
                    new_value: slug,
                  });
                case 11:
                  if (!(input.images && input.images.length > 0)) {
                    _context8.n = 13;
                    break;
                  }
                  _context8.n = 12;
                  return Promise.all(
                    input.images.map(function (file) {
                      return (0, _cloudinary.uploadImageSingle)(file);
                    })
                  );
                case 12:
                  uploadedImages = _context8.v;
                  updates.images = uploadedImages;
                  changes.push({
                    field: "images",
                    old_value: product.images,
                    new_value: uploadedImages,
                  });
                case 13:
                  // 3. So sánh và cập nhật các trường khác
                  fieldsToUpdate = [
                    "name",
                    "description",
                    "specifications",
                    "seo",
                    "categoryId",
                    "price",
                  ];
                  fieldsToUpdate.forEach(function (field) {
                    var dbField =
                      field === "categoryId" ? "category_id" : field;
                    if (
                      input[field] !== undefined &&
                      JSON.stringify(input[field]) !==
                        JSON.stringify(product[dbField])
                    ) {
                      updates[dbField] = input[field];
                      changes.push({
                        field: dbField,
                        old_value: product[dbField],
                        new_value: input[field],
                      });
                    }
                  });

                  // 4. Cập nhật
                  if (!(Object.keys(updates).length > 0)) {
                    _context8.n = 14;
                    break;
                  }
                  _context8.n = 14;
                  return models.Product.updateOne(
                    {
                      _id: productId,
                    },
                    {
                      $set: updates,
                    }
                  );
                case 14:
                  if (!(changes.length > 0)) {
                    _context8.n = 15;
                    break;
                  }
                  _context8.n = 15;
                  return models.ProductAuditLog.create({
                    product_id: product._id,
                    action_type: "product_update",
                    changes: changes,
                  });
                case 15:
                  _context8.n = 16;
                  return models.Product.findById(productId);
                case 16:
                  return _context8.a(2, _context8.v);
              }
          }, _callee8);
        })
      );
      function updateProduct(_x18, _x19, _x20) {
        return _updateProduct.apply(this, arguments);
      }
      return updateProduct;
    })(),
    updateVariant: (function () {
      var _updateVariant = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee9(_, _ref14, _ref15) {
          var _shop$_id;
          var variantId,
            input,
            models,
            user,
            shop,
            variant,
            product,
            updates,
            changes,
            fields,
            uploadedImage,
            updatedProduct,
            variants;
          return _regenerator().w(function (_context9) {
            while (1)
              switch (_context9.n) {
                case 0:
                  (variantId = _ref14.variantId), (input = _ref14.input);
                  (models = _ref15.models),
                    (user = _ref15.user),
                    (shop = _ref15.shop);
                  if (
                    !(
                      !user ||
                      (user.role !== "seller" && user.role !== "admin")
                    )
                  ) {
                    _context9.n = 1;
                    break;
                  }
                  throw new _graphql.GraphQLError("Unauthorized", {
                    extensions: {
                      code: "UNAUTHORIZED",
                    },
                  });
                case 1:
                  _context9.n = 2;
                  return models.Variants.findById(variantId);
                case 2:
                  variant = _context9.v;
                  if (variant) {
                    _context9.n = 3;
                    break;
                  }
                  throw new _graphql.GraphQLError("Variant not found", {
                    extensions: {
                      code: "VARIANT_NOT_FOUND",
                    },
                  });
                case 3:
                  _context9.n = 4;
                  return models.Product.findById(variant.product_id);
                case 4:
                  product = _context9.v;
                  if (product) {
                    _context9.n = 5;
                    break;
                  }
                  throw new _graphql.GraphQLError("Product not found", {
                    extensions: {
                      code: "PRODUCT_NOT_FOUND",
                    },
                  });
                case 5:
                  if (
                    !(
                      product.shop_id.toString() !==
                      ((_shop$_id = shop._id) === null || _shop$_id === void 0
                        ? void 0
                        : _shop$_id.toString())
                    )
                  ) {
                    _context9.n = 6;
                    break;
                  }
                  throw new _graphql.GraphQLError(
                    "You do not have permission to update this variant",
                    {
                      extensions: {
                        code: "FORBIDDEN",
                      },
                    }
                  );
                case 6:
                  updates = {};
                  changes = []; // Cập nhật các trường đơn giản
                  fields = [
                    "slug",
                    "selling_price",
                    "stock_quantity",
                    "weight",
                    "length",
                    "width",
                    "height",
                    "sku",
                  ];
                  fields.forEach(function (field) {
                    if (
                      input[field] !== undefined &&
                      input[field] !== variant[field]
                    ) {
                      updates[field] = input[field];
                      changes.push({
                        field: field,
                        old_value: variant[field],
                        new_value: input[field],
                      });
                    }
                  });

                  // Cập nhật attributes nếu có
                  if (input.attributes) {
                    updates.attributes = input.attributes;
                    changes.push({
                      field: "attributes",
                      old_value: variant.attributes,
                      new_value: input.attributes,
                    });
                  }
                  if (!input.image) {
                    _context9.n = 10;
                    break;
                  }
                  if (
                    !(
                      typeof input.image === "string" &&
                      input.image.startsWith("http")
                    )
                  ) {
                    _context9.n = 7;
                    break;
                  }
                  uploadedImage = input.image;
                  _context9.n = 9;
                  break;
                case 7:
                  _context9.n = 8;
                  return (0, _cloudinary.uploadImageSingle)(input.image);
                case 8:
                  uploadedImage = _context9.v;
                case 9:
                  updates.image = uploadedImage;
                  changes.push({
                    field: "image",
                    old_value: variant.image,
                    new_value: uploadedImage,
                  });
                case 10:
                  if (!(Object.keys(updates).length > 0)) {
                    _context9.n = 11;
                    break;
                  }
                  _context9.n = 11;
                  return models.Variants.updateOne(
                    {
                      _id: variantId,
                    },
                    {
                      $set: updates,
                    }
                  );
                case 11:
                  if (!(changes.length > 0)) {
                    _context9.n = 12;
                    break;
                  }
                  _context9.n = 12;
                  return models.ProductAuditLog.create({
                    product_id: product._id,
                    variant_id: variant._id,
                    action_type: "variant_update",
                    changes: changes,
                  });
                case 12:
                  _context9.n = 13;
                  return models.Product.findById(product._id).lean();
                case 13:
                  updatedProduct = _context9.v;
                  _context9.n = 14;
                  return models.Variants.find({
                    product_id: product._id,
                  }).lean();
                case 14:
                  variants = _context9.v;
                  updatedProduct.variants = variants;
                  updatedProduct.id = updatedProduct._id.toString();
                  return _context9.a(2, updatedProduct);
              }
          }, _callee9);
        })
      );
      function updateVariant(_x21, _x22, _x23) {
        return _updateVariant.apply(this, arguments);
      }
      return updateVariant;
    })(),
    deleteProduct: (function () {
      var _deleteProduct = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee0(_, _ref16, _ref17) {
          var _id, models, user, product, shop;
          return _regenerator().w(function (_context0) {
            while (1)
              switch (_context0.n) {
                case 0:
                  _id = _ref16._id;
                  (models = _ref17.models), (user = _ref17.user);
                  if (user) {
                    _context0.n = 1;
                    break;
                  }
                  throw new _graphql.GraphQLError("user not found", {
                    extensions: {
                      code: "USER_NOT_FOUND",
                    },
                  });
                case 1:
                  _context0.n = 2;
                  return models.Product.findById(_id);
                case 2:
                  product = _context0.v;
                  if (product) {
                    _context0.n = 3;
                    break;
                  }
                  throw new _graphql.GraphQLError("Product not found", {
                    extensions: {
                      code: "PRODUCT_NOT_FOUND",
                    },
                  });
                case 3:
                  _context0.n = 4;
                  return models.Shop.findById(product.shop_id);
                case 4:
                  shop = _context0.v;
                  if (
                    !(!shop || shop.owner.toString() !== user._id.toString())
                  ) {
                    _context0.n = 5;
                    break;
                  }
                  throw new Error("Not authorized to delete this product");
                case 5:
                  _context0.n = 6;
                  return _ProductAuditLogModel["default"].create({
                    product_id: product._id,
                    action_type: "product_delete",
                    changes: Object.keys(product._doc).map(function (field) {
                      return {
                        field: field,
                        old_value: product[field],
                        new_value: null,
                      };
                    }),
                  });
                case 6:
                  product.status = "deleted";
                  _context0.n = 7;
                  return product.save();
                case 7:
                  return _context0.a(2, product);
              }
          }, _callee0);
        })
      );
      function deleteProduct(_x24, _x25, _x26) {
        return _deleteProduct.apply(this, arguments);
      }
      return deleteProduct;
    })(),
  },
  Product: {
    rating: function rating(product, _, _ref18) {
      return _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee1() {
          var models, reviews, total;
          return _regenerator().w(function (_context1) {
            while (1)
              switch (_context1.n) {
                case 0:
                  models = _ref18.models;
                  _context1.n = 1;
                  return models.Review.find({
                    product: product.id,
                  });
                case 1:
                  reviews = _context1.v;
                  total = reviews.reduce(function (sum, r) {
                    return sum + r.rating;
                  }, 0);
                  return _context1.a(2, {
                    average: reviews.length > 0 ? total / reviews.length : 0,
                    count: reviews.length,
                  });
              }
          }, _callee1);
        })
      )();
    },
    price: function price(product) {
      var _product$price, _product$price2;
      var toFloat = function toFloat(val) {
        if (!val) return 0;
        if (_typeof(val) === "object" && "$numberDecimal" in val) {
          return parseFloat(val.$numberDecimal);
        }
        return parseFloat(val);
      };
      return {
        min_price: toFloat(
          (_product$price = product.price) === null || _product$price === void 0
            ? void 0
            : _product$price.min_price
        ),
        max_price: toFloat(
          (_product$price2 = product.price) === null ||
            _product$price2 === void 0
            ? void 0
            : _product$price2.max_price
        ),
      };
    },
  },
};
var _default = (exports["default"] = productResolvers);
