"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifySignature = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var verifySignature = exports.verifySignature = function verifySignature(req) {
  try {
    var _sortObjDataByKey = function sortObjDataByKey(data) {
      var sortedObj = {};
      Object.keys(data).sort().forEach(function (key) {
        if (_typeof(data[key]) === "object") {
          sortedObj[key] = _sortObjDataByKey(data[key]);
        } else {
          sortedObj[key] = data[key];
        }
      });
      return sortedObj;
    };
    var verifyWebhookSignature = function verifyWebhookSignature(headers, data, checksumKey) {
      var receivedSignature = headers["x-casso-signature"];
      var _ref = receivedSignature.match(/t=(\d+),v1=([a-f0-9]+)/) || [],
        _ref2 = _slicedToArray(_ref, 3),
        timestampStr = _ref2[1],
        signature = _ref2[2];
      var timestamp = parseInt(timestampStr, 10);
      var sortedDataByKey = _sortObjDataByKey(data);
      var messageToSign = timestamp + "." + JSON.stringify(sortedDataByKey);
      var generatedSignature = _crypto["default"].createHmac("sha512", checksumKey).update(messageToSign).digest("hex");
      return signature === generatedSignature;
    };
    var headers = req.headers;
    var webhookData = req.body;
    var checksumKey = process.env.CASSO_WEBHOOK_SECRET;
    var isValid = verifyWebhookSignature(headers, webhookData, checksumKey);
    console.log(isValid);
    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};