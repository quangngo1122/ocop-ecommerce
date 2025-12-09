"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;
var _graphql = require("graphql");
function _createForOfIteratorHelper(r, e) {
  var t =
    ("undefined" != typeof Symbol && r[Symbol.iterator]) || r["@@iterator"];
  if (!t) {
    if (
      Array.isArray(r) ||
      (t = _unsupportedIterableToArray(r)) ||
      (e && r && "number" == typeof r.length)
    ) {
      t && (r = t);
      var _n = 0,
        F = function F() {};
      return {
        s: F,
        n: function n() {
          return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] };
        },
        e: function e(r) {
          throw r;
        },
        f: F,
      };
    }
    throw new TypeError(
      "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function s() {
      t = t.call(r);
    },
    n: function n() {
      var r = t.next();
      return (a = r.done), r;
    },
    e: function e(r) {
      (u = !0), (o = r);
    },
    f: function f() {
      try {
        a || null == t["return"] || t["return"]();
      } finally {
        if (u) throw o;
      }
    },
  };
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
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
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
var inventoryResolvers = {
  Mutation: {
    // Nhập kho cho biến thể (variant)
    importInventory: (function () {
      var _importInventory = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee(_, _ref, _ref2) {
          var _totalStock$;
          var input,
            models,
            user,
            productId,
            variantId,
            quantity,
            importPrice,
            importDate,
            note,
            variant,
            totalStock;
          return _regenerator().w(function (_context) {
            while (1)
              switch (_context.n) {
                case 0:
                  input = _ref.input;
                  (models = _ref2.models), (user = _ref2.user);
                  if (user) {
                    _context.n = 1;
                    break;
                  }
                  throw new _graphql.GraphQLError("Bạn cần đăng nhập", {
                    extensions: {
                      code: "UNAUTHENTICATED",
                    },
                  });
                case 1:
                  (productId = input.productId),
                    (variantId = input.variantId),
                    (quantity = input.quantity),
                    (importPrice = input.importPrice),
                    (importDate = input.importDate),
                    (note = input.note);
                  if (!(!productId || !variantId || !quantity)) {
                    _context.n = 2;
                    break;
                  }
                  throw new _graphql.GraphQLError("Thiếu thông tin bắt buộc", {
                    extensions: {
                      code: "BAD_USER_INPUT",
                    },
                  });
                case 2:
                  _context.n = 3;
                  return models.Variants.findById(variantId);
                case 3:
                  variant = _context.v;
                  if (variant) {
                    _context.n = 4;
                    break;
                  }
                  throw new _graphql.GraphQLError("Không tìm thấy biến thể", {
                    extensions: {
                      code: "NOT_FOUND",
                    },
                  });
                case 4:
                  if (!(String(variant.product_id) !== String(productId))) {
                    _context.n = 5;
                    break;
                  }
                  throw new _graphql.GraphQLError(
                    "Biến thể không thuộc sản phẩm này",
                    {
                      extensions: {
                        code: "BAD_USER_INPUT",
                      },
                    }
                  );
                case 5:
                  _context.n = 6;
                  return models.InventoryBatches.create({
                    product_id: productId,
                    variant_id: variantId,
                    quantity: quantity,
                    remaining_quantity: quantity,
                    import_price: importPrice || 0,
                    import_date: importDate ? new Date(importDate) : new Date(),
                    note: note || "",
                  });
                case 6:
                  // Tăng tồn kho variant
                  variant.stock_quantity += quantity;
                  _context.n = 7;
                  return variant.save();
                case 7:
                  _context.n = 8;
                  return models.Variants.aggregate([
                    {
                      $match: {
                        product_id: variant.product_id,
                      },
                    },
                    {
                      $group: {
                        _id: null,
                        total: {
                          $sum: "$stock_quantity",
                        },
                      },
                    },
                  ]);
                case 8:
                  totalStock = _context.v;
                  _context.n = 9;
                  return models.Product.findByIdAndUpdate(productId, {
                    stock:
                      ((_totalStock$ = totalStock[0]) === null ||
                      _totalStock$ === void 0
                        ? void 0
                        : _totalStock$.total) || 0,
                  });
                case 9:
                  if (!models.InventoryTransaction) {
                    _context.n = 10;
                    break;
                  }
                  _context.n = 10;
                  return models.InventoryTransaction.create({
                    product_id: productId,
                    variant_id: variantId,
                    type: "import",
                    quantity: quantity,
                    price: importPrice || 0,
                    date: importDate ? new Date(importDate) : new Date(),
                    note: note || "",
                    user_id: user._id,
                  });
                case 10:
                  return _context.a(2, {
                    success: true,
                  });
              }
          }, _callee);
        })
      );
      function importInventory(_x, _x2, _x3) {
        return _importInventory.apply(this, arguments);
      }
      return importInventory;
    })(),
    // Xuất kho cho biến thể (variant) - FIFO
    exportInventory: (function () {
      var _exportInventory = _asyncToGenerator(
        /*#__PURE__*/ _regenerator().m(function _callee2(_, _ref3, _ref4) {
          var _totalStock$2;
          var input,
            models,
            user,
            productId,
            variantId,
            quantity,
            exportDate,
            note,
            qtyToExport,
            batches,
            _iterator,
            _step,
            batch,
            take,
            variant,
            totalStock,
            _t;
          return _regenerator().w(
            function (_context2) {
              while (1)
                switch ((_context2.p = _context2.n)) {
                  case 0:
                    input = _ref3.input;
                    (models = _ref4.models), (user = _ref4.user);
                    if (user) {
                      _context2.n = 1;
                      break;
                    }
                    throw new _graphql.GraphQLError("Bạn cần đăng nhập", {
                      extensions: {
                        code: "UNAUTHENTICATED",
                      },
                    });
                  case 1:
                    (productId = input.productId),
                      (variantId = input.variantId),
                      (quantity = input.quantity),
                      (exportDate = input.exportDate),
                      (note = input.note);
                    if (!(!productId || !variantId || !quantity)) {
                      _context2.n = 2;
                      break;
                    }
                    throw new _graphql.GraphQLError(
                      "Thiếu thông tin bắt buộc",
                      {
                        extensions: {
                          code: "BAD_USER_INPUT",
                        },
                      }
                    );
                  case 2:
                    qtyToExport = quantity;
                    _context2.n = 3;
                    return models.InventoryBatches.find({
                      product_id: productId,
                      variant_id: variantId,
                      remaining_quantity: {
                        $gt: 0,
                      },
                    }).sort({
                      import_date: 1,
                    });
                  case 3:
                    batches = _context2.v;
                    _iterator = _createForOfIteratorHelper(batches);
                    _context2.p = 4;
                    _iterator.s();
                  case 5:
                    if ((_step = _iterator.n()).done) {
                      _context2.n = 9;
                      break;
                    }
                    batch = _step.value;
                    if (!(qtyToExport <= 0)) {
                      _context2.n = 6;
                      break;
                    }
                    return _context2.a(3, 9);
                  case 6:
                    take = Math.min(batch.remaining_quantity, qtyToExport);
                    batch.remaining_quantity -= take;
                    _context2.n = 7;
                    return batch.save();
                  case 7:
                    qtyToExport -= take;
                    // Ghi log xuất kho từng batch nếu có model InventoryTransaction
                    if (!models.InventoryTransaction) {
                      _context2.n = 8;
                      break;
                    }
                    _context2.n = 8;
                    return models.InventoryTransaction.create({
                      product_id: productId,
                      variant_id: variantId,
                      batch_id: batch._id,
                      type: "export",
                      quantity: take,
                      price: batch.import_price || 0,
                      date: exportDate ? new Date(exportDate) : new Date(),
                      note: note || "",
                      user_id: user._id,
                    });
                  case 8:
                    _context2.n = 5;
                    break;
                  case 9:
                    _context2.n = 11;
                    break;
                  case 10:
                    _context2.p = 10;
                    _t = _context2.v;
                    _iterator.e(_t);
                  case 11:
                    _context2.p = 11;
                    _iterator.f();
                    return _context2.f(11);
                  case 12:
                    if (!(qtyToExport > 0)) {
                      _context2.n = 13;
                      break;
                    }
                    throw new _graphql.GraphQLError(
                      "Không đủ tồn kho để xuất",
                      {
                        extensions: {
                          code: "BAD_USER_INPUT",
                        },
                      }
                    );
                  case 13:
                    _context2.n = 14;
                    return models.Variants.findById(variantId);
                  case 14:
                    variant = _context2.v;
                    variant.stock_quantity -= quantity;
                    if (variant.stock_quantity < 0) variant.stock_quantity = 0;
                    _context2.n = 15;
                    return variant.save();
                  case 15:
                    _context2.n = 16;
                    return models.Variants.aggregate([
                      {
                        $match: {
                          product_id: variant.product_id,
                        },
                      },
                      {
                        $group: {
                          _id: null,
                          total: {
                            $sum: "$stock_quantity",
                          },
                        },
                      },
                    ]);
                  case 16:
                    totalStock = _context2.v;
                    _context2.n = 17;
                    return models.Product.findByIdAndUpdate(productId, {
                      stock:
                        ((_totalStock$2 = totalStock[0]) === null ||
                        _totalStock$2 === void 0
                          ? void 0
                          : _totalStock$2.total) || 0,
                    });
                  case 17:
                    return _context2.a(2, {
                      success: true,
                    });
                }
            },
            _callee2,
            null,
            [[4, 10, 11, 12]]
          );
        })
      );
      function exportInventory(_x4, _x5, _x6) {
        return _exportInventory.apply(this, arguments);
      }
      return exportInventory;
    })(),
  },
};
var _default = (exports["default"] = inventoryResolvers);
