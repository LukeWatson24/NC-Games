const express = require("express");
const { getCategories } = require("./controllers/app.controllers");

const app = express();

app.get("/api/categories", getCategories);

module.exports = app;
