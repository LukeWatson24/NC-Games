const express = require("express");
const { getCategories } = require("./controllers/app.controllers");
const { pathNotFound } = require("./error_handling/app.errors");

const app = express();

app.get("/api/categories", getCategories);

app.all("/*", pathNotFound);

module.exports = app;
