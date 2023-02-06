const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: `${__dirname}/../.env.jwt`,
});
const KEY = process.env.TOKEN_KEY;

verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (token === undefined) {
    return next({ status: 403, message: "login required" });
  }

  jwt.verify(token, KEY, (err, data) => {
    if (err) return next({ status: 401, message: "invalid token" });
    else {
      req.user = data;
      return next();
    }
  });
};

module.exports = { verifyToken };
