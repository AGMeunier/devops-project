const request = require("supertest");
const app = require("../app");

const assert = require('assert');

describe("GET /health", function () {
    it("should reply 200 OK", async function () {
        const res = await request(app).get('/health');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.text, 'OK', 'unexpected /health body');
    });
});