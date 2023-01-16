const express = require("express");
const {
  getCategories,
  getReviews,
  getReviewsById,
  getCommentsByReviewId,
} = require("./controllers/app.controllers");
const {
  pathNotFound,
  noResults,
  invalidDataTypePSQL,
} = require("./error_handling/app.errors");

const app = express();

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewsById);
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);

app.all("/*", pathNotFound);

app.use(noResults);
app.use(invalidDataTypePSQL);

module.exports = app;
