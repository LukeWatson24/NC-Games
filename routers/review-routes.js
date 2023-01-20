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
const { verifyToken } = require("../utils/app.auth");

reviewsRouter.route("/").get(getReviews).post(verifyToken, postReview);
reviewsRouter
  .route("/:review_id")
  .get(getReviewsById)
  .patch(verifyToken, patchReviewVotes)
  .delete(verifyToken, deleteReview);
reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(verifyToken, postComment);

module.exports = reviewsRouter;
