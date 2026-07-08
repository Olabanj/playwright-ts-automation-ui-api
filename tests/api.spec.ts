import { test, expect } from './fixtures/api.fixtures';

test.describe('JSONPlaceholder API', () => {
  test('Get a request return a product via api', async ({ apiClient }) => {
    const response = await apiClient.getPosts();
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0].userId).toBe(1);
    expect(responseBody[0].id).toBe(1);
  });

  test('create a product via api', async ({ apiClient }) => {
    const response = await apiClient.createPost({
      title: 'New Product',
      body: 'This is a new product',
      userId: 1,
    });
    expect(response.status()).toBe(201);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe('New Product');
    expect(responseBody.body).toBe('This is a new product');
    expect(responseBody.userId).toBe(1);
  });

  test('update a product via api', async ({ apiClient }) => {
    const response = await apiClient.updatePost(1, {
      title: 'Updated Product',
      body: 'This is an updated product',
      userId: 1,
    });
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe('Updated Product');
    expect(responseBody.body).toBe('This is an updated product');
    expect(responseBody.userId).toBe(1);
  });

  test('delete a product via api', async ({ apiClient }) => {
    const response = await apiClient.deletePost(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  test('update a partial product via api', async ({ apiClient }) => {
    const response = await apiClient.patchPost(1, {
      title: 'Partially Updated Product',
    });
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.title).toBe('Partially Updated Product');
  });

  test('get a single product via api', async ({ apiClient }) => {
    const response = await apiClient.getPost(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.userId).toBe(1);
    expect(responseBody.id).toBe(1);
  });

  test('get a single product that does not exist via api', async ({ apiClient }) => {
    const response = await apiClient.getPost(9999);
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single product with invalid id via api', async ({ apiClient }) => {
    const response = await apiClient.getPost('invalid');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single product with invalid endpoint via api', async ({ apiClient }) => {
    const response = await apiClient.get('/invalid');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

  test('get a single a with a single comment via api', async ({ apiClient }) => {
    const response = await apiClient.getComment(1);
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.postId).toBe(1);
    expect(responseBody.id).toBe(1);
  });
});
