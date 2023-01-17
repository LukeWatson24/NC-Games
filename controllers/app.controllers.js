const {
  fetchCategories,
  fetchReviews,
  fetchReviewsById,
  fetchCommentsByReviewId,
  addCommentToReview,
} = require("../models/app.models");

const getCategories = (req, res, next) => {
  return fetchCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviews = (req, res, next) => {
  const queryObj = ({ category, sort_by, order } = req.query);
  return fetchReviews(queryObj)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviewsById = (req, res, next) => {
  const { review_id } = req.params;
  return fetchReviewsById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

const getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  return fetchCommentsByReviewId(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

const postComment = (req, res, next) => {
  const { review_id } = req.params;
  return addCommentToReview(review_id, req.body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getCategories,
  getReviews,
  getReviewsById,
  getCommentsByReviewId,
  postComment,
};
