import { test, expect } from '@fixtures/ui.fixtures';
import { InventoryPage } from '@pages/InventoryPage';

test.describe('Inventory page', () => {
  test('displays all six products', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);

    await expect(inventoryPage.products).toHaveCount(6);
  });

  test('sorting by price low to high orders products ascending', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);

    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getPrices();

    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('adding a product to the cart updates the cart badge', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);

    await inventoryPage.addToCart('Sauce Labs Backpack');

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('removing a product from the cart clears the cart badge', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.removeFromCart('Sauce Labs Backpack');

    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
});
