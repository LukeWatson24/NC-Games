const db = require("../db/connection");
const {
  formatReviewsQuery,
  formatAddReviewQuery,
} = require("../utils/app.utils");
const fs = require("fs/promises");
const path = require("path");

const fetchCategories = () => {
  return db.query(`SELECT * FROM categories;`).then(({ rows }) => {
    return rows;
  });
};

const fetchReviews = (queries) => {
  const { queryString, queryVals, totalCountStr } = formatReviewsQuery(queries);
  let categoryCheck;
  let totalCount;
  if (queryVals.length === 2) {
    categoryCheck = { rowCount: null };
    totalCount = db.query(totalCountStr);
  } else {
    categoryCheck = db.query("SELECT * FROM categories WHERE slug = $1;", [
      queryVals[0],
    ]);
    totalCount = db.query(totalCountStr, [queryVals[0]]);
  }

  return Promise.all([
    db.query(queryString, queryVals),
    categoryCheck,
    totalCount,
  ]).then(([{ rows }, { rowCount }, count]) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "category not found" });
    } else {
      const { total_count } = count.rows[0];
      return { reviews: rows, total_count };
    }
  });
};

const fetchReviewsById = (review_id) => {
  return db
    .query(
      `
    SELECT reviews.*, COUNT(comments.review_id)::INT AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;`,
      [review_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "id not found" });
      } else {
        return rows[0];
      }
    });
};

const fetchCommentsByReviewId = (review_id, { limit = 10, p = 1 }) => {
  const pageVal = (p - 1) * limit;
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
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3;
            `,
        [review_id, limit, pageVal]
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

const removeComment = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
      comment_id,
    ])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, message: "id not found" });
      }
    });
};

const fetchEndpoints = () => {
  return fs
    .readFile(path.resolve(__dirname, "../endpoints.json"), "utf-8")
    .then((endpoints) => {
      return JSON.parse(endpoints);
    });
};

const fetchUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "username not found" });
      } else {
        return rows[0];
      }
    });
};

const updateCommentVotes = (comment_id, inc_votes) => {
  return db
    .query(
      `
  UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;
  `,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "id not found" });
      }
      return rows[0];
    });
};

const addReview = (newReview) => {
  const { queryString, valsArr } = formatAddReviewQuery(newReview);
  return db.query(queryString, valsArr).then(({ rows }) => {
    const { review_id } = rows[0];
    return review_id;
  });
};

const addCategory = ({ slug, description }) => {
  return db
    .query(
      `
  INSERT INTO categories
  (slug, description)
  VALUES ($1, $2) RETURNING *;
  `,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
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
  removeComment,
  fetchEndpoints,
  fetchUserByUsername,
  updateCommentVotes,
  addReview,
  addCategory,
};
