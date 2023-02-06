const categoriesRouter = require("express").Router();
const {
  getCategories,
  postCategory,
} = require("../controllers/app.controllers");
const { verifyToken } = require("../utils/app.auth");

categoriesRouter.route("/").get(getCategories).post(verifyToken, postCategory);

module.exports = categoriesRouter;
