const app = require("../app");
const request = require("supertest");
const testData = require("../db/data/test-data/index");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const { expect } = require("@jest/globals");

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
        const categories = body.categories;
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
        const reviews = body.reviews;
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
        const reviews = body.reviews;
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
        const review = body.review;
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
        expect(body.message).toBe("not found");
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

// describe("GET /api/reviews/:review_id/comments", () => {
//   it("should return 200 with an array of comments with correct keys", () => {
//     return request(app)
//       .get("/api/reviews/3/comments")
//       .expect(200)
//       .then(({ body }) => {
//         const comments = body.comments;
//         expect(Array.isArray(comments)).toBe(true);
//         comments.forEach((comment) => {});
//       });
//   });
// });
