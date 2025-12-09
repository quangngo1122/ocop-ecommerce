"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _load = require("@graphql-tools/load");
var _graphqlFileLoader = require("@graphql-tools/graphql-file-loader");
var typeDefs = (0, _load.loadSchemaSync)("./**/*.graphql", {
  loaders: [new _graphqlFileLoader.GraphQLFileLoader()]
});
var _default = exports["default"] = typeDefs;