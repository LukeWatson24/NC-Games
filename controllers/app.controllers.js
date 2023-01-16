const { fetchCategories, fetchReviews } = require("../models/app.models");

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
  return fetchReviews()
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getCategories, getReviews };
