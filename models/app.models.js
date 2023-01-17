const db = require("../db/connection");
const { formatReviewsQuery } = require("../utils/app.utils");

const fetchCategories = () => {
  return db.query(`SELECT * FROM categories;`).then(({ rows }) => {
    return rows;
  });
};

const fetchReviews = (queries) => {
  const { queryString, categoryQuery } = formatReviewsQuery(queries);
  return db.query(queryString, categoryQuery).then(({ rows }) => {
    return rows;
  });
};

const fetchReviewsById = (review_id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1;`, [review_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "id not found" });
      } else {
        return rows[0];
      }
    });
};

const fetchCommentsByReviewId = (review_id) => {
  return db
    .query("SELECT * FROM reviews WHERE review_id = $1;", [review_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "id not found" });
      } else return;
    })
    .then(() => {
      return db.query(
        `
            SELECT * FROM comments WHERE review_id = $1
            ORDER BY created_at DESC;
            `,
        [review_id]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

const addCommentToReview = (review_id, { username, body }) => {
  return db
    .query(
      `
      INSERT INTO comments
      (review_id, author, body)
      VALUES ($1, $2, $3) RETURNING *;
      `,
      [review_id, username, body]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

const updateReviewVotes = (review_id, inc_votes) => {
  return db
    .query(
      `
    UPDATE reviews
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *;
    `,
      [inc_votes, review_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

const fetchUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReviewsById,
  fetchCommentsByReviewId,
  addCommentToReview,
  updateReviewVotes,
  fetchUsers,
};
