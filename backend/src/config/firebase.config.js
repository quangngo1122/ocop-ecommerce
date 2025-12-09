import { admin } from "firebase-admin/app";
import { serviceAccount } from "./serviceAccountKey.js";

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      });
      console.log("Firebase Admin initialized successfully");
    }
    return admin;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
};

module.exports = initializeFirebase();
