import { Page } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  get products() {
    return this.page.locator('.inventory_item');
  }

  get cartBadge() {
    return this.page.locator('[data-test="shopping-cart-badge"]');
  }

  get sortDropdown() {
    return this.page.locator('[data-test="product-sort-container"]');
  }

  productByName(name: string) {
    return this.products.filter({ hasText: name });
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(option);
  }

  async addToCart(name: string) {
    await this.productByName(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string) {
    await this.productByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async goToCart() {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.page.locator('[data-test="inventory-item-price"]').allTextContents();
    return texts.map((text) => parseFloat(text.replace('$', '')));
  }
}
