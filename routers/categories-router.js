const categoriesRouter = require("express").Router();
const {
  getCategories,
  postCategory,
} = require("../controllers/app.controllers");

categoriesRouter.route("/").get(getCategories).post(postCategory);

module.exports = categoriesRouter;
