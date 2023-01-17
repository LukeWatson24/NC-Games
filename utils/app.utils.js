exports.formatReviewsQuery = ({
  category,
  sort_by = "created_at",
  order = "desc",
}) => {
  const allowedSort_by = [
    "title",
    "designer",
    "owner",
    "review_img_url",
    "category",
    "comment_count",
    "votes",
  ];
  const allowedOrder = ["asc", "desc"];
  const categoryQuery = [];
  let queryString = `SELECT
    owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comments.review_id)::INT AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id`;

  if (category !== undefined) {
    categoryQuery.push(category);
    queryString += " WHERE category = $1";
  }

  queryString += " GROUP BY reviews.review_id";

  if (allowedSort_by.includes(sort_by.toLowerCase())) {
    if (sort_by === "comment_count") {
      queryString += ` ORDER BY ${sort_by}`;
    } else {
      queryString += ` ORDER BY reviews.${sort_by}`;
    }
  } else {
    queryString += ` ORDER BY reviews.created_at`;
  }

  if (allowedOrder.includes(order.toLowerCase())) {
    queryString += ` ${order};`;
  } else {
    queryString += " desc;";
  }

  return { queryString, categoryQuery };
};
