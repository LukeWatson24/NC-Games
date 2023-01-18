const reviewsRouter = require("express").Router();
const {
  getReviews,
  getReviewsById,
  getCommentsByReviewId,
  postComment,
  patchReviewVotes,
} = require("../controllers/app.controllers");

reviewsRouter.get("/", getReviews);
reviewsRouter.route("/:review_id").get(getReviewsById).patch(patchReviewVotes);
reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postComment);

module.exports = reviewsRouter;
