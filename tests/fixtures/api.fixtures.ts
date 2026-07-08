import { test as base, expect } from '@playwright/test';
import { JsonPlaceholderClient } from '../support/jsonPlaceholderClient';

export const test = base.extend<{ apiClient: JsonPlaceholderClient }>({
  apiClient: async ({}, use) => {
    const client = new JsonPlaceholderClient();
    await client.init();

    await use(client); // test body runs here

    await client.dispose(); // runs automatically after every test, pass or fail
  },
});

export { expect };
