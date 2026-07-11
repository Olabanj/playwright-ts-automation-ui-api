// Auth Patterns — Bearer Tokens, API Keys, OAuth in Test Setup

import { expect, test } from "@fixtures/api.fixtures";

//Beginner: bearer token

// Skipped: reference pattern only — /api/profile isn't a real endpoint yet
// (no baseURL configured, no backend behind it). Un-skip once wired to a
// real auth-protected API.
test.skip("authenticated request", async ({ request }) => {
  const response = await request.get("/api/profile", {
    headers: { Authorization: `Bearer ${process.env.TEST_API_TOKEN}` },
  });
  expect(response.status()).toBe(200);
});

//Beginner: API key

// Skipped: reference pattern only — /api/products isn't a real endpoint
// here either. Un-skip once wired to a real API-key-protected API.
test.skip("request with API key", async ({ request }) => {
  const response = await request.get("/api/products", {
    headers: { "X-API-Key": process.env.API_KEY! },
  });
  expect(response.status()).toBe(200);
});



//Intermediate: logging in once, reusing the token across tests
// export const test = base.extend<{ authToken: string }>({
//   authToken: async ({ request }, use) => {
//     const res = await request.post("/api/login", {
//       data: { email: "test@test.com", password: "secret" },
//     });
//     const { token } = await res.json();
//     await use(token); // every test that needs auth just requests this fixture
//   },
// });

// test("get profile with token", async ({ request, authToken }) => {
//   const res = await request.get("/api/profile", {
//     headers: { Authorization: `Bearer ${authToken}` },
//   });
//   expect(res.status()).toBe(200);
// });


//Advanced: OAuth flow in setup, reused via storage state

//For apps using OAuth (e.g., "Sign in with Google"), the standard approach is authenticating once in a setup step and reusing the resulting session for every test — logging in via a full OAuth flow in every test would be slow and flaky.

// auth.setup.ts — runs once before the whole suite
import { test as setup } from "@playwright/test";

// Skipped: illustrative only. This belongs in its own auth.setup.ts file,
// wired into playwright.config.ts as a "setup" project (see commented
// config below) — not meant to execute inline here against a real /login.
setup.skip("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  // ... complete OAuth flow (or, better, bypass it entirely via a test-only auth endpoint) ...
  await page.context().storageState({ path: "playwright/.auth/user.json" }); // save session
});

// playwright.config.ts
// export default defineConfig({
//   projects: [
//     { name: "setup", testMatch: /auth\.setup\.ts/ },
//     {
//       name: "chromium",
//       use: { storageState: "playwright/.auth/user.json" }, // reuse saved session
//       dependencies: ["setup"],
//     },
//   ],
// });

//Best practice: never run a real 3rd-party OAuth flow (actual Google/Facebook login) in every test — it's slow, flaky, and depends on infrastructure you don't control. Prefer a test-environment auth bypass endpoint if your team can provide one, and save/reuse storageState regardless.