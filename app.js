const express = require("express");
const apiRouter = require("./routers/api-router");
const {
  pathNotFound,
  noResults,
  invalidDataTypePSQL,
  badRequestPSQL,
} = require("./error_handling/app.errors");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);
app.all("/*", pathNotFound);
app.use(noResults);
app.use(invalidDataTypePSQL);
app.use(badRequestPSQL);

module.exports = app;
