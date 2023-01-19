const reviewsRouter = require("express").Router();
const {
  getReviews,
  getReviewsById,
  getCommentsByReviewId,
  postComment,
  patchReviewVotes,
  postReview,
  deleteReview,
} = require("../controllers/app.controllers");

reviewsRouter.route("/").get(getReviews).post(postReview);
reviewsRouter
  .route("/:review_id")
  .get(getReviewsById)
  .patch(patchReviewVotes)
  .delete(deleteReview);
reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postComment);

module.exports = reviewsRouter;
