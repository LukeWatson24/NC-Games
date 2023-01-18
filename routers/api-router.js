const { getEndpoints } = require("../controllers/app.controllers");
const categoriesRouter = require("./categories-router");
const commentsRouter = require("./comments-router");
const reviewsRouter = require("./review-routes");
const usersRouter = require("./users-router");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndpoints);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
