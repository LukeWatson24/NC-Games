const { fetchCategories } = require("../models/app.models");

const getCategories = (req, res, next) => {
  return fetchCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getCategories };
