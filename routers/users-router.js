const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
  postSignUpUser,
  postSignIn,
} = require("../controllers/app.controllers");

usersRouter.route("/").get(getUsers).post(postSignUpUser);
usersRouter.get("/:username", getUserByUsername);
usersRouter.post("/login", postSignIn);
module.exports = usersRouter;
