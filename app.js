const express = require("express");
const {
  getCategories,
  getReviews,
  getReviewsById,
  getCommentsByReviewId,
  postComment,
  getUsers,
} = require("./controllers/app.controllers");
const {
  pathNotFound,
  noResults,
  invalidDataTypePSQL,
  badRequestPSQL,
} = require("./error_handling/app.errors");

const app = express();
app.use(express.json());

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewsById);
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.post("/api/reviews/:review_id/comments", postComment);
app.get("/api/users", getUsers);

app.all("/*", pathNotFound);

app.use(noResults);
app.use(invalidDataTypePSQL);
app.use(badRequestPSQL);

module.exports = app;
