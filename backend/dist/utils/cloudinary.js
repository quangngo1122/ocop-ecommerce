"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadVideoSingle = exports.uploadImageSingle = exports.uploadImageMultiple = exports.deleteImageSingle = exports.deleteImageMultiple = void 0;
var _cloudinaryConfig = _interopRequireDefault(require("../config/cloudinary.config.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var uploadImageSingle = exports.uploadImageSingle = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(file) {
    var _yield$file, createReadStream, stream, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return file;
        case 1:
          _yield$file = _context.v;
          createReadStream = _yield$file.createReadStream;
          stream = createReadStream();
          return _context.a(2, new Promise(function (resolve, reject) {
            var uploadStream = _cloudinaryConfig["default"].uploader.upload_stream({
              folder: "OCOP-ECOMMERCE"
            }, function (error, result) {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            });
            stream.pipe(uploadStream);
          }));
        case 2:
          _context.p = 2;
          _t = _context.v;
          console.error("Upload failed:", _t.message);
          throw new Error(_t.message);
        case 3:
          return _context.a(2);
      }
    }, _callee, null, [[0, 2]]);
  }));
  return function uploadImageSingle(_x) {
    return _ref.apply(this, arguments);
  };
}();
var uploadVideoSingle = exports.uploadVideoSingle = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(file) {
    var fileObj, createReadStream, stream, _t2, _t3;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          if (!(typeof file.then === "function")) {
            _context2.n = 2;
            break;
          }
          _context2.n = 1;
          return file;
        case 1:
          _t2 = _context2.v;
          _context2.n = 3;
          break;
        case 2:
          _t2 = file;
        case 3:
          fileObj = _t2;
          createReadStream = fileObj.createReadStream;
          stream = createReadStream();
          return _context2.a(2, new Promise(function (resolve, reject) {
            var uploadStream = _cloudinaryConfig["default"].uploader.upload_stream({
              folder: "videos",
              resource_type: "video",
              eager: [{
                format: "mp4",
                quality: "auto"
              }, {
                format: "jpg",
                quality: "auto"
              }],
              eager_async: true
            }, function (error, result) {
              if (error) {
                reject(error);
              } else {
                var duration = Math.round(result.duration);
                var thumbnailUrl = result.eager.find(function (t) {
                  return t.format === "jpg";
                }).secure_url;
                resolve({
                  url: result.secure_url,
                  duration: duration,
                  thumbnailUrl: thumbnailUrl
                });
              }
            });
            stream.pipe(uploadStream);
          }));
        case 4:
          _context2.p = 4;
          _t3 = _context2.v;
          throw new Error(_t3.message);
        case 5:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 4]]);
  }));
  return function uploadVideoSingle(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var uploadImageMultiple = exports.uploadImageMultiple = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(files) {
    var uploadedFiles, urls;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return Promise.all(files.map(/*#__PURE__*/function () {
            var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(file) {
              var _yield$file2, createReadStream, filename, mimetype, stream;
              return _regenerator().w(function (_context3) {
                while (1) switch (_context3.n) {
                  case 0:
                    _context3.n = 1;
                    return file;
                  case 1:
                    _yield$file2 = _context3.v;
                    createReadStream = _yield$file2.createReadStream;
                    filename = _yield$file2.filename;
                    mimetype = _yield$file2.mimetype;
                    // Upload từng file lên Cloudinary
                    stream = createReadStream();
                    return _context3.a(2, new Promise(function (resolve, reject) {
                      var cloudStream = _cloudinaryConfig["default"].uploader.upload_stream({
                        folder: "OCOP-ECOMMERCE"
                      },
                      // Folder tùy chỉnh
                      function (error, result) {
                        if (error) {
                          reject(error);
                        } else {
                          resolve({
                            url: result.secure_url
                          });
                        }
                      });
                      stream.pipe(cloudStream);
                    }));
                }
              }, _callee3);
            }));
            return function (_x4) {
              return _ref4.apply(this, arguments);
            };
          }()));
        case 1:
          uploadedFiles = _context4.v;
          urls = uploadedFiles.map(function (file) {
            return file.url;
          });
          return _context4.a(2, urls);
      }
    }, _callee4);
  }));
  return function uploadImageMultiple(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var deleteImageSingle = exports.deleteImageSingle = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(publicId) {
    var result, _t4;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          _context5.p = 0;
          _context5.n = 1;
          return _cloudinaryConfig["default"].uploader.destroy(publicId);
        case 1:
          result = _context5.v;
          return _context5.a(2, result);
        case 2:
          _context5.p = 2;
          _t4 = _context5.v;
          throw new Error(_t4.message);
        case 3:
          return _context5.a(2);
      }
    }, _callee5, null, [[0, 2]]);
  }));
  return function deleteImageSingle(_x5) {
    return _ref5.apply(this, arguments);
  };
}();
var deleteImageMultiple = exports.deleteImageMultiple = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(urls) {
    var publicIds, result, _t5;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          publicIds = urls.filter(function (url) {
            if (!url || !url.includes("cloudinary.com")) {
              console.log("Skipping invalid Cloudinary URL: ".concat(url));
              return false;
            }
            return true;
          }).map(function (url) {
            try {
              var arrUrl = url.split("/");
              if (arrUrl.length < 9) {
                console.log("Invalid Cloudinary URL format: ".concat(url));
                return null;
              }
              return "".concat(arrUrl[7], "/").concat(arrUrl[8].split(".")[0]);
            } catch (error) {
              console.log("Error processing URL: ".concat(url), error);
              return null;
            }
          }).filter(function (id) {
            return id !== null;
          });
          if (!(publicIds.length === 0)) {
            _context6.n = 1;
            break;
          }
          console.log("No valid Cloudinary URLs to delete");
          return _context6.a(2, {
            deleted: {}
          });
        case 1:
          _context6.p = 1;
          _context6.n = 2;
          return _cloudinaryConfig["default"].api.delete_resources(publicIds);
        case 2:
          result = _context6.v;
          console.log("Images deleted:", result);
          return _context6.a(2, result);
        case 3:
          _context6.p = 3;
          _t5 = _context6.v;
          console.error("Error deleting images:", _t5);
          throw _t5;
        case 4:
          return _context6.a(2);
      }
    }, _callee6, null, [[1, 3]]);
  }));
  return function deleteImageMultiple(_x6) {
    return _ref6.apply(this, arguments);
  };
}();