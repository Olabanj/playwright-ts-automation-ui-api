import { test, expect } from '@fixtures/ui.fixtures';
import { InventoryPage } from '@pages/InventoryPage';
import { CartPage } from '@pages/CartPage';

test.describe('Cart page', () => {
  test.beforeEach(async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
  });

  test('shows the item added from the inventory page', async ({ loggedInPage }) => {
    const cartPage = new CartPage(loggedInPage);

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemByName('Sauce Labs Backpack')).toBeVisible();
  });

  test('removing an item empties the cart', async ({ loggedInPage }) => {
    const cartPage = new CartPage(loggedInPage);

    await cartPage.removeItem('Sauce Labs Backpack');

    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('checkout button navigates to checkout step one', async ({ loggedInPage }) => {
    const cartPage = new CartPage(loggedInPage);

    await cartPage.checkout();

    await expect(loggedInPage).toHaveURL(/checkout-step-one\.html/);
  });
});
