import { Page } from '@playwright/test';
import { UI_BASE_URL } from '../config/env';

export class LoginPage {
  readonly url = UI_BASE_URL;

  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(this.url);
  }

  async login(username: string, password: string) {
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}
