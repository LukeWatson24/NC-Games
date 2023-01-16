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
        expect(body.message).toBe("path '/api/test' does not exist");
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
