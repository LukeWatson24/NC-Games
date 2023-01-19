const {
  fetchCategories,
  fetchReviews,
  fetchReviewsById,
  fetchCommentsByReviewId,
  addCommentToReview,
  updateReviewVotes,
  fetchUsers,
  removeComment,
  fetchEndpoints,
  fetchUserByUsername,
  updateCommentVotes,
  addReview,
} = require("../models/app.models");

const getCategories = (req, res, next) => {
  fetchCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviews = (req, res, next) => {
  const queryObj = ({ category, sort_by, order } = req.query);
  fetchReviews(queryObj)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviewsById = (req, res, next) => {
  const { review_id } = req.params;
  fetchReviewsById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

const getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  fetchCommentsByReviewId(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

const postComment = (req, res, next) => {
  const { review_id } = req.params;
  addCommentToReview(review_id, req.body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

const patchReviewVotes = (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;
  Promise.all([
    updateReviewVotes(review_id, inc_votes),
    fetchReviewsById(review_id),
  ])
    .then(([review]) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

const getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
};

const getEndpoints = (req, res, next) => {
  fetchEndpoints()
    .then((endpoints) => {
      res.status(200).send(endpoints);
    })
    .catch((err) => {
      next(err);
    });
};

const getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

const patchCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  updateCommentVotes(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

const postReview = (req, res, next) => {
  const reviewObj = ({
    owner,
    title,
    review_body,
    designer,
    category,
    review_img_url,
  } = req.body);
  addReview(reviewObj)
    .then((review_id) => {
      return fetchReviewsById(review_id);
    })
    .then((review) => {
      res.status(201).send({ review });
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
  patchReviewVotes,
  getUsers,
  deleteComment,
  getEndpoints,
  getUserByUsername,
  patchCommentVotes,
  postReview,
};
