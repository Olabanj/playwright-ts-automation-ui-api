import { test, expect } from '@fixtures/ui.fixtures';
import { InventoryPage } from '@pages/InventoryPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();

    const cartPage = new CartPage(loggedInPage);
    await cartPage.checkout();
  });

  test('submitting with an empty first name shows a required-field error', async ({
    loggedInPage,
  }) => {
    const checkoutPage = new CheckoutPage(loggedInPage);

    await checkoutPage.submitInfo('', 'Doe', '12345');

    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
  });

  test('valid info proceeds to the order overview with the correct total', async ({
    loggedInPage,
  }) => {
    const checkoutPage = new CheckoutPage(loggedInPage);

    await checkoutPage.submitInfo('Jane', 'Doe', '12345');

    await expect(loggedInPage).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.totalLabel).toHaveText('Total: $32.39');
  });

  test('finishing the order shows the confirmation page', async ({ loggedInPage }) => {
    const checkoutPage = new CheckoutPage(loggedInPage);

    await checkoutPage.submitInfo('Jane', 'Doe', '12345');
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});
