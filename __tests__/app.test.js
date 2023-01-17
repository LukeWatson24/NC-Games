const app = require("../app");
const request = require("supertest");
const testData = require("../db/data/test-data/index");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  if (db.end) db.end();
});

describe("general 404 errors", () => {
  test("returns 404 if endpoint does not exist with correct message", () => {
    return request(app)
      .get("/api/test")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("path not found");
      });
  });
});

describe("GET /api/categories", () => {
  it("should return 200 with an array of objects with correct keys", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        const { categories } = body;
        expect(categories.length).toBeGreaterThan(0);
        categories.forEach((category) => {
          expect(category).toHaveProperty("slug", expect.any(String));
          expect(category).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

describe("GET /api/reviews", () => {
  it("should return 200 with an array of objects with correct keys", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews.length).toBeGreaterThan(0);
        reviews.forEach((review) => {
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("category", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("votes", expect.any(Number));
          expect(review).toHaveProperty("designer", expect.any(String));
          expect(review).toHaveProperty("comment_count", expect.any(Number));
        });
      });
  });
  test("reviews are sorted by date in descending order", () => {
    return request(app)
      .get("/api/reviews")
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSorted({
          key: "created_at",
          descending: true,
        });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  it("should return 200 with an object containing the correct keys", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toHaveProperty("review_id", 2);
        expect(review).toHaveProperty("title", "Jenga");
        expect(review).toHaveProperty("designer", "Leslie Scott");
        expect(review).toHaveProperty("owner", "philippaclaire9");
        expect(review).toHaveProperty(
          "review_img_url",
          "https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700"
        );
        expect(review).toHaveProperty(
          "review_body",
          "Fiddly fun for all the family"
        );
        expect(review).toHaveProperty("category", "dexterity");
        expect(review).toHaveProperty("votes", 5);
        expect(review).toHaveProperty("created_at", "2021-01-18T10:01:41.251Z");
        expect(Date.parse(review.created_at)).toBe(1610964101251);
      });
  });
  it("should return 404 with correct message when a review matching the provided id is not found", () => {
    return request(app)
      .get("/api/reviews/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("id not found");
      });
  });
  it("should return 400 with correct message if data type for review_id is incorrect", () => {
    return request(app)
      .get("/api/reviews/test")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  it("should return 200 with an array of comments with correct keys", () => {
    return request(app)
      .get("/api/reviews/3/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBeGreaterThan(0);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("review_id", expect.any(Number));
        });
      });
  });
  test("comments are sorted by date in descending order", () => {
    return request(app)
      .get("/api/reviews/3/comments")
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSorted({ key: "created_at", descending: true });
      });
  });
  it("should return an empty array when passed a review id which has no comments", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  it("should return 404 with correct message when a review matching the provided id is not found", () => {
    return request(app)
      .get("/api/reviews/999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("id not found");
      });
  });
  it("should return 400 with correct message if data type for review_id is incorrect", () => {
    return request(app)
      .get("/api/reviews/test/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  it("should return 201 with the created comment object", () => {
    const newComment = {
      username: "mallionaire",
      body: "TEST COMMENT",
    };
    return request(app)
      .post("/api/reviews/4/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("comment_id", expect.any(Number));
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment).toHaveProperty("author", "mallionaire");
        expect(comment).toHaveProperty("body", "TEST COMMENT");
        expect(comment).toHaveProperty("review_id", 4);
      });
  });
  it("should add the comment to the database", () => {
    const newComment = {
      username: "mallionaire",
      body: "TEST COMMENT",
    };
    return request(app)
      .post("/api/reviews/4/comments")
      .send(newComment)
      .then(() => {
        return db.query("SELECT * FROM comments WHERE review_id = 4;");
      })
      .then(({ rows }) => {
        expect(rows.length).toBe(1);
        expect(rows[0].body).toBe("TEST COMMENT");
        expect(rows[0].author).toBe("mallionaire");
      });
  });
  it("should return 400 with correct message when a review matching the provided id is not found", () => {
    const newComment = {
      username: "mallionaire",
      body: "TEST COMMENT",
    };
    return request(app)
      .post("/api/reviews/999/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
  it("should return 400 with correct message if data type for review_id is incorrect", () => {
    const newComment = {
      username: "mallionaire",
      body: "TEST COMMENT",
    };
    return request(app)
      .post("/api/reviews/test/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
  it("should return 400 if the username does not exist", () => {
    const newComment = {
      username: "TEST USERNAME",
      body: "TEST COMMENT",
    };
    return request(app)
      .post("/api/reviews/4/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
  it("should return 400 if the request body has missing keys", () => {
    const newComment = {
      username: "mallionaire",
    };
    return request(app)
      .post("/api/reviews/4/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
});
describe("PATCH /api/reviews/:review_id", () => {
  it("should return 201 with the updated review object", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: 2 })
      .expect(201)
      .then(({ body }) => {
        const review = body.review;
        expect(review).toHaveProperty("review_id", 2);
        expect(review).toHaveProperty("title", "Jenga");
        expect(review).toHaveProperty("designer", "Leslie Scott");
        expect(review).toHaveProperty(
          "review_img_url",
          "https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700"
        );
        expect(review).toHaveProperty(
          "review_body",
          "Fiddly fun for all the family"
        );
        expect(review).toHaveProperty("category", "dexterity");
        expect(review).toHaveProperty("created_at", "2021-01-18T10:01:41.251Z");
        expect(review).toHaveProperty("votes", 7);
      });
  });
  it("should update the database", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: 2 })
      .then(() => {
        return db.query("SELECT * FROM reviews WHERE review_id = 2");
      })
      .then(({ rows }) => {
        expect(rows[0].votes).toBe(7);
      });
  });
  it("should ignore extra keys on the request body if present", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: 2, test_key: "TEST" })
      .expect(201);
  });
  it("should return 404 when attempting to update the votes on a review that does not exist", () => {
    return request(app)
      .patch("/api/reviews/999")
      .send({ inc_votes: 2 })
      .then(({ body }) => {
        expect(body.message).toBe("id not found");
      });
  });
  it("should return 400 when the data type for review_id is incorrect", () => {
    return request(app)
      .patch("/api/reviews/test")
      .send({ inc_votes: 2 })
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
  it("should return 400 when the data type for inc_votes is incorrect", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: "TEST" })
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
  it("should return 400 when inc_votes is missing", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({})
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
});
