import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';

test('user can log in with valid credentials', { tag: '@smoke' }, async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');

  await expect(page).toHaveURL(`${loginPage.url}/inventory.html`);
});
