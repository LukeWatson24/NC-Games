const pathNotFound = (req, res, next) => {
  const path = req.originalUrl;
  res.status(404).send({ message: `path not found` });
};

const noResults = (err, req, res, next) => {
  console.log(err);
  if (err.status === 404) {
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

module.exports = { pathNotFound, noResults, invalidDataTypePSQL };
