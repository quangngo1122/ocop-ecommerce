import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ApolloClient, InMemoryCache, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const uploadLink = createUploadLink({
  uri: `${import.meta.env.VITE_GRAPHQL_HTTP_URL}/graphql`,
  // uri: "/api/graphql",
  headers: {
    "apollo-require-preflight": "true",
  },
});
const auth = getAuth();
const authLink = setContext(async (_, { headers }) => {
  let user = auth.currentUser;

  // Nếu chưa có user (chưa init hoặc chưa login), đợi nó
  if (!user) {
    user = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        unsubscribe();
        resolve(u);
      });
      // Có thể thêm timeout ở đây nếu muốn
      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 10000); // optional: 10s timeout
    });
  }

  if (!user) {
    // Vẫn chưa có user, trả về header trống (hoặc có thể throw lỗi tuỳ app bạn)
    return {
      headers: { ...headers },
    };
  }

  // Lấy token
  const accessToken = await user.getIdToken(true);

  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };
});

// WebSocket link cho subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL,
    connectionParams: async () => {
      const user = auth.currentUser;
      if (!user) return {};

      const token = await user.getIdToken();
      return {
        Authorization: `Bearer ${token}`,
      };
    },
  }),
);

// Split links based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(uploadLink),
);

// Tạo Apollo Client
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
