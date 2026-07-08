//Beginner: seed via API, verify via UI

import { expect, test } from "@fixtures/api.fixtures";

test.skip("user can view their order history", async ({ page, request }) => {
  // Fast setup via API — no UI interaction needed
  const userRes = await request.post("/api/users", { data: { email: "test@test.com" } });
  const { id: userId, token } = await userRes.json();
  await request.post("/api/orders", {
    data: { userId, product: "Widget", quantity: 1 },
    headers: { Authorization: `Bearer ${token}` },
  });

  // Now test ONLY the actual UI behavior you care about
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("test@test.com");
  // ... log in ...
  await page.goto("/orders");
  await expect(page.getByText("Widget")).toBeVisible();
});


//Intermediate: wrapping this in a fixture so tests don't repeat it

// export const test = base.extend<{ userWithOrder: { userId: string; token: string } }>({
//   userWithOrder: async ({ request }, use) => {
//     const userRes = await request.post("/api/users", { data: { email: `test-${Date.now()}@test.com` } });
//     const { id: userId, token } = await userRes.json();
//     await request.post("/api/orders", {
//       data: { userId, product: "Widget" },
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     await use({ userId, token });
//     await request.delete(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); // cleanup
//   },
// });

// test("user can view order history", async ({ page, userWithOrder }) => {
//   // setup already done — test starts right at the interesting part
//   await page.goto("/orders");
//   await expect(page.getByText("Widget")).toBeVisible();
// });


//Advanced: chaining multiple dependent API calls with data flowing between them
test.skip("guarantor is assigned liability after loan default", async ({ request }) => {
  const borrower = await (await request.post("/api/users", { data: { role: "member" } })).json();
  const guarantor = await (await request.post("/api/users", { data: { role: "member" } })).json();

  const loan = await (await request.post("/api/loans", {
    data: { borrowerId: borrower.id, guarantorId: guarantor.id, amount: 5000 },
  })).json();

  await request.post(`/api/loans/${loan.id}/disburse`);
  await request.post(`/api/loans/${loan.id}/mark-default`); // chained, depends on prior state

  const guarantorLiability = await (await request.get(`/api/users/${guarantor.id}/liabilities`)).json();
  expect(guarantorLiability.amount).toBe(5000);
});