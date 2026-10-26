const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, beforeEach, test } = require("node:test");

const requests = [];
let responseBody;
let responseStatus;
let auth;
let client;

const server = http.createServer(async (request, response) => {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
  }
  requests.push({
    method: request.method,
    url: request.url,
    headers: request.headers,
    body,
  });
  response.writeHead(responseStatus, { "Content-Type": "application/json" });
  response.end(JSON.stringify(responseBody));
});

before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  process.env.MYFOGLIO_BASE_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.MYFOGLIO_API_KEY = "test-api-key";
  process.env.MYFOGLIO_API_SECRET = "test-api-secret";
  process.env.API_VERSION = "1";
  auth = require("../dist/auth.js");
  client = require("../dist/client.js").createClient();
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

beforeEach(() => {
  delete process.env.MYFOGLIO_REFRESH_TOKEN;
  auth.clearCachedToken();
  requests.length = 0;
  responseStatus = 200;
  responseBody = { access_token: "test-access-token", expires_in: 3600 };
});

function assertTokenRequest(grantType) {
  const request = requests[0];
  assert.equal(request.method, "POST");
  assert.equal(request.url, "/Authorization");
  assert.equal(request.headers.accept, "application/vnd.myfoglio.v2+json");
  assert.equal(
    request.headers.authorization,
    `Basic ${Buffer.from("test-api-key:test-api-secret").toString("base64")}`
  );
  assert.match(request.headers["content-type"], /^application\/x-www-form-urlencoded/);
  const body = new URLSearchParams(request.body);
  assert.equal(body.get("grant_type"), grantType);
  return body;
}

test("client credentials use v2 even when resource requests use v1", async () => {
  assert.equal(await auth.ensureAccessToken(), "test-access-token");
  assertTokenRequest("client_credentials");
  assert.equal(auth.getDefaultAcceptHeader(), "application/vnd.myfoglio.v1+json");
  assert.equal(await auth.ensureAccessToken(), "test-access-token");
  assert.equal(requests.length, 1);

  await client.get("/Users");
  assert.equal(requests.length, 2);
  assert.equal(requests[1].headers.accept, "application/vnd.myfoglio.v1+json");
  assert.equal(requests[1].headers.authorization, "Bearer test-access-token");
});

test("refresh tokens use the same v2 authorization contract", async () => {
  process.env.MYFOGLIO_REFRESH_TOKEN = "test-refresh-token";
  auth.clearCachedToken();
  assert.equal(await auth.ensureAccessToken(), "test-access-token");
  const body = assertTokenRequest("refresh_token");
  assert.equal(body.get("refresh_token"), "test-refresh-token");
});

test("authorization failures are propagated without caching a token", async () => {
  responseStatus = 401;
  responseBody = { message: "Invalid credentials" };
  await assert.rejects(auth.ensureAccessToken(), (error) => error.response?.status === 401);
  assertTokenRequest("client_credentials");

  responseStatus = 200;
  responseBody = { access_token: "recovered-token", expires_in: 3600 };
  assert.equal(await auth.ensureAccessToken(), "recovered-token");
  assert.equal(requests.length, 2);
});
