"use strict";

var _express = _interopRequireDefault(require("express"));
var _express2 = require("@apollo/server/express4");
var _server = require("@apollo/server");
var _cors = _interopRequireDefault(require("cors"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _graphqlUploadMinimal = require("graphql-upload-minimal");
var _firebaseAdmin = _interopRequireDefault(require("./config/firebase-admin.js"));
var _databaseConfig = _interopRequireDefault(require("./config/database.config.js"));
var _index = _interopRequireDefault(require("./models/index.js"));
var _index2 = _interopRequireDefault(require("./graphql/types/index.js"));
var _index3 = _interopRequireDefault(require("./graphql/resolvers/index.js"));
var _cassoWebhook = require("./middlewares/cassoWebhook.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t2 in e) "default" !== _t2 && {}.hasOwnProperty.call(e, _t2) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t2)) && (i.get || i.set) ? o(f, _t2, i) : f[_t2] = e[_t2]); return f; })(e, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
var app = (0, _express["default"])();

// CORS
app.use((0, _cors["default"])({
  origin: "*",
  credentials: true
}));

// [
//       "http://localhost:4000",
//       "http://localhost:5173",
//       "https://studio.apollographql.com",
//     ],

// Parse body payload
app.use(_express["default"].json({
  limit: "20mb"
}));
app.use(_express["default"].urlencoded({
  limit: "20mb",
  extended: true
}));
function startApolloServer() {
  return _startApolloServer.apply(this, arguments);
}
function _startApolloServer() {
  _startApolloServer = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var server, PORT, _t;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          _context3.p = 0;
          _context3.n = 1;
          return (0, _databaseConfig["default"])();
        case 1:
          console.log("✅ Database connected");
          server = new _server.ApolloServer({
            typeDefs: _index2["default"],
            resolvers: _index3["default"],
            introspection: true,
            csrfPrevention: false
          });
          _context3.n = 2;
          return server.start();
        case 2:
          // ✅ Middleware xử lý GraphQL
          app.use("/graphql", (0, _graphqlUploadMinimal.graphqlUploadExpress)({
            maxFileSize: 20000000,
            maxFiles: 10
          }), (0, _express2.expressMiddleware)(server, {
            context: function () {
              var _context = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_ref) {
                var req, authMiddleware, _yield$authMiddleware, token, decodedToken, user, shop;
                return _regenerator().w(function (_context2) {
                  while (1) switch (_context2.n) {
                    case 0:
                      req = _ref.req;
                      _context2.n = 1;
                      return Promise.resolve().then(function () {
                        return _interopRequireWildcard(require("./middlewares/auth.middleware.js"));
                      });
                    case 1:
                      authMiddleware = _context2.v["default"];
                      _context2.n = 2;
                      return authMiddleware(req);
                    case 2:
                      _yield$authMiddleware = _context2.v;
                      token = _yield$authMiddleware.token;
                      decodedToken = _yield$authMiddleware.decodedToken;
                      user = null;
                      shop = null;
                      if (!(decodedToken !== null && decodedToken !== void 0 && decodedToken.uid)) {
                        _context2.n = 5;
                        break;
                      }
                      _context2.n = 3;
                      return _index["default"].User.findOne({
                        firebaseUid: decodedToken.uid
                      });
                    case 3:
                      user = _context2.v;
                      if (!user) {
                        _context2.n = 5;
                        break;
                      }
                      _context2.n = 4;
                      return _index["default"].Shop.findOne({
                        owner: user._id
                      });
                    case 4:
                      shop = _context2.v;
                    case 5:
                      return _context2.a(2, {
                        models: _index["default"],
                        token: token,
                        req: req,
                        decodedToken: decodedToken,
                        user: user,
                        shop: shop
                      });
                  }
                }, _callee);
              }));
              function context(_x) {
                return _context.apply(this, arguments);
              }
              return context;
            }()
          }));

          // Add Casso webhook endpoint after Apollo Server setup
          app.post("/webhook/casso", _cassoWebhook.cassoWebhookHandler);
          PORT = process.env.PORT || 4000;
          app.listen(PORT, function () {
            console.log("\uD83D\uDE80 Server ready at http://localhost:".concat(PORT, "/graphql"));
          });
          _context3.n = 4;
          break;
        case 3:
          _context3.p = 3;
          _t = _context3.v;
          console.error("❌ Error starting server:", _t);
          process.exit(1);
        case 4:
          return _context3.a(2);
      }
    }, _callee2, null, [[0, 3]]);
  }));
  return _startApolloServer.apply(this, arguments);
}
startApolloServer();