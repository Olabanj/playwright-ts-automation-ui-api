import { Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  get cartItems() {
    return this.page.locator('.cart_item');
  }

  itemByName(name: string) {
    return this.cartItems.filter({ hasText: name });
  }

  async removeItem(name: string) {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout() {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }
}
