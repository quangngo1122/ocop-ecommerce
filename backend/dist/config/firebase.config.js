"use strict";

var _app = require("firebase-admin/app");
var _serviceAccountKey = require("./serviceAccountKey.js");
var initializeFirebase = function initializeFirebase() {
  try {
    if (!_app.admin.apps.length) {
      _app.admin.initializeApp({
        credential: _app.admin.credential.cert(_serviceAccountKey.serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || _serviceAccountKey.serviceAccount.project_id
      });
      console.log("Firebase Admin initialized successfully");
    }
    return _app.admin;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new Error("Firebase initialization failed: ".concat(error.message));
  }
};
module.exports = initializeFirebase();