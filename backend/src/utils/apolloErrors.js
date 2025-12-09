import { GraphQLError } from "graphql";

export class AuthenticationError extends GraphQLError {
  constructor(message = "Authentication required") {
    super(message, {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = "You are not authorized") {
    super(message, {
      extensions: {
        code: "FORBIDDEN",
      },
    });
  }
}

export class UserInputError extends GraphQLError {
  constructor(message = "Invalid user input") {
    super(message, {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }
}
