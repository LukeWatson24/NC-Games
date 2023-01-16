const express = require("express");
const { getCategories, getReviews } = require("./controllers/app.controllers");
const { pathNotFound } = require("./error_handling/app.errors");

const app = express();

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);

app.all("/*", pathNotFound);

module.exports = app;
