import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get errorMessage() {
    return this.page.locator('[data-test="error"]');
  }

  get totalLabel() {
    return this.page.locator('[data-test="total-label"]');
  }

  get completeHeader() {
    return this.page.locator('[data-test="complete-header"]');
  }

  async submitInfo(firstName: string, lastName: string, postalCode: string) {
    await this.page.getByPlaceholder('First Name').fill(firstName);
    await this.page.getByPlaceholder('Last Name').fill(lastName);
    await this.page.getByPlaceholder('Zip/Postal Code').fill(postalCode);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async finish() {
    await this.page.getByRole('button', { name: 'Finish' }).click();
  }
}
