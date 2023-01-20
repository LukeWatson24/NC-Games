const commentsRouter = require("express").Router();
const {
  deleteComment,
  patchCommentVotes,
} = require("../controllers/app.controllers");
const { verifyToken } = require("../utils/app.auth");

commentsRouter
  .route("/:comment_id")
  .delete(verifyToken, deleteComment)
  .patch(verifyToken, patchCommentVotes);

module.exports = commentsRouter;
