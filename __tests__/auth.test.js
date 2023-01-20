const app = require("../app");
const request = require("supertest");
const testData = require("../db/data/test-data/index");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: `${__dirname}/../.env.jwt`,
});
const KEY = process.env.TOKEN_KEY;

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  if (db.end) db.end();
});

describe("POST /api/users", () => {
  it("should return 201 with the created user object excluding the password hash", () => {
    const newUser = {
      username: "testUsername",
      name: "testName",
      password: "password",
      avatar_url: "testUrl",
    };
    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toHaveProperty("username", "testUsername");
        expect(user).toHaveProperty("name", "testName");
        expect(user).toHaveProperty("avatar_url", "testUrl");
        expect(user).not.toHaveProperty("password_hash");
      });
  });
  it("should return 400 if request body is missing a required key", () => {
    const newUser = {
      username: "testUsername",
      name: "testName",
      avatar_url: "testUrl",
    };
    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("bad request");
      });
  });
  it("should return 400 if the username already exists", () => {
    const newUser = {
      username: "mallionaire",
      name: "testName",
      password: "password",
      avatar_url: "testUrl",
    };
    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("key already exists");
      });
  });
});
describe("POST /api/users/login", () => {
  it("should return 200 with a valid JSON web token containing the user data", () => {
    const user = { username: "mallionaire", password: "mallionaire" };
    return request(app)
      .post("/api/users/login")
      .send(user)
      .expect(200)
      .then(({ body }) => {
        const { token } = body;
        return jwt.verify(token, KEY);
      })
      .then((decoded) => {
        expect(decoded).toHaveProperty("username", "mallionaire");
        expect(decoded).toHaveProperty("name", "haz");
        expect(decoded).toHaveProperty("avatar_url", expect.any(String));
        expect(decoded).toHaveProperty("exp", expect.any(Number));
        expect(decoded).toHaveProperty("accessLevel", expect.any(String));
        expect(decoded).not.toHaveProperty("password_hash");
      });
  });
  it("should return 401 if the username is not found in the database", () => {
    const user = { username: "fakeUser", password: "mallionaire" };
    return request(app)
      .post("/api/users/login")
      .send(user)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe("username or password is incorrect");
      });
  });
  it("should return 401 if the password is incorrect", () => {
    const user = { username: "fakeUser", password: "mallionaire" };
    return request(app)
      .post("/api/users/login")
      .send(user)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe("username or password is incorrect");
      });
  });
});
describe("Protected endpoints", () => {
  describe("POST /api/reviews/:review_id/comments", () => {
    test("comments can be posted when logged in", () => {
      const testToken = jwt.sign({ test: "TEST TOKEN" }, KEY, { expiresIn: 5 });
      const newComment = {
        username: "mallionaire",
        body: "TEST COMMENT",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .set("x-access-token", testToken)
        .expect(201);
    });
    test("comments cannot be posted if not logged in", () => {
      jest.restoreAllMocks();
      const newComment = {
        username: "mallionaire",
        body: "TEST COMMENT",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(403)
        .then(({ body }) => {
          expect(body.message).toBe("login required");
        });
    });
  });
  describe("POST /api/reviews", () => {
    test("reviews can be posted when logged in", () => {
      const testToken = jwt.sign({ test: "TEST TOKEN" }, KEY, { expiresIn: 5 });
      const newReview = {
        owner: "mallionaire",
        title: "TEST GAME",
        review_body: "TEST REVIEW BODY",
        designer: "TEST DESIGNER",
        category: "dexterity",
        review_img_url:
          "https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .set("x-access-token", testToken)
        .expect(201);
    });
    test("reviews cannot be posted if not logged in", () => {
      const newReview = {
        owner: "mallionaire",
        title: "TEST GAME",
        review_body: "TEST REVIEW BODY",
        designer: "TEST DESIGNER",
        category: "dexterity",
        review_img_url:
          "https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(403)
        .then(({ body }) => {
          expect(body.message).toBe("login required");
        });
    });
  });
  describe("PATCH /api/reviews/:review_id", () => {
    test("users can vote when logged in", () => {
      const testToken = jwt.sign({ test: "TEST TOKEN" }, KEY, { expiresIn: 5 });
      return request(app)
        .patch("/api/reviews/2")
        .send({ inc_votes: 2 })
        .set("x-access-token", testToken)
        .expect(200);
    });
    test("users can not vote when not logged in", () => {
      return request(app)
        .patch("/api/reviews/2")
        .send({ inc_votes: 2 })
        .expect(403)
        .then(({ body }) => {
          expect(body.message).toBe("login required");
        });
    });
  });
  describe("PATCH /api/comments/:comment_id", () => {
    test("users can vote when logged in", () => {
      const testToken = jwt.sign({ test: "TEST TOKEN" }, KEY, { expiresIn: 5 });
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: 2 })
        .set("x-access-token", testToken)
        .expect(200);
    });
    test("users can not vote when not logged in", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: 2 })
        .expect(403)
        .then(({ body }) => {
          expect(body.message).toBe("login required");
        });
    });
  });
  describe("DELETE /api/reviews/:review_id", () => {
    test("users can delete reviews posted by themselves if logged in", () => {
      const testToken = jwt.sign({ username: "mallionaire" }, KEY, {
        expiresIn: 5,
      });
      return request(app)
        .delete("/api/reviews/1")
        .set("x-access-token", testToken)
        .expect(204);
    });
    test("users can not delete reviews posted by other users", () => {
      const testToken = jwt.sign({ username: "mallionaire" }, KEY, {
        expiresIn: 5,
      });
      return request(app)
        .delete("/api/reviews/2")
        .set("x-access-token", testToken)
        .expect(403);
    });
    test("reviews cannot be deleted if not logged in", () => {
      return request(app)
        .delete("/api/reviews/1")
        .expect(403)
        .then(({ body }) => {
          expect(body.message).toBe("login required");
        });
    });
    test("admins can delete reviews without being the owner", () => {
      const testToken = jwt.sign(
        { username: "mallionaire", accessLevel: "admin" },
        KEY,
        {
          expiresIn: 5,
        }
      );
      return request(app)
        .delete("/api/reviews/2")
        .set("x-access-token", testToken)
        .expect(204);
    });
  });
  describe("DELETE /api/comments/:comment_id", () => {
    test("users can delete comments posted by themselves if logged in", () => {
      const testToken = jwt.sign({ username: "mallionaire" }, KEY, {
        expiresIn: 5,
      });
      return request(app)
        .delete("/api/comments/2")
        .set("x-access-token", testToken)
        .expect(204);
    });
    test("users can not delete comments posted by other users", () => {
      const testToken = jwt.sign({ username: "mallionaire" }, KEY, {
        expiresIn: 5,
      });
      return request(app)
        .delete("/api/comments/1")
        .set("x-access-token", testToken)
        .expect(403);
    });
    test("comments cannot be deleted if not logged in", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(403)
        .then(({ body }) => {
          expect(body.message).toBe("login required");
        });
    });
    test("admins can delete comments without being the owner", () => {
      const testToken = jwt.sign(
        { username: "mallionaire", accessLevel: "admin" },
        KEY,
        {
          expiresIn: 5,
        }
      );
      return request(app)
        .delete("/api/comments/1")
        .set("x-access-token", testToken)
        .expect(204);
    });
  });
});
