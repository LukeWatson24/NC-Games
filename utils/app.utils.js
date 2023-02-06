exports.formatReviewsQuery = ({
  category,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1,
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
  const queryShift = ["$1", "$2", "$3"];
  const pageVal = (p - 1) * limit;
  const queryVals = [];
  let queryString = `SELECT
    owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comments.review_id)::INT AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id`;
  let totalCountStr =
    "SELECT COUNT(review_id)::INT as total_count FROM reviews";

  if (category !== undefined) {
    queryVals.push(category);
    queryString += ` WHERE category = ${queryShift.shift()}`;
    totalCountStr += ` WHERE category = $1;`;
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
    queryString += ` ${order}`;
  } else {
    queryString += " desc";
  }

  queryString += ` LIMIT ${queryShift.shift()} OFFSET ${queryShift.shift()};`;
  queryVals.push(limit);
  queryVals.push(pageVal);

  return { queryString, queryVals, totalCountStr };
};

exports.formatAddReviewQuery = ({
  owner,
  title,
  review_body,
  designer,
  category,
  review_img_url,
}) => {
  const valsArr = [
    owner,
    title,
    review_body,
    designer,
    category,
    review_img_url,
  ];
  if (review_img_url === undefined) {
    const queryString = `
      INSERT INTO reviews
      (owner, title, review_body, designer, category)
      VALUES ($1, $2, $3, $4, $5) RETURNING review_id;`;

    return { queryString, valsArr: valsArr.slice(0, valsArr.length - 1) };
  } else {
    const queryString = `
    INSERT INTO reviews
    (owner, title, review_body, designer, category, review_img_url)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING review_id`;

    return { queryString, valsArr };
  }
};

exports.rowCountCheck = (count, returnVal, message, status = 404) => {
  if (count === 0) {
    return Promise.reject({ status, message });
  } else {
    return returnVal;
  }
};
