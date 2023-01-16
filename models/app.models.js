const db = require("../db/connection");

const fetchCategories = () => {
  return db.query(`SELECT * FROM categories;`).then(({ rows }) => {
    return rows;
  });
};

const fetchReviews = () => {
  return db
    .query(
      `
      SELECT
      owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comments.review_id)::INT AS comment_count
      FROM reviews
      LEFT JOIN comments ON comments.review_id = reviews.review_id
      GROUP BY reviews.review_id
      ORDER BY reviews.created_at DESC;
      `
    )
    .then(({ rows }) => {
      return rows;
    });
};

const fetchReviewsById = (review_id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1`, [review_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "not found" });
      } else {
        return rows[0];
      }
    });
};

module.exports = { fetchCategories, fetchReviews, fetchReviewsById };
