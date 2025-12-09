"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _firebaseAdmin = _interopRequireDefault(require("firebase-admin"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
try {
  var _process$env$FIREBASE;
  _firebaseAdmin["default"].initializeApp({
    credential: _firebaseAdmin["default"].credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (_process$env$FIREBASE = process.env.FIREBASE_PRIVATE_KEY) === null || _process$env$FIREBASE === void 0 ? void 0 : _process$env$FIREBASE.replace(/\\n/g, "\n")
    })
  });
  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
  process.exit(1);
}
var _default = exports["default"] = _firebaseAdmin["default"];