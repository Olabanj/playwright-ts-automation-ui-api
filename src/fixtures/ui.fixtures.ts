import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await use(page); // test body runs here, already logged in

    // no explicit teardown needed — Playwright tears down the page/context itself
  },
});

export { expect };
