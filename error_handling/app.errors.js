const pathNotFound = (req, res, next) => {
  const path = req.originalUrl;
  res.status(404).send({ message: `path '${path}' does not exist` });
};

module.exports = { pathNotFound };
