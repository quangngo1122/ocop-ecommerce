import "dotenv/config";
import { generateTestToken } from "../src/utils/generateToken.js";

async function main() {
  try {
    const idToken = await generateTestToken();
    console.log("\n=== Firebase ID Token ===");
    console.log("Copy this token into your Authorization header:");
    console.log(`Bearer ${idToken}`);
    console.log("\nExample for Apollo Sandbox Headers:");
    console.log(
      JSON.stringify({ Authorization: `Bearer ${idToken}` }, null, 2)
    );
  } catch (error) {
    console.error("Failed to generate token:", error);
    process.exit(1);
  }
}

main();
