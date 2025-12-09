import "dotenv/config";
import { mongoose } from "mongoose";
import { User } from "../src/models/User.model.js";

async function removeUsernameField() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Xóa index username
    await mongoose.connection.collection("users").dropIndex("username_1");
    console.log("Dropped username index");

    // Xóa trường username khỏi tất cả documents
    await mongoose.connection
      .collection("users")
      .updateMany({}, { $unset: { username: "" } });
    console.log("Removed username field from all documents");

    console.log("Successfully cleaned up username field");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

removeUsernameField();
