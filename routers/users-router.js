const usersRouter = require("express").Router();
const { getUsers } = require("../controllers/app.controllers");

usersRouter.get("/", getUsers);

module.exports = usersRouter;
