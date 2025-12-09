// const admin = require("../config/firebase-admin");
// const fetch = require("node-fetch");

import { admin } from "firebase-admin/app";
import fetch from "node-fetch";

async function generateTestToken() {
  try {
    // Create custom token for test seller
    const customToken = await admin.auth().createCustomToken("test-seller", {
      role: "seller",
      email: "camdaica20003@gmail.com",
    });

    console.log("Custom Token generated:", customToken);

    // Exchange custom token for ID token
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!data.idToken) {
      throw new Error("Failed to exchange custom token for ID token");
    }

    return data.idToken;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
}

module.exports = { generateTestToken };
