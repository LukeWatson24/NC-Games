const categoriesRouter = require("express").Router();
const { getCategories } = require("../controllers/app.controllers");

categoriesRouter.get("/", getCategories);

module.exports = categoriesRouter;
