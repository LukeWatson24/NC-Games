const express = require("express");
const cors = require("cors");
const apiRouter = require("./routers/api-router");
const {
  pathNotFound,
  noResults,
  invalidDataTypePSQL,
  badRequestPSQL,
  keyAlreadyExists,
} = require("./error_handling/app.errors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);
app.all("/*", pathNotFound);
app.use(noResults);
app.use(invalidDataTypePSQL);
app.use(badRequestPSQL);
app.use(keyAlreadyExists);

module.exports = app;
