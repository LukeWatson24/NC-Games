const pathNotFound = (req, res, next) => {
  res.status(404).send({ message: `path not found` });
};

const noResults = (err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
};

const invalidDataTypePSQL = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "invalid data type" });
  } else {
    next(err);
  }
};

const badRequestPSQL = (err, req, res, next) => {
  if (err.code === "23503" || err.code === "23502") {
    res.status(400).send({ message: "bad request" });
  } else {
    next(err);
  }
};

const keyAlreadyExists = (err, req, res, next) => {
  if (err.code === "23505") {
    res.status(400).send({ message: "key already exists" });
  } else {
    next(err);
  }
};

module.exports = {
  pathNotFound,
  noResults,
  invalidDataTypePSQL,
  badRequestPSQL,
  keyAlreadyExists,
};
