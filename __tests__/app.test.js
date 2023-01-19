const app = require("../app");
const request = require("supertest");
const testData = require("../db/data/test-data/index");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const endpoints = require("../endpoints.json");

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
  test("only returns reviews of a given category when queried by category", () => {
    return request(app)
      .get("/api/reviews?category=dexterity")
      .then(({ body }) => {
        const { reviews } = body;
        reviews.forEach((review) => {
          expect(review.category).toBe("dexterity");
        });
      });
  });
  it("should return 404 when no matching category is found", () => {
    return request(app)
      .get("/api/reviews?category=test")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toEqual("category not found");
      });
  });
  test("sorts by a given column name if the sort_by query is provided", () => {
    const validSoryBy = [
      "title",
      "designer",
      "owner",
      "review_img_url",
      "category",
      "comment_count",
      "votes",
    ];
    return Promise.all(
      validSoryBy.map((column) => {
        return request(app)
          .get(`/api/reviews?sort_by=${column}`)
          .expect(200)
          .then(({ body }) => {
            const { reviews } = body;
            expect(reviews).toBeSorted({ key: column, descending: true });
          });
      })
    );
  });
  test("orders results correctly when the order query is provided", () => {
    return request(app)
      .get("/api/reviews?sort_by=votes&order=ASC")
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSorted({ key: "votes", descending: false });
      });
  });

  it("should ignore invalid values for sort_by", () => {
    return request(app)
      .get("/api/reviews?sort_by=test")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSorted({ key: "created_at", descending: true });
      });
  });
  it("should ignore invalid values for order", () => {
    return request(app)
      .get("/api/reviews?order=test")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSorted({ key: "created_at", descending: true });
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
  test("the returned review should have a comment_count property", () => {
    return request(app)
      .get("/api/reviews/2")
      .then(({ body }) => {
        const { review } = body;
        expect(review).toHaveProperty("comment_count", 3);
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
  it("should return 200 with the updated review object", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: 2 })
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
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
  it("should return 404 when attempting to update the votes on a review that does not exist", () => {
    return request(app)
      .patch("/api/reviews/999")
      .expect(404)
      .send({ inc_votes: 2 })
      .then(({ body }) => {
        expect(body.message).toBe("id not found");
      });
  });
  it("should return 400 when the data type for review_id is incorrect", () => {
    return request(app)
      .patch("/api/reviews/test")
      .send({ inc_votes: 2 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
  it("should return 400 when the data type for inc_votes is incorrect", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: "TEST" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
  it("should return 400 when inc_votes is missing", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
});
describe("GET /api/users", () => {
  it("should return 200 with an array of users with correct keys", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  it("should return 204 with no content", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  it("should remove the comment from the database", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then(() => {
        return db.query("SELECT * FROM comments WHERE comment_id = 3;");
      })
      .then(({ rowCount }) => {
        expect(rowCount).toEqual(0);
      });
  });
  it("should return 404 if the provided comment id is not found", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("id not found");
      });
  });
  it("should return 400 if the data type for comment_id is incorrect", () => {
    return request(app)
      .delete("/api/comments/test")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
});
describe("GET /api", () => {
  it("should return the contents of the endpoints.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
});
describe("GET /api/users/:username", () => {
  it("should return 200 with the correct user object", () => {
    return request(app)
      .get("/api/users/philippaclaire9")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user.username).toBe("philippaclaire9");
        expect(user.name).toBe("philippa");
        expect(user.avatar_url).toBe(
          "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4"
        );
      });
  });
  it("should return 404 if the username is not found", () => {
    return request(app)
      .get("/api/users/test")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("username not found");
      });
  });
});
describe("PATCH /api/comments/:comment_id", () => {
  it("should return 200 with the updated comment object", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 2 })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("comment_id", 2);
        expect(comment).toHaveProperty("body", "My dog loved this game too!");
        expect(comment).toHaveProperty("author", "mallionaire");
        expect(comment).toHaveProperty("review_id", 3);
        expect(comment).toHaveProperty(
          "created_at",
          "2021-01-18T10:09:05.410Z"
        );
        expect(comment).toHaveProperty("votes", 15);
      });
  });
  it("should return 404 when attempting to update the votes on a comment that does not exist", () => {
    return request(app)
      .patch("/api/comments/999")
      .expect(404)
      .send({ inc_votes: 2 })
      .then(({ body }) => {
        expect(body.message).toBe("id not found");
      });
  });
  it("should return 400 when the data type for comment_id is incorrect", () => {
    return request(app)
      .patch("/api/comments/test")
      .send({ inc_votes: 2 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
  it("should return 400 when the data type for inc_votes is incorrect", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: "TEST" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("invalid data type");
      });
  });
  it("should return 400 when inc_votes is missing", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
});
