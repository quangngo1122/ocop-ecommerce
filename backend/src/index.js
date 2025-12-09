import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import cors from "cors";
import dotenv from "dotenv";
import { graphqlUploadExpress } from "graphql-upload-minimal";
// import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import admin from "./config/firebase-admin.js";
import connectDB from "./config/database.config.js";
import models from "./models/index.js";
import typeDefs from "./graphql/types/index.js";
import resolvers from "./graphql/resolvers/index.js";

import testGHNRoute from "./utils/testGHNrouter.js";

import { cassoWebhookHandler } from "./middlewares/cassoWebhook.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// [
//       "http://localhost:4000",
//       "http://localhost:5173",
//       "https://studio.apollographql.com",
//     ],

// Parse body payload
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

async function startApolloServer() {
  try {
    await connectDB();
    console.log("✅ Database connected");
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      csrfPrevention: false,
    });

    await server.start();

    // ✅ Middleware xử lý GraphQL
    app.use(
      "/graphql",
      graphqlUploadExpress({ maxFileSize: 20_000_000, maxFiles: 10 }),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const authMiddleware = (
            await import("./middlewares/auth.middleware.js")
          ).default;

          const { token, decodedToken } = await authMiddleware(req);
          let user = null;
          let shop = null;

          if (decodedToken?.uid) {
            user = await models.User.findOne({ firebaseUid: decodedToken.uid });
            if (user) {
              shop = await models.Shop.findOne({ owner: user._id });
            }
          }

          return {
            models,
            token,
            req,
            decodedToken,
            user,
            shop,
          };
        },
      })
    );

    // Add Casso webhook endpoint after Apollo Server setup
    app.post("/webhook/casso", cassoWebhookHandler);

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

startApolloServer();
